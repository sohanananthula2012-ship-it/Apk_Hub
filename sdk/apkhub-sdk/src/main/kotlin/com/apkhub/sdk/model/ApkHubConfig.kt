package com.apkhub.sdk.model

/**
 * How the SDK presents an available update to the user.
 *
 * - [FLEXIBLE]  – notify the user, let them choose when to install.
 * - [IMMEDIATE] – block app usage until the update is downloaded and installed.
 */
enum class UpdateStrategy {
    FLEXIBLE,
    IMMEDIATE
}

/**
 * Configuration for the APK Hub SDK.
 *
 * Use your **public key** (prefix `pk_`) here — it is safe to embed in your APK.
 * Your **secret key** (prefix `sk_`) must never leave your backend server.
 *
 * @param packageName        The app's package name, e.g. "com.example.myapp"
 * @param publicKey          Public SDK key issued by APK Hub (pk_live_… / pk_test_…).
 *                           Safe to include in compiled APKs.
 * @param apiBaseUrl         Base URL of the APK Hub backend (default: production)
 * @param channel            Update channel: "stable" | "beta" | "nightly"
 * @param updateStrategy     [UpdateStrategy.FLEXIBLE] shows an optional prompt;
 *                           [UpdateStrategy.IMMEDIATE] blocks the app until updated.
 * @param autoDownload       Automatically download the APK in the background when an update is found
 * @param checkOnStart       Automatically check for updates on app start
 * @param allowMeteredNetwork Allow downloads on metered (mobile data) networks
 * @param allowDowngrade     Set to true to allow installing an older versionCode.
 *                           Should remain false (default) in production.
 */
data class ApkHubConfig(
    val packageName: String,
    val publicKey: String,
    val apiBaseUrl: String = "https://api.apkhub.com/v1",
    val channel: String = "stable",
    val updateStrategy: UpdateStrategy = UpdateStrategy.FLEXIBLE,
    val autoDownload: Boolean = false,
    val checkOnStart: Boolean = true,
    val allowMeteredNetwork: Boolean = false,
    val allowDowngrade: Boolean = false
) {
    init {
        require(publicKey.startsWith("pk_")) {
            "ApkHubConfig.publicKey must start with 'pk_'. " +
            "Use your public key here, not the secret key (sk_). " +
            "Secret keys belong only on your backend server."
        }
    }
}
