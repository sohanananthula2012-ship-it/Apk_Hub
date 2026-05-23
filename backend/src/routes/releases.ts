import { Router, Response, Request } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuid } from 'uuid'
import db, { UPLOADS_DIR } from '../db'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { parseApk } from '../utils/apkParser'

const router = Router()

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const id = uuid()
    cb(null, `${id}.apk`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/vnd.android.package-archive' ||
        file.originalname.toLowerCase().endsWith('.apk')) {
      cb(null, true)
    } else {
      cb(new Error('Only .apk files are allowed'))
    }
  },
})

// GET /api/update/:packageName — SDK endpoint
router.get('/update/:packageName', (req: Request, res: Response): void => {
  const apiKey = req.headers['x-api-key'] as string
  if (!apiKey?.startsWith('pk_')) {
    res.status(401).json({ error: 'Missing or invalid public API key' })
    return
  }

  const app = db.prepare('SELECT * FROM apps WHERE package_name = ? AND public_key = ?')
    .get(req.params.packageName, apiKey) as any
  if (!app) {
    res.status(404).json({ error: 'App not found or invalid API key' })
    return
  }

  const channel = (req.query.channel as string) || 'stable'
  const installed = parseInt(req.query.installed as string) || 0

  const release = db.prepare(`
    SELECT * FROM releases
    WHERE app_id = ? AND channel = ? AND status = 'live'
    ORDER BY version_code DESC LIMIT 1
  `).get(app.id, channel) as any

  if (!release || release.version_code <= installed) {
    res.json({ updateAvailable: false })
    return
  }

  // Downgrade protection
  if (release.version_code < installed && !release.allow_downgrade) {
    res.json({ updateAvailable: false })
    return
  }

  // Track that we served an update check (download tracked separately)
  const downloadUrl = `${req.protocol}://${req.get('host')}/api/releases/${release.id}/download`

  res.json({
    updateAvailable: true,
    latestVersion: release.version_name,
    versionCode: release.version_code,
    downloadUrl,
    sha256: release.sha256,
    mandatory: Boolean(release.mandatory),
    releaseNotes: release.release_notes,
    rolloutPercent: release.rollout_percent,
    channel: release.channel,
    certificateFingerprint: release.cert_fingerprint,
  })
})

// GET /api/releases/:id/download — serve APK file
router.get('/:id/download', (req: Request, res: Response): void => {
  const release = db.prepare(`
    SELECT r.*, a.public_key FROM releases r
    JOIN apps a ON a.id = r.app_id
    WHERE r.id = ?
  `).get(req.params.id) as any

  if (!release) { res.status(404).json({ error: 'Release not found' }); return }

  if (!fs.existsSync(release.apk_path)) {
    res.status(404).json({ error: 'APK file not found on disk' })
    return
  }

  // Increment download counter
  db.prepare('UPDATE releases SET downloads = downloads + 1 WHERE id = ?').run(release.id)

  res.download(release.apk_path, `${release.version_name}.apk`)
})

