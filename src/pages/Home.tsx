import { Link } from 'react-router-dom'
import { Package, Shield, Download, Zap, Terminal, Star, ArrowRight, ChevronRight, Code2, Globe, Users } from 'lucide-react'

const apps = [
  { name: 'Notely', category: 'Productivity', rating: 4.8, downloads: '12k', icon: '📝', pkg: 'com.notely.app', version: '2.4.0' },
  { name: 'PixelCam', category: 'Photography', rating: 4.6, downloads: '8.2k', icon: '📷', pkg: 'com.pixelcam.app', version: '1.9.1' },
  { name: 'BudgetFlow', category: 'Finance', rating: 4.9, downloads: '21k', icon: '💰', pkg: 'com.budgetflow.app', version: '3.1.2' },
  { name: 'SoundWave', category: 'Music', rating: 4.5, downloads: '5.6k', icon: '🎵', pkg: 'com.soundwave.app', version: '1.2.0' },
  { name: 'TaskBlitz', category: 'Productivity', rating: 4.7, downloads: '9.4k', icon: '⚡', pkg: 'com.taskblitz.app', version: '2.0.3' },
  { name: 'MapKit', category: 'Navigation', rating: 4.3, downloads: '3.1k', icon: '🗺️', pkg: 'com.mapkit.app', version: '1.0.8' },
]

export default function Home() {
  return (
    <div className="min-h-screen pt-16" style={{ background: '#080b10' }}>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-20"
          style={{ background: 'radial-gradient(circle, #00ff88 0%, #0095ff 100%)' }} />

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8"
            style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', color: '#00ff88' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-current pulse-dot" />
            Now live — 1,240+ indie apps and growing
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-display"
            style={{ letterSpacing: '-0.04em', lineHeight: '1.05' }}>
            The indie Android
            <br />
            <span style={{ background: 'linear-gradient(135deg,#00ff88,#0095ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              app marketplace
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Publish, distribute, and update Android apps without the Play Store.
            Built for indie developers who ship fast and own their ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/browse"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base transition-all"
              style={{ background: 'linear-gradient(135deg,#00ff88,#0095ff)', color: '#000' }}>
              Browse Apps
              <ArrowRight size={18} />
            </Link>
            <Link to="/sdk"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base border transition-all"
              style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#e2e8f0' }}>
              <Terminal size={18} />
              SDK Docs
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-10 mt-16 pt-10 border-t border-white/5">
            {[
              { val: '1,240+', label: 'Published Apps' },
              { val: '86k+', label: 'Total Downloads' },
              { val: '340+', label: 'Indie Developers' },
              { val: '99.8%', label: 'Uptime' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-white font-display" style={{ color: '#00ff88' }}>{s.val}</div>
                <div className="text-gray-500 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Apps */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white font-display">Featured Apps</h2>
            <p className="text-gray-400 text-sm mt-1">Handpicked indie apps worth installing</p>
          </div>
          <Link to="/browse" className="flex items-center gap-1 text-sm font-medium transition-colors"
            style={{ color: '#00ff88' }}>
            See all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map(app => (
            <Link key={app.pkg} to={`/app/${app.pkg}`}
              className="group p-5 rounded-2xl transition-all hover:scale-[1.01]"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {app.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-base group-hover:text-[#00ff88] transition-colors">{app.name}</h3>
                  <p className="text-gray-500 text-xs mt-0.5">{app.category}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#f59e0b' }}>
                      <Star size={11} fill="currentColor" /> {app.rating}
                    </span>
                    <span className="text-gray-600 text-xs">{app.downloads} installs</span>
                    <span className="text-gray-600 text-xs">v{app.version}</span>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0"
                  style={{ background: 'rgba(0,255,136,0.08)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.15)' }}>
                  Install
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white font-display mb-3">How updates work</h2>
            <p className="text-gray-400 max-w-lg mx-auto">No Play Store required. Android's native signing verification keeps everything secure.</p>
          </div>
          <div className="grid md:grid-cols-5 gap-4 items-center">
            {[
              { icon: <Download size={20} />, label: 'User installs APK', desc: 'From APKHub website' },
              { icon: null, label: '→', desc: '' },
              { icon: <Code2 size={20} />, label: 'SDK checks updates', desc: 'On every app start' },
              { icon: null, label: '→', desc: '' },
              { icon: <Shield size={20} />, label: 'Android verifies', desc: 'Signature + package name' },
            ].map((step, i) => (
              step.icon === null
                ? <div key={i} className="hidden md:flex justify-center text-gray-700 text-xl font-bold">{step.label}</div>
                : <div key={i} className="p-6 rounded-2xl text-center"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88' }}>
                      {step.icon}
                    </div>
                    <h4 className="text-white text-sm font-semibold">{step.label}</h4>
                    <p className="text-gray-500 text-xs mt-1">{step.desc}</p>
                  </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white font-display mb-3">Everything you need</h2>
          <p className="text-gray-400 max-w-lg mx-auto">A complete platform for indie Android developers to publish and maintain their apps.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: <Terminal size={22} />, color: '#00ff88',
              title: 'Lightweight SDK',
              desc: 'A single Kotlin dependency. Drop it in, configure your API key, and updates just work.',
            },
            {
              icon: <Shield size={22} />, color: '#0095ff',
              title: 'Security-first',
              desc: 'SHA-256 verification, certificate fingerprint locking, and VirusTotal scanning on every upload.',
            },
            {
              icon: <Zap size={22} />, color: '#c792ea',
              title: 'Staged rollouts',
              desc: 'Release to 10% → 25% → 100% of users. Catch bugs before they reach everyone.',
            },
            {
              icon: <Globe size={22} />, color: '#ffb800',
              title: 'Beta channels',
              desc: 'stable / beta / nightly channels. Power users opt-in; everyone else gets stable.',
            },
            {
              icon: <Users size={22} />, color: '#f43f5e',
              title: 'Developer dashboard',
              desc: 'Upload APKs, manage versions, view analytics, and read user reviews in one place.',
            },
            {
              icon: <Package size={22} />, color: '#00ff88',
              title: 'Delta updates',
              desc: 'Ship only the changed bytes with bsdiff patching. 100 MB APK → 5 MB patch.',
            },
          ].map(f => (
            <div key={f.title} className="p-6 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${f.color}15`, color: f.color }}>
                {f.icon}
              </div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center rounded-3xl p-12"
          style={{ background: 'linear-gradient(135deg, rgba(0,255,136,0.06), rgba(0,149,255,0.06))', border: '1px solid rgba(0,255,136,0.12)' }}>
          <h2 className="text-3xl font-bold text-white font-display mb-4">Ship your first update today</h2>
          <p className="text-gray-400 mb-8">Join 340+ indie developers who trust APK Hub to distribute their Android apps.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold"
              style={{ background: 'linear-gradient(135deg,#00ff88,#0095ff)', color: '#000' }}>
              Start publishing
              <ArrowRight size={18} />
            </Link>
            <Link to="/sdk"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold border"
              style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#e2e8f0' }}>
              Read SDK docs
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
