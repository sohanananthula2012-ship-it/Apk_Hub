package com.apkhub.sdk.util

/**
 * Google Drive URL utilities — **backend use only**.
 *
 * The SDK itself never fetches Drive URLs directly. This utility lives here
 * as a reference for what the APK Hub backend does before serving a
 * [com.apkhub.sdk.model.UpdateInfo.downloadUrl] to the SDK.
 *
 * Flow:
 *  1. Developer pastes a Drive share link into the APK Hub dashboard.
 *  2. Backend calls [toDriveDirectDownload] to resolve a direct-download URL.
 *  3. Backend downloads, validates, and re-hosts the APK on the APK Hub CDN.
 *  4. SDK receives `https://cdn.apkhub.com/temp/<token>` — never a Drive link.
 *
 * Supported input formats:
 *  - `https://drive.google.com/file/d/{fileId}/view?usp=sharing`
 *  - `https://drive.google.com/open?id={fileId}`
 *  - `https://docs.google.com/uc?export=download&id={fileId}`
 *  - Raw file IDs
 */
object DriveUrlUtils {

    private val FILE_ID_PATTERNS = listOf(
        Regex("""/file/d/([a-zA-Z0-9_\-]+)"""),
        Regex("""[?&]id=([a-zA-Z0-9_\-]+)"""),
        Regex("""open\?id=([a-zA-Z0-9_\-]+)"""),
    )

    /**
     * Returns a direct-download URL for a Google Drive file or null if the
     * input cannot be parsed as a Drive link.
     *
     * Example:
     * ```
     * val direct = DriveUrlUtils.toDriveDirectDownload(
     *     "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/view"
     * )
     * // → "https://drive.google.com/uc?export=download&confirm=t&id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
     * ```
     */
    fun toDriveDirectDownload(input: String): String? {
        val fileId = extractFileId(input.trim()) ?: return null
        return "https://drive.google.com/uc?export=download&confirm=t&id=$fileId"
    }

    /**
     * Returns true if [url] looks like any known Google Drive share/view/open URL.
     */
    fun isDriveUrl(url: String): Boolean {
        val lower = url.lowercase()
        return lower.contains("drive.google.com") || lower.contains("docs.google.com/uc")
    }

    /**
     * Extracts the file ID from any supported Drive URL variant,
     * or returns the input as-is if it looks like a raw file ID.
     */
    fun extractFileId(input: String): String? {
        if (!input.startsWith("http")) {
            // Treat plain strings that match an ID pattern as raw file IDs
            return if (input.matches(Regex("[a-zA-Z0-9_\\-]{20,}"))) input else null
        }
        for (pattern in FILE_ID_PATTERNS) {
            val match = pattern.find(input)
            if (match != null) return match.groupValues[1]
        }
        return null
    }
}
