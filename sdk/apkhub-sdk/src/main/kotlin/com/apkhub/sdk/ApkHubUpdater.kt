package com.apkhub.sdk

import android.content.Context
import com.apkhub.sdk.install.ApkInstaller
import com.apkhub.sdk.model.ApkHubConfig
import com.apkhub.sdk.model.UpdateInfo
import com.apkhub.sdk.model.UpdateStrategy
import com.apkhub.sdk.network.ApkDownloader
import com.apkhub.sdk.network.UpdateChecker

/**
 *  ╔══════════════════════════════════════════════╗
 *  ║         APK Hub Updater  –  v1.1.0          ║
 *  ║  The single entry-point for host apps.       ║
 *  ╚══════════════════════════════════════════════╝
 *
 *  ## Quick-start
 *
 *  ```kotlin
 *  // 1. Build the config once (e.g. in Application.onCreate)
 *  //    Use your PUBLIC key (pk_) — never the secret key (sk_).
 *  val config = ApkHubConfig(
 *      packageName = "com.example.myapp",
 *      publicKey   = BuildConfig.APKHUB_PUBLIC_KEY   // pk_live_…
 *  )
 *
 *  // 2. Create the updater
 *  val updater = ApkHubUpdater(applicationContext, config)
 *
 *  // 3. Check & update (call from a coroutine)
 *  lifecycleScope.launch {
 *      updater.checkAndUpdate(
 *          onUpdateFound      = { info -> /* show dialog, return true to proceed */ },
 *          onNoUpdate         = { /* already up to date */ },
 *          onDownloadProgress = { pct -> progressBar.progress = pct },
 *          onReadyToInstall   = { /* SDK triggers installer automatically */ },
 *          onError            = { msg -> Log.e("APKHub", msg) }
 *      )
 *  }
 *  ```
 *
 *  ## Update strategies
 *
 *  - [UpdateStrategy.FLEXIBLE]  – notify + optional prompt (default)
 *  - [UpdateStrategy.IMMEDIATE] – block the app until update is installed
 *
 *  Set via `ApkHubConfig(updateStrategy = UpdateStrategy.IMMEDIATE)`.
 */
class ApkHubUpdater(
    private val context: Context,
    private val config: ApkHubConfig
) {

    private val checker    = UpdateChecker(context, config)
    private val downloader = ApkDownloader(context, config)

    // ── Check only ────────────────────────────────────────────────────────────

    /**
     * Checks for an update and returns the result without downloading anything.
     */
    suspend fun check(): UpdateChecker.CheckResult = checker.check()

    // ── Check + optionally download + install ─────────────────────────────────

    /**
     * Runs the full update flow:
     * 1. Check for update
     * 2. Notify [onUpdateFound] (caller decides whether to proceed)
     * 3. Download APK with SHA-256 verification
     * 4. Trigger system installer
     *
     * When [ApkHubConfig.updateStrategy] is [UpdateStrategy.IMMEDIATE], [onUpdateFound]
     * is called but its return value is ignored — the download always proceeds.
     *
     * All callbacks are optional and executed on the calling coroutine dispatcher.
     */
    suspend fun checkAndUpdate(
        onUpdateFound: suspend (UpdateInfo) -> Boolean = { true },
        onNoUpdate: (() -> Unit)? = null,
        onDownloadProgress: ((Int) -> Unit)? = null,
        onReadyToInstall: (() -> Unit)? = null,
        onError: ((String) -> Unit)? = null
    ) {
        when (val result = checker.check()) {
            is UpdateChecker.CheckResult.NoUpdate -> onNoUpdate?.invoke()

            is UpdateChecker.CheckResult.Error ->
                onError?.invoke(result.message)

            is UpdateChecker.CheckResult.Success -> {
                val info = result.info

                val proceed = if (config.updateStrategy == UpdateStrategy.IMMEDIATE) {
                    onUpdateFound(info) // inform caller but always proceed
                    true
                } else {
                    onUpdateFound(info)
                }

                if (!proceed) return
                downloadAndInstall(info, onDownloadProgress, onReadyToInstall, onError)
            }
        }
    }

    // ── Download + install ────────────────────────────────────────────────────

    /**
     * Downloads [info] and opens the system installer.
     * The [UpdateInfo.downloadUrl] is always an APK Hub CDN URL — raw Google Drive
     * or other storage links are rejected by [ApkDownloader].
     */
    suspend fun downloadAndInstall(
        info: UpdateInfo,
        onProgress: ((Int) -> Unit)? = null,
        onReadyToInstall: (() -> Unit)? = null,
        onError: ((String) -> Unit)? = null
    ) {
        when (val dl = downloader.download(info, onProgress)) {
            is ApkDownloader.DownloadResult.Success -> {
                onReadyToInstall?.invoke()
                ApkInstaller.install(context, dl.file)
            }
            is ApkDownloader.DownloadResult.MeteredNetworkBlocked ->
                onError?.invoke("Download blocked: device is on a metered network.")
            is ApkDownloader.DownloadResult.Error ->
                onError?.invoke(dl.message)
        }
    }

    // ── Utility ───────────────────────────────────────────────────────────────

    /** Returns true if the user has granted "Install unknown apps" for this app. */
    fun canInstall(): Boolean = ApkInstaller.canInstall(context)

    /** Opens the Android settings screen to grant "Install unknown apps". */
    fun requestInstallPermission() = ApkInstaller.requestUnknownSourcesPermission(context)

    /** The update strategy configured for this updater instance. */
    val updateStrategy: UpdateStrategy get() = config.updateStrategy
}
