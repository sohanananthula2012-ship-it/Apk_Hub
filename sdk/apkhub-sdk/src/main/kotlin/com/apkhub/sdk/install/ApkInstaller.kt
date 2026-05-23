package com.apkhub.sdk.install

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.core.content.FileProvider
import java.io.File

/**
 * Triggers the Android system installer for a locally downloaded APK.
 *
 * The calling app must declare the REQUEST_INSTALL_PACKAGES permission
 * and a FileProvider authority in its AndroidManifest.xml.
 *
 * Example manifest entry:
 * ```xml
 * <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />
 *
 * <provider
 *   android:name="androidx.core.content.FileProvider"
 *   android:authorities="${applicationId}.apkhub.provider"
 *   android:exported="false"
 *   android:grantUriPermissions="true">
 *   <meta-data
 *     android:name="android.support.FILE_PROVIDER_PATHS"
 *     android:resource="@xml/apkhub_file_paths" />
 * </provider>
 * ```
 */
object ApkInstaller {

    /**
     * Opens the system package installer dialog for [apkFile].
     *
     * @param context   Activity or Application context
     * @param apkFile   The downloaded APK file to install
     * @param authority FileProvider authority (default: "<packageName>.apkhub.provider")
     */
    fun install(
        context: Context,
        apkFile: File,
        authority: String = "${context.packageName}.apkhub.provider"
    ) {
        val uri: Uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            FileProvider.getUriForFile(context, authority, apkFile)
        } else {
            @Suppress("DEPRECATION")
            Uri.fromFile(apkFile)
        }

        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(uri, "application/vnd.android.package-archive")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

        // Check for install unknown apps permission on Android 8+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val canInstall = context.packageManager.canRequestPackageInstalls()
            if (!canInstall) {
                requestUnknownSourcesPermission(context)
                return
            }
        }

        context.startActivity(intent)
    }

    /**
     * Directs the user to the "Install unknown apps" settings screen for this app.
     * Required on Android 8.0+ before the installer dialog can be shown.
     */
    fun requestUnknownSourcesPermission(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val intent = Intent(android.provider.Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                data = Uri.parse("package:${context.packageName}")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        }
    }

    /**
     * Returns true if the user has already granted "Install unknown apps" for this app.
     */
    fun canInstall(context: Context): Boolean =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.packageManager.canRequestPackageInstalls()
        } else {
            true // Pre-Oreo: governed by global unknown sources toggle
        }
}
