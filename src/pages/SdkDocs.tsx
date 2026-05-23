import { useState } from 'react'
import { Copy, Check, Terminal, Package, Shield, Download, Zap, ChevronRight, Key, Link } from 'lucide-react'

function CodeBlock({ code, lang = 'kotlin' }: { code: string, lang?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative group rounded-xl overflow-hidden"
      style={{ background: '#070b12', border: '1px solid rgba(0,255,136,0.12)' }}>
      <div className="flex items-center justify-between px-4 py-2 border-b"
        style={{ borderColor: 'rgba(0,255,136,0.08)', background: '#0a0e17' }}>
        <span className="font-mono-custom text-xs" style={{ color: '#546e7a' }}>{lang}</span>
        <button onClick={copy}
          className="flex items-center gap-1.5 text-xs transition-all px-2 py-1 rounded"
          style={{ color: copied ? '#00ff88' : '#546e7a' }}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-5 overflow-x-auto text-sm leading-relaxed font-mono-custom">
        <code>{code}</code>
      </pre>
    </div>
  )
}

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'install', label: 'Installation' },
  { id: 'api-keys', label: 'API Keys' },
  { id: 'quickstart', label: 'Quick Start' },
  { id: 'config', label: 'Configuration' },
  { id: 'update-strategy', label: 'Update Strategy' },
  { id: 'check-updates', label: 'Checking Updates' },
  { id: 'download', label: 'Downloading APK' },
  { id: 'install-apk', label: 'Installing APK' },
  { id: 'full-flow', label: 'Full Flow' },
  { id: 'drive-support', label: 'Google Drive' },
  { id: 'staged-rollouts', label: 'Staged Rollouts' },
  { id: 'forced-updates', label: 'Forced Updates' },
  { id: 'security', label: 'Security' },
  { id: 'manifest', label: 'AndroidManifest' },
  { id: 'api-reference', label: 'API Reference' },
]

