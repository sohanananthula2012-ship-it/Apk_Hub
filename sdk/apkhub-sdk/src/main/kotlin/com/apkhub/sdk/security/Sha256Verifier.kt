package com.apkhub.sdk.security

import java.io.File
import java.security.MessageDigest

/**
 * Verifies the SHA-256 hash of a downloaded APK to ensure integrity
 * before passing it to the Android installer.
 */
object Sha256Verifier {

    /**
     * Returns the lowercase hex SHA-256 hash of [file].
     */
    fun hashOf(file: File): String {
        val digest = MessageDigest.getInstance("SHA-256")
        file.inputStream().use { stream ->
            val buffer = ByteArray(8192)
            var read: Int
            while (stream.read(buffer).also { read = it } != -1) {
                digest.update(buffer, 0, read)
            }
        }
        return digest.digest().joinToString("") { "%02x".format(it) }
    }

    /**
     * Returns true when the [file]'s hash matches [expectedHash] (case-insensitive).
     */
    fun verify(file: File, expectedHash: String): Boolean =
        hashOf(file).equals(expectedHash.trim(), ignoreCase = true)
}
