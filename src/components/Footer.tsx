import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-20 py-12 px-6"
      style={{ background: '#050710' }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#00ff88,#0095ff)' }}>
              <Package size={14} className="text-black" />
            </div>
            <span className="font-display font-bold text-white">
              APK<span style={{ color: '#00ff88' }}>Hub</span>
            </span>
          </div>
          <p className="text-gray-500 text-sm max-w-xs">
            The indie Android marketplace — publish, distribute, and update APKs without the Play Store.
          </p>
        </div>
        <div className="flex gap-12 text-sm">
          <div className="flex flex-col gap-2">
            <span className="text-gray-400 font-semibold mb-1">Platform</span>
            <Link to="/browse" className="text-gray-500 hover:text-gray-300">Browse Apps</Link>
            <Link to="/sdk" className="text-gray-500 hover:text-gray-300">SDK Docs</Link>
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-300">Dashboard</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-gray-400 font-semibold mb-1">Developers</span>
            <a href="#" className="text-gray-500 hover:text-gray-300">Publish</a>
            <a href="#" className="text-gray-500 hover:text-gray-300">API Docs</a>
            <a href="#" className="text-gray-500 hover:text-gray-300">Security</a>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <a href="#" className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all text-xs font-bold">
              GH
            </a>
            <a href="#" className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all text-xs font-bold">
              𝕏
            </a>
          </div>
          <span className="text-gray-600 text-xs">© 2026 APKHub. Open ecosystem.</span>
        </div>
      </div>
    </footer>
  )
}
