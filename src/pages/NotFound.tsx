import { Link } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-6" style={{ background: '#080b10' }}>
      <div className="text-center max-w-md">
        <div className="relative mb-8 inline-block">
          <div className="text-[10rem] font-bold font-display leading-none select-none"
            style={{
              background: 'linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,149,255,0.15))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              📦
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white font-display mb-3">Page not found</h1>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist — or maybe that APK was never uploaded.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
            style={{ background: 'linear-gradient(135deg,#00ff88,#0095ff)', color: '#000' }}>
            <ArrowLeft size={16} /> Go Home
          </Link>
          <Link to="/browse"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border"
            style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#e2e8f0' }}>
            <Search size={16} /> Browse Apps
          </Link>
        </div>
      </div>
    </div>
  )
}
