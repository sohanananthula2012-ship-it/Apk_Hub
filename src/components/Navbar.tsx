import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Package, Menu, X, Terminal, ChevronRight } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  const links = [
    { to: '/browse', label: 'Browse' },
    { to: '/sdk', label: 'SDK' },
    { to: '/dashboard', label: 'Dashboard' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
      style={{ background: 'rgba(8,11,16,0.92)', backdropFilter: 'blur(16px)' }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#00ff88,#0095ff)' }}>
            <Package size={16} className="text-black" />
          </div>
          <span className="font-display font-800 text-white text-lg tracking-tight">
            APK<span style={{ color: '#00ff88' }}>Hub</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === l.to
                  ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
              style={pathname === l.to ? { color: '#00ff88' } : {}}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/sdk"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all"
            style={{ borderColor: 'rgba(0,255,136,0.3)', color: '#00ff88' }}>
            <Terminal size={14} />
            Get SDK
          </Link>
          <Link to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ background: 'linear-gradient(135deg,#00ff88,#0095ff)', color: '#000' }}>
            Publish App
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* Mobile menu btn */}
        <button className="md:hidden text-gray-400" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-white/5 px-6 py-4 flex flex-col gap-3"
          style={{ background: 'rgba(8,11,16,0.98)' }}>
          {links.map(l => (
            <Link key={l.to} to={l.to}
              onClick={() => setOpen(false)}
              className="text-gray-300 hover:text-white py-2 text-sm font-medium">
              {l.label}
            </Link>
          ))}
          <Link to="/dashboard" onClick={() => setOpen(false)}
            className="mt-2 text-center py-2 rounded-lg text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg,#00ff88,#0095ff)', color: '#000' }}>
            Publish App
          </Link>
        </div>
      )}
    </nav>
  )
}
