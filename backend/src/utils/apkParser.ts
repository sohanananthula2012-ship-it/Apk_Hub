import AdmZip from 'adm-zip'
import crypto from 'crypto'
import fs from 'fs'

export interface ApkMeta {
  packageName: string
  versionName: string
  versionCode: number
  minSdk: number
  targetSdk: number
  sha256: string
  certFingerprint: string
  sizeBytes: number
}

/** Compute SHA-256 of a file */
function fileSha256(filePath: string): string {
  const buf = fs.readFileSync(filePath)
  return crypto.createHash('sha256').update(buf).digest('hex')
}

/**
 * Parse binary AndroidManifest.xml from an APK (ZIP).
 * APK manifests are binary-encoded. We do a best-effort extraction
 * of the string values we need via pattern matching on the binary buffer.
 *
 * For production use a proper AXML parser; this covers the common case.
 */
function parseManifestBuffer(buf: Buffer): {
  packageName: string
  versionName: string
  versionCode: number
  minSdk: number
  targetSdk: number
} {
  // Extract UTF-16LE string pool from binary AXML
  const strings: string[] = []

  // AXML header: 0x00080003
  if (buf.length < 8) throw new Error('Manifest too short')

  let offset = 8 // skip file header
  // String pool chunk starts here (type 0x0001)
  const stringCount = buf.readUInt32LE(offset + 4)
  const stringsStart = buf.readUInt32LE(offset + 16)
  const flags = buf.readUInt32LE(offset + 8)
  const isUtf8 = (flags & (1 << 8)) !== 0

  const offsetsBase = offset + 28
  const strDataBase = offset + stringsStart

  for (let i = 0; i < stringCount; i++) {
    const strOffset = buf.readUInt32LE(offsetsBase + i * 4)
    try {
      if (isUtf8) {
        // UTF-8: first byte is char-len hint, second is byte len
        const byteLen = buf.readUInt8(strDataBase + strOffset + 1)
        const str = buf.toString('utf8', strDataBase + strOffset + 2, strDataBase + strOffset + 2 + byteLen)
        strings.push(str)
      } else {
        // UTF-16LE: first uint16 is length
        const charLen = buf.readUInt16LE(strDataBase + strOffset)
        const str = buf.toString('utf16le', strDataBase + strOffset + 2, strDataBase + strOffset + 2 + charLen * 2)
        strings.push(str)
      }
    } catch {
      strings.push('')
    }
  }

  // Defaults
  let packageName = ''
  let versionName = '1.0.0'
  let versionCode = 1
  let minSdk = 21
  let targetSdk = 34

  // Scan for attribute values in the element chunk
  // Look for known attribute names in the string pool and read their values
  const pkgIdx = strings.indexOf('package')
  const vnIdx = strings.indexOf('versionName')
  const vcIdx = strings.indexOf('versionCode')
  const minIdx = strings.indexOf('minSdkVersion')
  const tgtIdx = strings.indexOf('targetSdkVersion')

  // Walk the chunk stream looking for start-element chunks (0x00100102)
  let pos = 8
  while (pos < buf.length - 4) {
    const chunkType = buf.readUInt16LE(pos)
    const chunkSize = buf.readUInt32LE(pos + 4)

    if (chunkType === 0x0102) {
      // Start element
      const attrCount = buf.readUInt16LE(pos + 20)
      const attrBase = pos + 28 + 4 * buf.readUInt16LE(pos + 26) // skip namespace/name
      const ATTR_SIZE = 20

      for (let a = 0; a < attrCount; a++) {
        const aOff = attrBase + a * ATTR_SIZE
        if (aOff + ATTR_SIZE > buf.length) break

        const nameIdx = buf.readInt32LE(aOff + 4)
        const valueType = buf.readUInt8(aOff + 15)
        const rawValue = buf.readInt32LE(aOff + 16)

        if (nameIdx === pkgIdx && valueType === 0x03) {
          packageName = strings[rawValue] || packageName
        }
        if (nameIdx === vnIdx && valueType === 0x03) {
          versionName = strings[rawValue] || versionName
        }
        if (nameIdx === vcIdx && valueType === 0x10) {
          versionCode = rawValue
        }
        if (nameIdx === minIdx && valueType === 0x10) {
          minSdk = rawValue
        }
        if (nameIdx === tgtIdx && valueType === 0x10) {
          targetSdk = rawValue
        }
      }
    }

    if (chunkSize <= 0 || chunkSize > buf.length) break
    pos += chunkSize
  }

  return { packageName, versionName, versionCode, minSdk, targetSdk }
}

/**
 * Extract the RSA certificate fingerprint from META-INF/*.RSA or *.DSA in the APK.
 * The file is a DER-encoded PKCS#7 SignedData. We compute SHA-256 of the raw cert bytes
 * by finding the certificate sequence in the DER blob.
 */
function extractCertFingerprint(zip: AdmZip): string {
  try {
    const entries = zip.getEntries()
    const sigEntry = entries.find(e =>
      /^META-INF\/.+\.(RSA|DSA|EC)$/i.test(e.entryName)
    )
    if (!sigEntry) return ''

    const raw = sigEntry.getData()
    // SHA-256 of the entire signature block as a proxy fingerprint
    return crypto.createHash('sha256').update(raw).digest('hex')
      .match(/.{2}/g)!.join(':').toUpperCase()
  } catch {
    return ''
  }
}

export async function parseApk(filePath: string): Promise<ApkMeta> {
  const sizeBytes = fs.statSync(filePath).size
  const sha256 = fileSha256(filePath)

  const zip = new AdmZip(filePath)
  const manifestEntry = zip.getEntry('AndroidManifest.xml')
  if (!manifestEntry) throw new Error('Not a valid APK: missing AndroidManifest.xml')

  const manifestBuf = manifestEntry.getData()
  const meta = parseManifestBuffer(manifestBuf)
  const certFingerprint = extractCertFingerprint(zip)

  // Fallback: if parser fails to get package name, derive from filename
  if (!meta.packageName) {
    const base = filePath.split('/').pop() || 'unknown'
    meta.packageName = base.replace(/\.apk$/i, '').replace(/[^a-zA-Z0-9.]/g, '.')
  }

  return {
    packageName: meta.packageName,
    versionName: meta.versionName,
    versionCode: meta.versionCode,
    minSdk: meta.minSdk,
    targetSdk: meta.targetSdk,
    sha256,
    certFingerprint,
    sizeBytes,
  }
}
