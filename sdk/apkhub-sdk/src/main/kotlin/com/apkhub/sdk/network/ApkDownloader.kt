package com.apkhub.sdk.network

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import com.apkhub.sdk.model.ApkHubConfig
import com.apkhub.sdk.model.UpdateInfo
import com.apkhub.sdk.security.Sha256Verifier
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.net.HttpURLConnection
import java.net.URL

/**
 * Downloads the APK from [UpdateInfo.downloadUrl] — always an APK Hub CDN/proxy
 * URL, never a raw Google Drive or third-party link — and verifies its SHA-256 hash.
 *
 * Progress is reported via [onProgress] as a value 0–100.
 */
class ApkDownloader(
    private val context: Context,
    private val config: ApkHubConfig
) {

    sealed class DownloadResult {
        data class Success(val file: File) : DownloadResult()
        data class Error(val message: String, val cause: Throwable? = null) : DownloadResult()
        object MeteredNetworkBlocked : DownloadResult()
    }

    suspend fun download(
        info: UpdateInfo,
        onProgress: ((Int) -> Unit)? = null
    ): DownloadResult = withContext(Dispatchers.IO) {

        // Metered network guard
        if (!config.allowMeteredNetwork && isMeteredNetwork()) {
            return@withContext DownloadResult.MeteredNetworkBlocked
        }

        // Validate that the URL is an APK Hub domain — never download from raw Drive links
        val downloadUrl = info.downloadUrl
        if (downloadUrl.isBlank()) {
            return@withContext DownloadResult.Error("Download URL is empty.")
        }
        if (!isApkHubUrl(downloadUrl)) {
            return@withContext DownloadResult.Error(
                "Rejected download from untrusted host: $downloadUrl. " +
                "The SDK only downloads from APK Hub CDN endpoints."
            )
        }

        val destFile = File(
            context.getExternalFilesDir(null),
            "apkhub_update_${info.versionCode}.apk"
        )

        try {
            val connection = (URL(downloadUrl).openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = 15_000
                readTimeout    = 60_000
            }

            val contentLength = connection.contentLengthLong
            var downloadedBytes = 0L

            connection.inputStream.use { input ->
                destFile.outputStream().use { output ->
                    val buffer = ByteArray(8192)
                    var read: Int
                    while (input.read(buffer).also { read = it } != -1) {
                        output.write(buffer, 0, read)
                        downloadedBytes += read
                        if (contentLength > 0) {
                            val progress = ((downloadedBytes * 100) / contentLength).toInt()
                            onProgress?.invoke(progress)
                        }
                    }
                }
            }

            // Integrity check
            if (info.sha256.isNotBlank() && !Sha256Verifier.verify(destFile, info.sha256)) {
                destFile.delete()
                return@withContext DownloadResult.Error(
                    "SHA-256 mismatch — download corrupted or tampered."
                )
            }

            DownloadResult.Success(destFile)
        } catch (e: Exception) {
            destFile.takeIf { it.exists() }?.delete()
            DownloadResult.Error("Download failed: ${e.message}", e)
        }
    }

    /**
     * Ensures the download URL belongs to an APK Hub CDN domain.
     * This prevents the SDK from ever fetching raw Google Drive or arbitrary URLs
     * even if someone tampers with a cached API response.
     */
    private fun isApkHubUrl(url: String): Boolean {
        val host = runCatching { URL(url).host }.getOrNull() ?: return false
        return host.endsWith("apkhub.com") || host.endsWith("apkhub.dev")
    }

    private fun isMeteredNetwork(): Boolean {
        val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val network = cm.activeNetwork ?: return true
            val caps = cm.getNetworkCapabilities(network) ?: return true
            !caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_NOT_METERED)
        } else {
            @Suppress("DEPRECATION")
            cm.isActiveNetworkMetered
        }
    }
}