// POST /api/releases/upload — upload APK (authenticated)
router.post('/upload', requireAuth, upload.single('apk'), async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No APK file provided' })
    return
  }

  const { app_id, channel = 'stable', rollout_percent = '100', mandatory = 'false',
          release_notes = '', allow_downgrade = 'false', update_strategy = 'FLEXIBLE' } = req.body

  if (!app_id) {
    fs.unlinkSync(req.file.path)
    res.status(400).json({ error: 'app_id is required' })
    return
  }

  // Verify the app belongs to this user
  const app = db.prepare('SELECT * FROM apps WHERE id = ? AND owner_id = ?')
    .get(app_id, req.userId) as any
  if (!app) {
    fs.unlinkSync(req.file.path)
    res.status(403).json({ error: 'App not found or access denied' })
    return
  }

  try {
    const meta = await parseApk(req.file.path)

    // Verify package name matches
    if (meta.packageName && meta.packageName !== app.package_name) {
      fs.unlinkSync(req.file.path)
      res.status(400).json({
        error: `APK package name (${meta.packageName}) does not match registered app (${app.package_name})`
      })
      return
    }

    // Certificate fingerprint enforcement
    if (app.cert_fingerprint && meta.certFingerprint && app.cert_fingerprint !== meta.certFingerprint) {
      fs.unlinkSync(req.file.path)
      res.status(400).json({
        error: 'Certificate fingerprint mismatch. APK must be signed with the same key as the first upload.'
      })
      return
    }

    // Downgrade protection
    const latestRelease = db.prepare(`
      SELECT version_code FROM releases WHERE app_id = ? ORDER BY version_code DESC LIMIT 1
    `).get(app_id) as any

    if (latestRelease && meta.versionCode <= latestRelease.version_code && allow_downgrade !== 'true') {
      fs.unlinkSync(req.file.path)
      res.status(400).json({
        error: `versionCode ${meta.versionCode} is not greater than current latest (${latestRelease.version_code}). Enable "Allow downgrade" to override.`
      })
      return
    }

    // Store cert fingerprint on first upload
    if (!app.cert_fingerprint && meta.certFingerprint) {
      db.prepare('UPDATE apps SET cert_fingerprint = ? WHERE id = ?').run(meta.certFingerprint, app_id)
    }

    const releaseId = uuid()
    db.prepare(`
      INSERT INTO releases (
        id, app_id, version_name, version_code, channel, status,
        rollout_percent, mandatory, allow_downgrade, update_strategy,
        release_notes, apk_path, apk_size, sha256, cert_fingerprint,
        min_sdk, target_sdk
      ) VALUES (?, ?, ?, ?, ?, 'live', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      releaseId, app_id,
      meta.versionName, meta.versionCode,
      channel, parseInt(rollout_percent),
      mandatory === 'true' ? 1 : 0,
      allow_downgrade === 'true' ? 1 : 0,
      update_strategy,
      release_notes,
      req.file.path, meta.sizeBytes,
      meta.sha256, meta.certFingerprint,
      meta.minSdk, meta.targetSdk
    )

    res.status(201).json({
      release: {
        id: releaseId,
        version_name: meta.versionName,
        version_code: meta.versionCode,
        sha256: meta.sha256,
        cert_fingerprint: meta.certFingerprint,
        min_sdk: meta.minSdk,
        target_sdk: meta.targetSdk,
        apk_size: meta.sizeBytes,
        channel,
        status: 'live',
      }
    })
  } catch (err: any) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
    res.status(400).json({ error: err.message || 'Failed to parse APK' })
  }
})

// PATCH /api/releases/:id — update rollout/status/mandatory
router.patch('/:id', requireAuth, (req: AuthRequest, res: Response): void => {
  const release = db.prepare(`
    SELECT r.* FROM releases r
    JOIN apps a ON a.id = r.app_id
    WHERE r.id = ? AND a.owner_id = ?
  `).get(req.params.id, req.userId) as any

  if (!release) { res.status(404).json({ error: 'Release not found' }); return }

  const { rollout_percent, status, mandatory, release_notes } = req.body
  db.prepare(`
    UPDATE releases SET
      rollout_percent = COALESCE(?, rollout_percent),
      status = COALESCE(?, status),
      mandatory = COALESCE(?, mandatory),
      release_notes = COALESCE(?, release_notes)
    WHERE id = ?
  `).run(
    rollout_percent ?? null,
    status ?? null,
    mandatory !== undefined ? (mandatory ? 1 : 0) : null,
    release_notes ?? null,
    req.params.id
  )
  res.json({ ok: true })
})

// POST /api/releases/from-drive — submit a Google Drive link
router.post('/from-drive', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { app_id, drive_url, channel = 'stable', rollout_percent = 100,
          mandatory = false, release_notes = '', allow_downgrade = false, update_strategy = 'FLEXIBLE' } = req.body

  if (!app_id || !drive_url) {
    res.status(400).json({ error: 'app_id and drive_url are required' })
    return
  }

  const app = db.prepare('SELECT * FROM apps WHERE id = ? AND owner_id = ?')
    .get(app_id, req.userId) as any
  if (!app) { res.status(403).json({ error: 'App not found' }); return }

  // Convert Drive share link to direct download
  const fileIdMatch = drive_url.match(/\/file\/d\/([^/]+)/) ||
                      drive_url.match(/[?&]id=([^&]+)/) ||
                      drive_url.match(/open\?id=([^&]+)/)
  if (!fileIdMatch) {
    res.status(400).json({ error: 'Could not extract Google Drive file ID from URL' })
    return
  }

  const fileId = fileIdMatch[1]
  const directUrl = `https://drive.google.com/uc?export=download&confirm=t&id=${fileId}`

  // Download the APK from Drive
  const destPath = path.join(UPLOADS_DIR, `${uuid()}.apk`)
  try {
    const https = require('https')
    const http = require('http')
    await new Promise<void>((resolve, reject) => {
      const follow = (url: string) => {
        const lib = url.startsWith('https') ? https : http
        lib.get(url, (r: any) => {
          if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
            return follow(r.headers.location)
          }
          if (r.statusCode !== 200) return reject(new Error(`HTTP ${r.statusCode} from Drive`))
          const out = fs.createWriteStream(destPath)
          r.pipe(out)
          out.on('finish', resolve)
          out.on('error', reject)
        }).on('error', reject)
      }
      follow(directUrl)
    })

    const meta = await parseApk(destPath)

    if (meta.packageName && meta.packageName !== app.package_name) {
      fs.unlinkSync(destPath)
      res.status(400).json({ error: `APK package name (${meta.packageName}) does not match app (${app.package_name})` })
      return
    }

    if (app.cert_fingerprint && meta.certFingerprint && app.cert_fingerprint !== meta.certFingerprint) {
      fs.unlinkSync(destPath)
      res.status(400).json({ error: 'Certificate fingerprint mismatch' })
      return
    }

    const latest = db.prepare('SELECT version_code FROM releases WHERE app_id = ? ORDER BY version_code DESC LIMIT 1').get(app_id) as any
    if (latest && meta.versionCode <= latest.version_code && !allow_downgrade) {
      fs.unlinkSync(destPath)
      res.status(400).json({ error: `versionCode ${meta.versionCode} is not newer than ${latest.version_code}` })
      return
    }

    if (!app.cert_fingerprint && meta.certFingerprint) {
      db.prepare('UPDATE apps SET cert_fingerprint = ? WHERE id = ?').run(meta.certFingerprint, app_id)
    }

    const releaseId = uuid()
    db.prepare(`
      INSERT INTO releases (id, app_id, version_name, version_code, channel, status,
        rollout_percent, mandatory, allow_downgrade, update_strategy, release_notes,
        apk_path, apk_size, sha256, cert_fingerprint, min_sdk, target_sdk)
      VALUES (?, ?, ?, ?, ?, 'live', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      releaseId, app_id, meta.versionName, meta.versionCode, channel,
      rollout_percent, mandatory ? 1 : 0, allow_downgrade ? 1 : 0,
      update_strategy, release_notes, destPath, meta.sizeBytes,
      meta.sha256, meta.certFingerprint, meta.minSdk, meta.targetSdk
    )

    res.status(201).json({ release: { id: releaseId, version_name: meta.versionName, sha256: meta.sha256 } })
  } catch (err: any) {
    if (fs.existsSync(destPath)) fs.unlinkSync(destPath)
    res.status(400).json({ error: err.message || 'Failed to fetch/parse APK from Drive' })
  }
})

export default router