export default function SdkDocs() {
  const [activeSection, setActiveSection] = useState('overview')

  return (
    <div className="min-h-screen pt-16" style={{ background: '#080b10' }}>
      <div className="max-w-7xl mx-auto flex">

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-60 shrink-0 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto border-r border-white/5 py-8 px-4">
          <div className="mb-6 px-2">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#00ff88' }}>SDK Docs</span>
            <p className="text-gray-500 text-xs mt-1">v1.1.0 · Kotlin / Android</p>
          </div>
          {sections.map(s => (
            <a key={s.id} href={`#${s.id}`}
              onClick={() => setActiveSection(s.id)}
              className="px-3 py-2 rounded-lg text-sm transition-all mb-0.5"
              style={{
                color: activeSection === s.id ? '#00ff88' : '#6b7280',
                background: activeSection === s.id ? 'rgba(0,255,136,0.07)' : 'transparent',
                borderLeft: activeSection === s.id ? '2px solid #00ff88' : '2px solid transparent',
              }}>
              {s.label}
            </a>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-6 lg:px-12 py-12 max-w-3xl">

          {/* Header */}
          <div id="overview" className="mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
              style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', color: '#00ff88' }}>
              <Terminal size={12} />
              APK Hub SDK · v1.1.0
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 font-display" style={{ letterSpacing: '-0.02em' }}>
              APKHub Android SDK
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              A lightweight Kotlin library that adds seamless over-the-air update support to any Android app.
              Drop it in, configure your public key, and your users will always be on the latest version.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: <Shield size={16} />, label: 'SHA-256 verified' },
                { icon: <Download size={16} />, label: 'Background download' },
                { icon: <Zap size={16} />, label: 'Staged rollouts' },
                { icon: <Package size={16} />, label: 'Beta channels' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-2 rounded-lg px-3 py-2.5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#00ff88' }}>{f.icon}</span>
                  <span className="text-gray-400 text-xs">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Installation */}
          <section id="install" className="mb-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Installation</h2>
            <p className="text-gray-400 mb-5 text-sm">Add the APK Hub SDK to your project via Gradle.</p>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#00ff88' }}>settings.gradle.kts</h3>
            <CodeBlock lang="kotlin" code={`dependencyResolutionManagement {
    repositories {
        maven { url = uri("https://maven.apkhub.com/releases") }
        google()
        mavenCentral()
    }
}`} />
            <h3 className="text-sm font-semibold mb-3 mt-6" style={{ color: '#00ff88' }}>build.gradle.kts (app)</h3>
            <CodeBlock lang="kotlin" code={`dependencies {
    implementation("com.apkhub:sdk:1.1.0")
    // Required for coroutines support
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
}`} />
          </section>

          {/* API Keys */}
          <section id="api-keys" className="mb-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-2 font-display">API Keys</h2>
            <p className="text-gray-400 mb-5 text-sm">
              APK Hub issues two separate keys per project. Use the right one in the right place.
            </p>
            <div className="grid gap-4 mb-6">
              <div className="p-4 rounded-xl"
                style={{ background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.15)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Key size={14} style={{ color: '#00ff88' }} />
                  <code className="text-sm font-mono-custom" style={{ color: '#00ff88' }}>pk_live_…</code>
                  <span className="text-xs px-2 py-0.5 rounded-full ml-auto"
                    style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88' }}>Public key · safe in APK</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Used by the SDK to <strong className="text-gray-300">check for updates</strong> and download APKs.
                  Safe to embed in your compiled APK — it can only read, never publish or delete.
                  Store it in <code className="text-gray-400 font-mono-custom">gradle.properties</code> and inject via <code className="text-gray-400 font-mono-custom">BuildConfig</code>.
                </p>
              </div>
              <div className="p-4 rounded-xl"
                style={{ background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.2)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Key size={14} style={{ color: '#f97316' }} />
                  <code className="text-sm font-mono-custom" style={{ color: '#f97316' }}>sk_live_…</code>
                  <span className="text-xs px-2 py-0.5 rounded-full ml-auto"
                    style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316' }}>Secret key · backend only</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Used by your <strong className="text-gray-300">backend / CI pipeline</strong> to upload APKs, publish releases, and manage rollouts via the APK Hub API.
                  <strong className="text-red-400"> Never include this in an APK</strong> — treat it like a password.
                </p>
              </div>
            </div>
            <CodeBlock lang="kotlin" code={`// gradle.properties  (keep sk_ out of VCS — use CI secrets instead)
APKHUB_PUBLIC_KEY=pk_live_your_public_key_here`} />
            <CodeBlock lang="kotlin" code={`// build.gradle.kts
android {
    buildFeatures { buildConfig = true }
    defaultConfig {
        buildConfigField("String", "APKHUB_PUBLIC_KEY",
            "\\"${'{'}project.findProperty("APKHUB_PUBLIC_KEY") ?: "pk_test_placeholder"{'}'}\\"")
    }
}`} />
          </section>

          {/* Quick Start */}
          <section id="quickstart" className="mb-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Quick Start</h2>
            <p className="text-gray-400 mb-5 text-sm">
              The fastest way to get updates running. Call this from your <code className="px-1.5 py-0.5 rounded text-xs font-mono-custom" style={{ background: '#0a0e17', color: '#c3e88d' }}>MainActivity.onCreate</code>.
            </p>
            <CodeBlock lang="kotlin" code={`import com.apkhub.sdk.ApkHubUpdater
import com.apkhub.sdk.model.ApkHubConfig

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val config = ApkHubConfig(
            packageName = "com.example.myapp",
            publicKey   = BuildConfig.APKHUB_PUBLIC_KEY   // pk_live_…
        )

        val updater = ApkHubUpdater(this, config)

        lifecycleScope.launch {
            updater.checkAndUpdate(
                onUpdateFound = { info ->
                    // Show a dialog – return true to proceed with download
                    showUpdateDialog(info.latestVersion, info.releaseNotes)
                },
                onNoUpdate = {
                    Log.d("APKHub", "Already up to date")
                },
                onDownloadProgress = { percent ->
                    progressBar.progress = percent
                },
                onError = { message ->
                    Log.e("APKHub", message)
                }
            )
        }
    }
}`} />
          </section>

          {/* Configuration */}
          <section id="config" className="mb-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Configuration</h2>
            <p className="text-gray-400 mb-5 text-sm">All available options in <code className="px-1.5 py-0.5 rounded text-xs font-mono-custom" style={{ background: '#0a0e17', color: '#c3e88d' }}>ApkHubConfig</code>.</p>
            <CodeBlock lang="kotlin" code={`val config = ApkHubConfig(
    // Required
    packageName          = "com.example.myapp",
    publicKey            = BuildConfig.APKHUB_PUBLIC_KEY,  // pk_live_…

    // Optional – defaults shown
    apiBaseUrl           = "https://api.apkhub.com/v1",
    channel              = "stable",                  // "stable" | "beta" | "nightly"
    updateStrategy       = UpdateStrategy.FLEXIBLE,   // FLEXIBLE | IMMEDIATE
    autoDownload         = false,                     // auto-download on update found
    checkOnStart         = true,                      // auto-check when SDK is created
    allowMeteredNetwork  = false,                     // allow download on mobile data
    allowDowngrade       = false                      // reject lower versionCodes (default)
)`} />
            <div className="mt-5 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#0a0e17', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Property', 'Type', 'Default', 'Description'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#6b7280' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['packageName', 'String', '—', 'Your app\'s package name (required)'],
                    ['publicKey', 'String', '—', 'Public SDK key (pk_live_…) from APK Hub dashboard (required). Never use sk_ here.'],
                    ['apiBaseUrl', 'String', 'api.apkhub.com/v1', 'Backend base URL'],
                    ['channel', 'String', '"stable"', 'Update channel: stable / beta / nightly'],
                    ['updateStrategy', 'UpdateStrategy', 'FLEXIBLE', 'FLEXIBLE = optional prompt; IMMEDIATE = block app'],
                    ['autoDownload', 'Boolean', 'false', 'Download in background on update found'],
                    ['checkOnStart', 'Boolean', 'true', 'Auto-check when updater is initialized'],
                    ['allowMeteredNetwork', 'Boolean', 'false', 'Allow APK download on mobile data'],
                    ['allowDowngrade', 'Boolean', 'false', 'Accept lower versionCodes (rollback). Keep false in production.'],
                  ].map(([prop, type, def, desc], i) => (
                    <tr key={prop} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="px-4 py-3 font-mono-custom text-xs" style={{ color: '#00ff88' }}>{prop}</td>
                      <td className="px-4 py-3 font-mono-custom text-xs" style={{ color: '#c792ea' }}>{type}</td>
                      <td className="px-4 py-3 font-mono-custom text-xs" style={{ color: '#f78c6c' }}>{def}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Update Strategy */}
          <section id="update-strategy" className="mb-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Update Strategy</h2>
            <p className="text-gray-400 mb-5 text-sm">
              Control how the SDK presents an available update to the user.
            </p>
            <div className="grid gap-4 mb-6">
              <div className="p-4 rounded-xl"
                style={{ background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.15)' }}>
                <code className="text-sm font-mono-custom" style={{ color: '#00ff88' }}>UpdateStrategy.FLEXIBLE</code>
                <p className="text-gray-400 text-xs leading-relaxed mt-2">
                  The user is notified and can choose to install later. The <code className="text-gray-300 font-mono-custom">onUpdateFound</code> callback controls whether to proceed.
                  Ideal for non-critical updates.
                </p>
              </div>
              <div className="p-4 rounded-xl"
                style={{ background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.2)' }}>
                <code className="text-sm font-mono-custom" style={{ color: '#f97316' }}>UpdateStrategy.IMMEDIATE</code>
                <p className="text-gray-400 text-xs leading-relaxed mt-2">
                  The app is blocked until the update is downloaded and installed. The <code className="text-gray-300 font-mono-custom">onUpdateFound</code> return value is ignored — download always proceeds.
                  Use for security patches or breaking API changes.
                </p>
              </div>
            </div>
            <CodeBlock lang="kotlin" code={`// Flexible (default) – user can dismiss
val config = ApkHubConfig(
    packageName    = "com.example.myapp",
    publicKey      = BuildConfig.APKHUB_PUBLIC_KEY,
    updateStrategy = UpdateStrategy.FLEXIBLE
)

// Immediate – block app until installed
val config = ApkHubConfig(
    packageName    = "com.example.myapp",
    publicKey      = BuildConfig.APKHUB_PUBLIC_KEY,
    updateStrategy = UpdateStrategy.IMMEDIATE
)`} />
            <div className="mt-4 p-4 rounded-xl text-sm" style={{ background: 'rgba(0,149,255,0.06)', border: '1px solid rgba(0,149,255,0.15)' }}>
              <span style={{ color: '#0095ff' }}>ℹ Tip</span>
              <p className="text-gray-400 mt-1 text-xs leading-relaxed">
                You can also override strategy per-release from the dashboard by setting <code className="mx-1 px-1 rounded font-mono-custom" style={{ background: '#0a0e17', color: '#c3e88d', fontSize: '11px' }}>"mandatory": true</code> in the backend response, which forces immediate behaviour regardless of the SDK config.
              </p>
            </div>
          </section>

          {/* Check Updates */}
          <section id="check-updates" className="mb-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Checking for Updates</h2>
            <p className="text-gray-400 mb-5 text-sm">Use <code className="px-1.5 py-0.5 rounded text-xs font-mono-custom" style={{ background: '#0a0e17', color: '#c3e88d' }}>check()</code> if you want the result before deciding what to do.</p>
            <CodeBlock lang="kotlin" code={`lifecycleScope.launch {
    when (val result = updater.check()) {
        is UpdateChecker.CheckResult.Success -> {
            val info = result.info
            println("Update available: \${info.latestVersion}")
            println("Release notes: \${info.releaseNotes}")
            println("Mandatory: \${info.mandatory}")
            println("Cert fingerprint: \${info.certificateFingerprint}")
        }
        is UpdateChecker.CheckResult.NoUpdate ->
            println("App is up to date")

        is UpdateChecker.CheckResult.Error ->
            println("Check failed: \${result.message}")
    }
}`} />
            <div className="mt-4 p-4 rounded-xl text-sm" style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.12)' }}>
              <span style={{ color: '#00ff88' }}>Downgrade protection</span>
              <p className="text-gray-400 mt-1 text-xs leading-relaxed">
                The SDK automatically returns <code className="font-mono-custom" style={{ color: '#c3e88d' }}>NoUpdate</code> if the server versionCode is less than or equal to the installed one, unless <code className="font-mono-custom" style={{ color: '#c3e88d' }}>allowDowngrade = true</code> is set in config.
              </p>
            </div>
          </section>

          {/* Download */}
          <section id="download" className="mb-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Downloading the APK</h2>
            <p className="text-gray-400 mb-5 text-sm">
              The downloader verifies the SHA-256 hash automatically. If it mismatches, the file is deleted and an error is returned.
              Downloads always come from APK Hub CDN URLs — the SDK rejects any raw third-party storage links.
            </p>
            <CodeBlock lang="kotlin" code={`lifecycleScope.launch {
    val result = updater.check()
    if (result is UpdateChecker.CheckResult.Success) {
        updater.downloadAndInstall(
            info       = result.info,
            onProgress = { percent ->
                runOnUiThread { progressBar.progress = percent }
            },
            onReadyToInstall = {
                // Called just before the system installer opens
                progressBar.visibility = View.GONE
            },
            onError = { message ->
                Toast.makeText(this@MainActivity, message, Toast.LENGTH_LONG).show()
            }
        )
    }
}`} />
          </section>

          {/* Install APK */}
          <section id="install-apk" className="mb-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Installing the APK</h2>
            <p className="text-gray-400 mb-5 text-sm">
              The SDK triggers the Android system installer automatically. On Android 8+, the user must grant <em>"Install unknown apps"</em> once.
            </p>
            <CodeBlock lang="kotlin" code={`// Check if permission is already granted
if (!updater.canInstall()) {
    // Opens Settings → Install unknown apps → Your app
    updater.requestInstallPermission()
    // Re-check in onResume after user returns from settings
}`} />
            <div className="mt-4 p-4 rounded-xl text-sm" style={{ background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.15)' }}>
              <span style={{ color: '#ffb800' }}>⚠ Android 8.0+ requirement</span>
              <p className="text-gray-400 mt-1 text-xs leading-relaxed">
                Users must grant "Install unknown apps" for your app. The SDK handles this automatically — call
                <code className="mx-1 px-1 rounded font-mono-custom" style={{ background: '#0a0e17', color: '#c3e88d', fontSize: '11px' }}>requestInstallPermission()</code>
                and re-trigger the update flow in <code className="mx-1 px-1 rounded font-mono-custom" style={{ background: '#0a0e17', color: '#c3e88d', fontSize: '11px' }}>onResume</code>.
              </p>
            </div>
          </section>

          {/* Full Flow */}
          <section id="full-flow" className="mb-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Full Production Flow</h2>
            <p className="text-gray-400 mb-5 text-sm">A complete update integration with dialog, permission handling, and UI feedback.</p>
            <CodeBlock lang="kotlin" code={`class MainActivity : AppCompatActivity() {

    private lateinit var updater: ApkHubUpdater

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        updater = ApkHubUpdater(
            context = this,
            config  = ApkHubConfig(
                packageName    = BuildConfig.APPLICATION_ID,
                publicKey      = BuildConfig.APKHUB_PUBLIC_KEY,  // pk_live_…
                channel        = if (BuildConfig.DEBUG) "beta" else "stable",
                updateStrategy = UpdateStrategy.FLEXIBLE
            )
        )
        checkForUpdates()
    }

    override fun onResume() {
        super.onResume()
        // Re-trigger if user just granted install permission
        if (updater.canInstall()) checkForUpdates()
    }

    private fun checkForUpdates() {
        lifecycleScope.launch {
            updater.checkAndUpdate(
                onUpdateFound = { info ->
                    if (info.mandatory || updater.updateStrategy == UpdateStrategy.IMMEDIATE) {
                        // Block app, no cancel option
                        showMandatoryUpdateDialog(info)
                        true
                    } else {
                        showOptionalUpdateDialog(info)
                    }
                },
                onDownloadProgress = { pct ->
                    updateProgressBar(pct)
                },
                onReadyToInstall = {
                    hideProgressBar()
                    showToast("Installing update…")
                },
                onError = { msg ->
                    Log.e("APKHub", msg)
                }
            )
        }
    }

    private suspend fun showOptionalUpdateDialog(info: UpdateInfo): Boolean {
        return suspendCoroutine { cont ->
            AlertDialog.Builder(this)
                .setTitle("Update available — \${info.latestVersion}")
                .setMessage(info.releaseNotes)
                .setPositiveButton("Update now") { _, _ -> cont.resume(true) }
                .setNegativeButton("Later")     { _, _ -> cont.resume(false) }
                .show()
        }
    }
}`} />
          </section>

          {/* Google Drive */}
          <section id="drive-support" className="mb-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Google Drive Support</h2>
            <p className="text-gray-400 mb-5 text-sm">
              You can host APKs on Google Drive and paste the share link into the APK Hub dashboard.
              The backend handles all Drive quirks internally — the SDK never sees a Drive URL.
            </p>

            {/* Flow diagram */}
            <div className="flex flex-col gap-2 mb-6">
              {[
                { step: '1', text: 'Upload APK to Google Drive, set sharing to "Anyone with the link"', color: '#6b7280' },
                { step: '2', text: 'Paste the share link into the APK Hub dashboard', color: '#6b7280' },
                { step: '3', text: 'APK Hub backend fetches the file, converts share link → direct-download URL', color: '#0095ff' },
                { step: '4', text: 'Backend validates APK, extracts metadata, computes SHA-256, verifies cert fingerprint', color: '#0095ff' },
                { step: '5', text: 'APK re-hosted on APK Hub CDN as a secure temporary URL', color: '#00ff88' },
                { step: '6', text: 'SDK receives cdn.apkhub.com/… — downloads and verifies as normal', color: '#00ff88' },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                    style={{ background: `${s.color}20`, color: s.color, border: `1px solid ${s.color}40` }}>
                    {s.step}
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed mt-0.5">{s.text}</p>
                </div>
              ))}
            </div>

            <div className="mb-5 p-4 rounded-xl"
              style={{ background: 'rgba(0,149,255,0.04)', border: '1px solid rgba(0,149,255,0.15)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Link size={13} style={{ color: '#0095ff' }} />
                <span className="text-xs font-semibold" style={{ color: '#0095ff' }}>Supported Drive URL formats</span>
              </div>
              <div className="flex flex-col gap-1 font-mono-custom text-xs text-gray-500">
                <span>https://drive.google.com/file/d/{'<id>'}/view?usp=sharing</span>
                <span>https://drive.google.com/open?id={'<id>'}</span>
                <span>https://docs.google.com/uc?export=download&id={'<id>'}</span>
              </div>
            </div>

            <CodeBlock lang="json" code={`// What the backend returns to the SDK — always an APK Hub CDN URL
{
  "updateAvailable": true,
  "latestVersion": "2.4.0",
  "versionCode": 45,
  "downloadUrl": "https://cdn.apkhub.com/temp/abc123xyz",
  "sha256": "a1b2c3d4e5f6789012345678901234567890abcdef...",
  "mandatory": false,
  "releaseNotes": "Performance improvements",
  "certificateFingerprint": "A1:2B:3C:4D:5E:6F:70:81:92:A3:B4:C5:D6:E7:F8:09",
  "channel": "stable"
}

// NOT this — the SDK will reject raw Drive links:
// "downloadUrl": "https://drive.google.com/..."`} />

            <div className="mt-4 p-4 rounded-xl text-sm" style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.12)' }}>
              <span style={{ color: '#00ff88' }}>No SDK changes needed</span>
              <p className="text-gray-400 mt-1 text-xs leading-relaxed">
                Google Drive support is entirely backend-side. The SDK automatically rejects any URL not on the <code className="font-mono-custom" style={{ color: '#c3e88d' }}>apkhub.com</code> domain, so you can never accidentally ship a Drive link to end users.
              </p>
            </div>
          </section>

          {/* Staged Rollouts */}
          <section id="staged-rollouts" className="mb-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Staged Rollouts</h2>
            <p className="text-gray-400 mb-5 text-sm">
              Rollouts are controlled server-side. The backend API returns <code className="px-1 py-0.5 rounded text-xs font-mono-custom" style={{ background: '#0a0e17', color: '#c3e88d' }}>updateAvailable: false</code> for users outside the rollout percentage — no SDK changes needed.
            </p>
            <CodeBlock lang="json" code={`// Backend API response during a 10% rollout
{
  "updateAvailable": true,
  "latestVersion": "2.4.0",
  "versionCode": 45,
  "downloadUrl": "https://cdn.apkhub.com/releases/notely-v45.apk",
  "sha256": "a1b2c3d4e5f6...",
  "mandatory": false,
  "releaseNotes": "Performance improvements and bug fixes",
  "rolloutPercent": 10,
  "channel": "stable"
}`} />
          </section>

          {/* Forced Updates */}
          <section id="forced-updates" className="mb-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Forced Updates</h2>
            <p className="text-gray-400 mb-5 text-sm">When the backend sets <code className="px-1 py-0.5 rounded text-xs font-mono-custom" style={{ background: '#0a0e17', color: '#c3e88d' }}>"mandatory": true</code>, or when your config uses <code className="px-1 py-0.5 rounded text-xs font-mono-custom" style={{ background: '#0a0e17', color: '#c3e88d' }}>UpdateStrategy.IMMEDIATE</code>, your app should block usage until updated.</p>
            <CodeBlock lang="kotlin" code={`onUpdateFound = { info ->
    if (info.mandatory || updater.updateStrategy == UpdateStrategy.IMMEDIATE) {
        // Lock the UI — user must update
        showBlockingUpdateScreen(info.latestVersion)
        true  // proceed with download
    } else {
        showOptionalDialog(info)
    }
}`} />
          </section>

          {/* Security */}
          <section id="security" className="mb-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Security Model</h2>
            <p className="text-gray-400 mb-5 text-sm">The SDK enforces multiple security layers before any APK touches the installer.</p>
            <div className="grid gap-4">
              {[
                {
                  step: '01', title: 'SHA-256 Integrity Check',
                  desc: 'After every download, Sha256Verifier computes the file hash and compares it against the server-provided value. A mismatch causes the file to be deleted and the update aborted.',
                  color: '#00ff88',
                },
                {
                  step: '02', title: 'Certificate Fingerprint Locking',
                  desc: 'APK Hub stores the SHA-256 signing certificate fingerprint on first upload. Every subsequent upload must match — preventing signing key substitution attacks. The fingerprint is also returned in the API response for informational display.',
                  color: '#0095ff',
                },
                {
                  step: '03', title: 'Downgrade Protection',
                  desc: 'The SDK rejects any versionCode ≤ the currently installed version unless allowDowngrade is explicitly set to true. This prevents accidental or malicious rollbacks.',
                  color: '#c792ea',
                },
                {
                  step: '04', title: 'CDN URL Enforcement',
                  desc: 'The downloader validates that the APK URL belongs to apkhub.com before fetching. Raw Google Drive, S3, or arbitrary URLs are rejected outright — the SDK is storage-provider agnostic.',
                  color: '#f97316',
                },
                {
                  step: '05', title: 'Public / Secret Key Split',
                  desc: 'The SDK only transmits the public key (pk_). The secret key (sk_) never leaves your backend server. Public keys are read-only — they cannot publish or delete releases.',
                  color: '#ffb800',
                },
                {
                  step: '06', title: 'VirusTotal Scan',
                  desc: 'All uploaded APKs are scanned server-side via VirusTotal and ClamAV before becoming downloadable. Results are shown on the app detail page.',
                  color: '#00ff88',
                },
              ].map(s => (
                <div key={s.step} className="flex gap-4 p-5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-terminal text-xs font-bold"
                    style={{ background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}30` }}>
                    {s.step}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-1">{s.title}</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Manifest */}
          <section id="manifest" className="mb-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-2 font-display">AndroidManifest.xml</h2>
            <p className="text-gray-400 mb-5 text-sm">Required permissions and FileProvider declaration.</p>
            <CodeBlock lang="xml" code={`<!-- Required permission -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />

<application ...>

    <!-- FileProvider for Android 7+ secure file sharing -->
    <provider
        android:name="androidx.core.content.FileProvider"
        android:authorities="\${applicationId}.apkhub.provider"
        android:exported="false"
        android:grantUriPermissions="true">
        <meta-data
            android:name="android.support.FILE_PROVIDER_PATHS"
            android:resource="@xml/apkhub_file_paths" />
    </provider>

</application>`} />
            <h3 className="text-sm font-semibold mb-3 mt-6" style={{ color: '#00ff88' }}>res/xml/apkhub_file_paths.xml</h3>
            <CodeBlock lang="xml" code={`<?xml version="1.0" encoding="utf-8"?>
<paths>
    <external-files-path
        name="apkhub_updates"
        path="." />
</paths>`} />
          </section>

          {/* API Reference */}
          <section id="api-reference" className="mb-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-2 font-display">API Reference</h2>
            <p className="text-gray-400 mb-6 text-sm">Public surface of <code className="px-1 py-0.5 rounded text-xs font-mono-custom" style={{ background: '#0a0e17', color: '#c3e88d' }}>ApkHubUpdater</code>.</p>
            {[
              {
                sig: 'suspend fun check(): CheckResult',
                desc: 'Contacts the server and returns whether an update is available. Applies downgrade protection. Does not download anything.',
              },
              {
                sig: 'suspend fun checkAndUpdate(onUpdateFound, onNoUpdate?, onDownloadProgress?, onReadyToInstall?, onError?)',
                desc: 'Full update flow: check → prompt → download → install. With UpdateStrategy.IMMEDIATE, download always proceeds regardless of onUpdateFound return value.',
              },
              {
                sig: 'suspend fun downloadAndInstall(info, onProgress?, onReadyToInstall?, onError?)',
                desc: 'Downloads the APK from info.downloadUrl (must be an apkhub.com CDN URL), verifies SHA-256, then opens the system installer.',
              },
              {
                sig: 'fun canInstall(): Boolean',
                desc: 'Returns true if the app has "Install unknown apps" permission.',
              },
              {
                sig: 'fun requestInstallPermission()',
                desc: 'Opens Android Settings to grant "Install unknown apps" for this app.',
              },
              {
                sig: 'val updateStrategy: UpdateStrategy',
                desc: 'The UpdateStrategy configured for this updater instance (FLEXIBLE or IMMEDIATE).',
              },
            ].map(m => (
              <div key={m.sig} className="mb-4 rounded-xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="px-4 py-3" style={{ background: '#0a0e17' }}>
                  <code className="font-mono-custom text-xs" style={{ color: '#00ff88' }}>{m.sig}</code>
                </div>
                <div className="px-4 py-3">
                  <p className="text-gray-400 text-xs leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </section>

          {/* CTA */}
          <div className="rounded-2xl p-8 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(0,255,136,0.07), rgba(0,149,255,0.07))', border: '1px solid rgba(0,255,136,0.15)' }}>
            <h3 className="text-xl font-bold text-white mb-2 font-display">Ready to integrate?</h3>
            <p className="text-gray-400 text-sm mb-5">Get your public key from the developer dashboard and ship your first update in minutes.</p>
            <a href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{ background: 'linear-gradient(135deg,#00ff88,#0095ff)', color: '#000' }}>
              Open Dashboard
              <ChevronRight size={16} />
            </a>
          </div>

        </main>

        {/* Right mini-toc (desktop) */}
        <aside className="hidden xl:block w-48 shrink-0 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto py-8 px-4">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#374151' }}>On this page</p>
          {sections.slice(0, 10).map(s => (
            <a key={s.id} href={`#${s.id}`}
              className="block py-1.5 text-xs transition-colors"
              style={{ color: '#4b5563' }}
              onMouseOver={e => (e.currentTarget.style.color = '#9ca3af')}
              onMouseOut={e => (e.currentTarget.style.color = '#4b5563')}>
              {s.label}
            </a>
          ))}
        </aside>
      </div>
    </div>
  )
}
