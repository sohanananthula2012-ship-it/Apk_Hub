package com.apkhub.sdk.network

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import com.apkhub.sdk.model.ApkHubConfig
import com.apkhub.sdk.model.UpdateInfo
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/**
 * Contacts the APK Hub backend to check whether a newer version
 * of the host app is available.
 *
 * Only the **public key** (`pk_`) is sent in requests — it is safe to
 * include in APKs. The secret key (`sk_`) is only used by your backend.
 */
class UpdateChecker(
    private val context: Context,
    private val config: ApkHubConfig
) {

    /**
     * Result sealed class returned by [check].
     */
    sealed class CheckResult {
        data class Success(val info: UpdateInfo) : CheckResult()
        data class Error(val message: String, val cause: Throwable? = null) : CheckResult()
        object NoUpdate : CheckResult()
    }

    /**
     * Suspending function – call from a coroutine (e.g. lifecycleScope.launch).
     * Compares the installed versionCode against the latest one on the server.
     *
     * Downgrade protection: even if the server somehow returns a lower versionCode,
     * this returns [CheckResult.NoUpdate] unless [ApkHubConfig.allowDowngrade] is true.
     */
    suspend fun check(): CheckResult = withContext(Dispatchers.IO) {
        try {
            val installedVersionCode = getInstalledVersionCode()
            val endpoint = "${config.apiBaseUrl}/update/${config.packageName}" +
                    "?channel=${config.channel}&installed=$installedVersionCode"

            val connection = (URL(endpoint).openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                // Public key only — safe to transmit; never send sk_ from the SDK
                setRequestProperty("X-Api-Key", config.publicKey)
                setRequestProperty("X-SDK-Version", SDK_VERSION)
                setRequestProperty("X-Android-SDK", Build.VERSION.SDK_INT.toString())
                connectTimeout = 10_000
                readTimeout    = 10_000
            }

            val responseCode = connection.responseCode
            if (responseCode != 200) {
                return@withContext CheckResult.Error("Server returned HTTP $responseCode")
            }

            val body = connection.inputStream.bufferedReader().readText()
            val info = UpdateInfo.fromJson(JSONObject(body))

            if (!info.updateAvailable) {
                return@withContext CheckResult.NoUpdate
            }

            // Downgrade protection
            if (info.versionCode <= installedVersionCode && !config.allowDowngrade) {
                return@withContext CheckResult.NoUpdate
            }

            CheckResult.Success(info)
        } catch (e: Exception) {
            CheckResult.Error("Network error: ${e.message}", e)
        }
    }

    private fun getInstalledVersionCode(): Long {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                context.packageManager
                    .getPackageInfo(config.packageName, 0)
                    .longVersionCode
            } else {
                @Suppress("DEPRECATION")
                context.packageManager
                    .getPackageInfo(config.packageName, 0)
                    .versionCode.toLong()
            }
        } catch (e: PackageManager.NameNotFoundException) {
            0L
        }
    }

    companion object {
        const val SDK_VERSION = "1.1.0"
    }
}
