package com.apkhub.sdk.model

import org.json.JSONObject

/**
 * Holds the update metadata returned by the APK Hub backend.
 *
 * The [downloadUrl] is always an APK Hub CDN/proxy URL — never a raw
 * Google Drive or third-party storage link. The backend resolves, validates,
 * and re-serves the file so the SDK stays storage-provider agnostic.
 */
data class UpdateInfo(
    val updateAvailable: Boolean,
    val latestVersion: String,
    val versionCode: Int,
    /** APK Hub CDN/proxy download URL — never a raw Drive or storage link. */
    val downloadUrl: String,
    val sha256: String,
    val mandatory: Boolean,
    val releaseNotes: String,
    val channel: String = "stable",
    /**
     * SHA-256 fingerprint of the APK signing certificate (hex, colon-separated).
     * The SDK may surface this for informational display; actual enforcement
     * happens server-side on every upload.
     */
    val certificateFingerprint: String = ""
) {
    companion object {
        fun fromJson(json: JSONObject): UpdateInfo = UpdateInfo(
            updateAvailable        = json.optBoolean("updateAvailable", false),
            latestVersion          = json.optString("latestVersion", ""),
            versionCode            = json.optInt("versionCode", 0),
            downloadUrl            = json.optString("downloadUrl", ""),
            sha256                 = json.optString("sha256", ""),
            mandatory              = json.optBoolean("mandatory", false),
            releaseNotes           = json.optString("releaseNotes", ""),
            channel                = json.optString("channel", "stable"),
            certificateFingerprint = json.optString("certificateFingerprint", "")
        )
    }
}
