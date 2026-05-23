import { useState } from 'react'
import {
  Package, Upload, BarChart2, Star, Shield, Settings,
  Plus, ChevronRight, TrendingUp, Download, Users, Zap,
  CheckCircle, AlertTriangle, X, ArrowUpRight,
  Eye, RefreshCw, Key, Link, Copy, Check, Lock
} from 'lucide-react'

const APPS = [
  {
    name: 'Notely', icon: '📝', pkg: 'com.notely.app',
    versions: [
      { code: 45, name: '2.4.0', status: 'live', published: '2 days ago', downloads: 312, rollout: 100 },
      { code: 44, name: '2.3.1', status: 'live', published: '3 weeks ago', downloads: 4200, rollout: 100 },
      { code: 43, name: '2.3.0', status: 'archived', published: '2 months ago', downloads: 6100, rollout: 100 },
    ],
    totalDownloads: 12400, rating: 4.8, reviews: 284, channel: 'stable',
    scanStatus: 'clean',
    fingerprint: 'A1:2B:3C:4D:5E:6F:70:81:92:A3:B4:C5:D6:E7:F8:09',
  },
  {
    name: 'TaskBlitz', icon: '⚡', pkg: 'com.taskblitz.app',
    versions: [
      { code: 20, name: '2.0.3', status: 'live', published: '1 week ago', downloads: 891, rollout: 25 },
      { code: 19, name: '2.0.2', status: 'live', published: '1 month ago', downloads: 5200, rollout: 100 },
    ],
    totalDownloads: 9400, rating: 4.7, reviews: 198, channel: 'stable',
    scanStatus: 'clean',
    fingerprint: 'B2:3C:4D:5E:6F:70:81:92:A3:B4:C5:D6:E7:F8:09:1A',
  },
]

const METRICS = [
  { label: 'Total Downloads', value: '21.8k', delta: '+12%', icon: <Download size={18} />, color: '#00ff88' },
  { label: 'Active Users', value: '8,340', delta: '+7%', icon: <Users size={18} />, color: '#0095ff' },
  { label: 'Avg Rating', value: '4.75', delta: '+0.1', icon: <Star size={18} />, color: '#f59e0b' },
  { label: 'Updates Shipped', value: '14', delta: 'this month', icon: <Zap size={18} />, color: '#c792ea' },
]

const ACTIVITY = [
  { type: 'update', msg: 'Notely v2.4.0 published', time: '2 days ago', icon: <CheckCircle size={14} />, color: '#00ff88' },
  { type: 'scan', msg: 'TaskBlitz v2.0.3 scan passed', time: '1 week ago', icon: <Shield size={14} />, color: '#0095ff' },
  { type: 'rollout', msg: 'TaskBlitz v2.0.3 rollout → 25%', time: '1 week ago', icon: <TrendingUp size={14} />, color: '#c792ea' },
  { type: 'review', msg: 'New 5★ review on Notely', time: '3 days ago', icon: <Star size={14} />, color: '#f59e0b' },
  { type: 'warning', msg: 'Notely v2.2.0 flagged for low SDK', time: '1 month ago', icon: <AlertTriangle size={14} />, color: '#f97316' },
]

// Placeholder keys — replaced by real values from the backend in production
const API_KEYS = {
  public: 'pk_live_••••••••••••••••••••••••',
  secret: 'sk_live_••••••••••••••••••••••••',
}

type Tab = 'overview' | 'apps' | 'upload' | 'analytics' | 'settings'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    live: { bg: 'rgba(0,255,136,0.1)', color: '#00ff88', label: 'Live' },
    archived: { bg: 'rgba(255,255,255,0.05)', color: '#6b7280', label: 'Archived' },
    pending: { bg: 'rgba(255,184,0,0.1)', color: '#ffb800', label: 'Pending scan' },
    clean: { bg: 'rgba(0,255,136,0.1)', color: '#00ff88', label: '✓ Clean' },
  }
  const s = map[status] ?? map['archived']
  return (
    <span className="px-2 py-0.5 rounded-md text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}>{s.label}</span>
  )
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="p-1.5 rounded-lg transition-all"
      style={{ color: copied ? '#00ff88' : '#4b5563', background: copied ? 'rgba(0,255,136,0.08)' : 'transparent' }}>
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  )
}

function UploadModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'drop' | 'details' | 'done'>('drop')
  const [dragging, setDragging] = useState(false)
  const [channel, setChannel] = useState('stable')
  const [rollout, setRollout] = useState('100')
  const [mandatory, setMandatory] = useState(false)
  const [allowDowngrade, setAllowDowngrade] = useState(false)
  const [notes, setNotes] = useState('')
  const [driveUrl, setDriveUrl] = useState('')
  const [uploadMode, setUploadMode] = useState<'file' | 'drive'>('file')
  const [strategy, setStrategy] = useState<'FLEXIBLE' | 'IMMEDIATE'>('FLEXIBLE')

  const driveValid = driveUrl.includes('drive.google.com') || driveUrl.includes('docs.google.com/uc')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: '#0f1419', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg font-display">Upload New APK</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>

        {step === 'drop' && (
          <>
            {/* Upload mode toggle */}
            <div className="flex gap-2 mb-4">
              {(['file', 'drive'] as const).map(m => (
                <button key={m} onClick={() => setUploadMode(m)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: uploadMode === m ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${uploadMode === m ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.07)'}`,
                    color: uploadMode === m ? '#00ff88' : '#6b7280',
                  }}>
                  {m === 'file' ? <><Upload size={14} /> Local file</> : <><Link size={14} /> Google Drive</>}
                </button>
              ))}
            </div>

            {uploadMode === 'file' ? (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); setStep('details') }}
                onClick={() => setStep('details')}
                className="flex flex-col items-center justify-center gap-3 rounded-xl py-14 cursor-pointer transition-all"
                style={{
                  border: `2px dashed ${dragging ? '#00ff88' : 'rgba(255,255,255,0.1)'}`,
                  background: dragging ? 'rgba(0,255,136,0.04)' : 'rgba(255,255,255,0.02)',
                }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88' }}>
                  <Upload size={26} />
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold">Drop your APK here</p>
                  <p className="text-gray-500 text-sm mt-1">or click to browse · max 200 MB</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-gray-400 text-sm">
                  Paste your Google Drive share link. APK Hub will download, validate,
                  and re-host the APK on its own CDN — the SDK never touches Drive directly.
                </p>
                <div className="flex gap-2">
                  <input
                    value={driveUrl}
                    onChange={e => setDriveUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/…/view"
                    className="flex-1 px-3 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${driveValid ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.08)'}` }}
                  />
                  <button
                    disabled={!driveValid}
                    onClick={() => setStep('details')}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: driveValid ? 'linear-gradient(135deg,#00ff88,#0095ff)' : 'rgba(255,255,255,0.05)',
                      color: driveValid ? '#000' : '#4b5563',
                    }}>
                    Fetch
                  </button>
                </div>
                {driveValid && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#00ff88' }}>
                    <CheckCircle size={12} /> Drive link recognized — APK Hub will resolve &amp; proxy it
                  </div>
                )}
              </div>
            )}

            <p className="text-gray-600 text-xs text-center mt-4">
              APKs are scanned via VirusTotal · Certificate fingerprint verified automatically.
            </p>
          </>
        )}

        {step === 'details' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)' }}>
              <CheckCircle size={16} style={{ color: '#00ff88' }} />
              <span className="text-sm text-gray-300">
                {uploadMode === 'drive' ? 'Drive APK fetched · validating…' : 'APK parsed · SHA-256 verified'}
              </span>
            </div>

            {/* Update strategy */}
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Update Strategy</label>
              <div className="flex gap-2">
                {(['FLEXIBLE', 'IMMEDIATE'] as const).map(s => (
                  <button key={s} onClick={() => setStrategy(s)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: strategy === s ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${strategy === s ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.07)'}`,
                      color: strategy === s ? '#00ff88' : '#6b7280',
                    }}>
                    {s === 'FLEXIBLE' ? 'Flexible (optional)' : 'Immediate (block app)'}
                  </button>
                ))}
              </div>
              <p className="text-gray-600 text-xs mt-1.5">
                {strategy === 'FLEXIBLE'
                  ? 'User can dismiss and install later.'
                  : 'App is blocked until this update is installed.'}
              </p>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Release Channel</label>
              <div className="flex gap-2">
                {['stable', 'beta', 'nightly'].map(c => (
                  <button key={c} onClick={() => setChannel(c)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all"
                    style={{
                      background: channel === c ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${channel === c ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.07)'}`,
                      color: channel === c ? '#00ff88' : '#6b7280',
                    }}>{c}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Rollout % (staged release)</label>
              <div className="flex items-center gap-3">
                <input type="range" min="1" max="100" value={rollout}
                  onChange={e => setRollout(e.target.value)} className="flex-1 accent-[#00ff88]" />
                <span className="text-white font-mono-custom text-sm w-10 text-right">{rollout}%</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Release Notes</label>
              <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="What's new in this version..."
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setMandatory(!mandatory)}
                className="w-10 h-5 rounded-full transition-all relative"
                style={{ background: mandatory ? '#00ff88' : 'rgba(255,255,255,0.1)' }}>
                <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                  style={{ left: mandatory ? '22px' : '2px' }} />
              </button>
              <label className="text-sm text-gray-400">Force update (block app until installed)</label>
            </div>

            {/* Downgrade protection notice */}
            <div className="p-3 rounded-xl text-xs"
              style={{ background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.15)' }}>
              <div className="flex items-center justify-between mb-1">
                <span style={{ color: '#ffb800' }} className="flex items-center gap-1.5">
                  <Lock size={11} /> Downgrade protection
                </span>
                <button
                  onClick={() => setAllowDowngrade(!allowDowngrade)}
                  className="w-8 h-4 rounded-full transition-all relative"
                  style={{ background: allowDowngrade ? '#f97316' : 'rgba(255,255,255,0.1)' }}>
                  <span className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
                    style={{ left: allowDowngrade ? '17px' : '2px' }} />
                </button>
              </div>
              <p className="text-gray-500 leading-relaxed">
                {allowDowngrade
                  ? 'Rollback enabled — lower versionCodes will be accepted.'
                  : 'Enabled — only higher versionCodes than the current live version will be accepted.'}
              </p>
            </div>

            <button onClick={() => setStep('done')}
              className="w-full py-3 rounded-xl font-semibold text-sm mt-1"
              style={{ background: 'linear-gradient(135deg,#00ff88,#0095ff)', color: '#000' }}>
              Publish Update
            </button>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(0,255,136,0.12)', color: '#00ff88' }}>
              <CheckCircle size={32} />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Update published!</h3>
            <p className="text-gray-400 text-sm mb-6">
              APK is live on the <strong style={{ color: '#00ff88' }}>{channel}</strong> channel
              and rolling out to <strong style={{ color: '#00ff88' }}>{rollout}%</strong> of users
              {strategy === 'IMMEDIATE' && <> · <span style={{ color: '#f97316' }}>Immediate mode</span></>}.
            </p>
            <button onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold border"
              style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#e2e8f0' }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function SettingsTab() {
  const [skVisible, setSkVisible] = useState(false)

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white font-display">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your API keys and account preferences.</p>
      </div>

      {/* API Keys */}
      <div className="rounded-2xl p-6 mb-6"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Key size={16} style={{ color: '#00ff88' }} />
          <h3 className="text-white font-semibold">API Keys</h3>
        </div>

        {/* Public key */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold" style={{ color: '#00ff88' }}>Public key</span>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(0,255,136,0.08)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}>
              Safe in APK
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <code className="flex-1 text-xs font-mono-custom text-gray-300">{API_KEYS.public}</code>
            <CopyButton value={API_KEYS.public} />
          </div>
          <p className="text-gray-600 text-xs mt-1.5">
            Use this in your Android app via <code className="text-gray-500">BuildConfig.APKHUB_PUBLIC_KEY</code>.
            This key only allows reading update metadata — it cannot publish or delete releases.
          </p>
        </div>

        {/* Secret key */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold" style={{ color: '#f97316' }}>Secret key</span>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(249,115,22,0.08)', color: '#f97316', border: '1px solid rgba(249,115,22,0.2)' }}>
              Backend only — never in APK
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <code className="flex-1 text-xs font-mono-custom text-gray-300">
              {skVisible ? API_KEYS.secret : 'sk_live_••••••••••••••••••••••••'}
            </code>
            <button onClick={() => setSkVisible(v => !v)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 transition-colors">
              <Eye size={13} />
            </button>
            <CopyButton value={API_KEYS.secret} />
          </div>
          <p className="text-gray-600 text-xs mt-1.5">
            Only use this on your backend server (CI/CD, upload scripts). Exposing it in an APK
            lets anyone publish or delete releases on your behalf.
          </p>
        </div>
      </div>

      {/* Certificate fingerprint info */}
      <div className="rounded-2xl p-6"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} style={{ color: '#0095ff' }} />
          <h3 className="text-white font-semibold">Certificate Fingerprints</h3>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          When you upload your first APK, APK Hub stores its signing certificate fingerprint.
          Every subsequent upload must match — preventing signing key substitution attacks.
        </p>
        <div className="flex flex-col gap-3">
          {APPS.map(app => (
            <div key={app.pkg} className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(0,149,255,0.04)', border: '1px solid rgba(0,149,255,0.12)' }}>
              <span className="text-lg">{app.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold">{app.name}</p>
                <code className="text-gray-500 text-xs font-mono-custom truncate block">{app.fingerprint}</code>
              </div>
              <StatusBadge status="clean" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>('overview')
  const [showUpload, setShowUpload] = useState(false)
  const [expandedApp, setExpandedApp] = useState<string | null>('com.notely.app')

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 size={16} /> },
    { id: 'apps', label: 'My Apps', icon: <Package size={16} /> },
    { id: 'upload', label: 'Upload APK', icon: <Upload size={16} /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  ]

  return (
    <div className="min-h-screen pt-16 flex flex-col" style={{ background: '#080b10' }}>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}

      {/* Mobile tab bar */}
      <div className="md:hidden flex border-b border-white/5 overflow-x-auto"
        style={{ background: 'rgba(8,11,16,0.98)' }}>
        {navItems.filter(i => i.id !== 'upload').map(item => (
          <button key={item.id} onClick={() => setTab(item.id)}
            className="flex-1 min-w-max flex flex-col items-center gap-1 py-3 px-4 text-xs transition-all"
            style={{ color: tab === item.id ? '#00ff88' : '#6b7280', borderBottom: tab === item.id ? '2px solid #00ff88' : '2px solid transparent' }}>
            {item.icon}
            {item.label}
          </button>
        ))}
        <button onClick={() => setShowUpload(true)}
          className="flex-1 min-w-max flex flex-col items-center gap-1 py-3 px-4 text-xs"
          style={{ color: '#6b7280' }}>
          <Upload size={16} /> Upload
        </button>
      </div>

      <div className="flex flex-1">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-white/5 pt-8 pb-6 px-3 sticky top-16 h-[calc(100vh-64px)]">
        <div className="px-3 mb-6">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Developer</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg,#00ff88,#0095ff)' }}>D</div>
            <div>
              <p className="text-white text-sm font-medium">Developer</p>
              <p className="text-gray-500 text-xs">Pro plan</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 flex-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setTab(item.id); if (item.id === 'upload') setShowUpload(true) }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all text-left"
              style={{
                color: tab === item.id ? '#00ff88' : '#6b7280',
                background: tab === item.id ? 'rgba(0,255,136,0.07)' : 'transparent',
                borderLeft: tab === item.id ? '2px solid #00ff88' : '2px solid transparent',
              }}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-3 pt-4 border-t border-white/5">
          <button onClick={() => setShowUpload(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg,#00ff88,#0095ff)', color: '#000' }}>
            <Plus size={15} /> New Release
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 px-6 lg:px-10 py-8 min-w-0">

        {/* Settings Tab */}
        {tab === 'settings' && <SettingsTab />}

        {/* Overview / Analytics / Upload tabs */}
        {(tab === 'overview' || tab === 'upload' || tab === 'analytics') && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white font-display">Dashboard</h1>
                <p className="text-gray-400 text-sm mt-1">Here's what's happening with your apps.</p>
              </div>
              <button onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg,#00ff88,#0095ff)', color: '#000' }}>
                <Upload size={15} /> Upload APK
              </button>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {METRICS.map(m => (
                <div key={m.label} className="p-5 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ color: m.color }}>{m.icon}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: `${m.color}15`, color: m.color }}>
                      {m.delta}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white font-display">{m.value}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* App list summary */}
              <div className="lg:col-span-2 rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white font-semibold">Your Apps</h3>
                  <button onClick={() => setTab('apps')} className="text-xs flex items-center gap-1"
                    style={{ color: '#00ff88' }}>
                    Manage <ChevronRight size={12} />
                  </button>
                </div>
                {APPS.map(app => (
                  <div key={app.pkg} className="flex items-center gap-4 py-3.5 border-b border-white/5 last:border-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: 'rgba(255,255,255,0.04)' }}>
                      {app.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium">{app.name}</span>
                        <StatusBadge status={app.scanStatus} />
                      </div>
                      <span className="text-gray-500 text-xs">v{app.versions[0].name} · {app.versions[0].rollout}% rollout</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm font-semibold">{app.totalDownloads.toLocaleString()}</div>
                      <div className="text-gray-500 text-xs">downloads</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Activity feed */}
              <div className="rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-white font-semibold mb-5">Recent Activity</h3>
                <div className="flex flex-col gap-4">
                  {ACTIVITY.map((a, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: `${a.color}15`, color: a.color }}>
                        {a.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-300 text-xs leading-relaxed">{a.msg}</p>
                        <p className="text-gray-600 text-xs mt-0.5">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Download chart (simulated) */}
            <div className="mt-6 rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold">Downloads — Last 30 days</h3>
                <span className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(0,255,136,0.08)', color: '#00ff88' }}>
                  +12% vs last month
                </span>
              </div>
              <div className="flex items-end gap-1.5 h-28">
                {[22,35,28,42,38,55,48,60,52,70,65,80,72,68,75,82,78,90,85,92,88,95,82,89,96,100,94,98,92,100]
                  .map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-sm transition-all hover:opacity-80"
                      style={{
                        height: `${h}%`,
                        background: i >= 25
                          ? 'linear-gradient(to top, #00ff88, #0095ff)'
                          : 'rgba(255,255,255,0.08)',
                      }} />
                  ))}
              </div>
              <div className="flex justify-between mt-2 text-gray-600 text-xs">
                <span>Apr 15</span><span>Apr 30</span><span>May 15</span>
              </div>
            </div>
          </>
        )}

        {/* My Apps Tab */}
        {tab === 'apps' && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white font-display">My Apps</h1>
                <p className="text-gray-400 text-sm mt-1">{APPS.length} published apps</p>
              </div>
              <button onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg,#00ff88,#0095ff)', color: '#000' }}>
                <Plus size={15} /> New App
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {APPS.map(app => (
                <div key={app.pkg} className="rounded-2xl overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}>

                  {/* App header */}
                  <button
                    className="w-full flex items-center gap-4 p-5 text-left transition-all hover:bg-white/[0.02]"
                    onClick={() => setExpandedApp(expandedApp === app.pkg ? null : app.pkg)}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {app.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold">{app.name}</span>
                        <StatusBadge status={app.scanStatus} />
                        <span className="text-gray-600 text-xs font-mono-custom">{app.pkg}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Download size={11} /> {app.totalDownloads.toLocaleString()} installs</span>
                        <span className="flex items-center gap-1"><Star size={11} fill="currentColor" style={{ color: '#f59e0b' }} /> {app.rating}</span>
                        <span className="flex items-center gap-1"><Eye size={11} /> {app.reviews} reviews</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={e => { e.stopPropagation(); setShowUpload(true) }}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: 'rgba(0,255,136,0.08)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.15)' }}>
                        <Upload size={12} /> Upload
                      </button>
                      <ChevronRight size={16} className="text-gray-600 transition-transform"
                        style={{ transform: expandedApp === app.pkg ? 'rotate(90deg)' : 'none' }} />
                    </div>
                  </button>

                  {/* Versions table */}
                  {expandedApp === app.pkg && (
                    <div className="border-t border-white/5">
                      <div className="px-5 py-3 text-xs font-semibold uppercase tracking-widest"
                        style={{ color: '#4b5563', background: '#0a0e17' }}>
                        Version History
                      </div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            {['Version', 'Code', 'Status', 'Rollout', 'Downloads', 'Published', ''].map(h => (
                              <th key={h} className="text-left px-5 py-3 text-xs text-gray-600 font-semibold">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {app.versions.map(v => (
                            <tr key={v.code} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                              className="hover:bg-white/[0.01] transition-colors">
                              <td className="px-5 py-3.5 text-white font-semibold">v{v.name}</td>
                              <td className="px-5 py-3.5 font-mono-custom text-gray-500 text-xs">{v.code}</td>
                              <td className="px-5 py-3.5"><StatusBadge status={v.status} /></td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                    <div className="h-full rounded-full" style={{ width: `${v.rollout}%`, background: v.rollout === 100 ? '#00ff88' : '#0095ff' }} />
                                  </div>
                                  <span className="text-xs text-gray-400">{v.rollout}%</span>
                                </div>
                              </td>
                              <td className="px-5 py-3.5 text-gray-400 text-xs">{v.downloads.toLocaleString()}</td>
                              <td className="px-5 py-3.5 text-gray-500 text-xs">{v.published}</td>
                              <td className="px-5 py-3.5">
                                {v.rollout < 100 && v.status === 'live' && (
                                  <button className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg"
                                    style={{ color: '#0095ff', background: 'rgba(0,149,255,0.08)', border: '1px solid rgba(0,149,255,0.15)' }}>
                                    <RefreshCw size={11} /> Expand
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="px-5 py-4 flex items-center justify-between border-t border-white/5">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                            style={{ background: 'rgba(0,149,255,0.06)', color: '#0095ff', border: '1px solid rgba(0,149,255,0.12)' }}>
                            Channel: {app.channel}
                          </span>
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                            style={{ background: 'rgba(255,255,255,0.04)', color: '#6b7280' }}>
                            <Shield size={11} /> Cert: locked
                          </span>
                        </div>
                        <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
                          <ArrowUpRight size={12} /> View on APKHub
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

      </main>
      </div>
    </div>
  )
}
