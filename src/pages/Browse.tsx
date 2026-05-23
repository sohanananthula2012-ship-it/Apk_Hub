import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, Shield, Download, Star, Package } from 'lucide-react'
import { api, AppSummary } from '../lib/api'

const CATEGORIES = ['All', 'Productivity', 'Photography', 'Finance', 'Music', 'Navigation',
  'Utilities', 'Developer Tools', 'Health', 'Weather', 'Games', 'Education']

function AppCard({ app }: { app: AppSummary }) {
  const initials = app.name.slice(0, 2).toUpperCase()
  const colors = ['#00ff88', '#0095ff', '#c792ea', '#f59e0b', '#f97316', '#ec4899']
  const color = colors[app.name.charCodeAt(0) % colors.length]

  return (
    <Link to={`/app/${app.package_name}`}
      className="group rounded-2xl p-5 flex flex-col gap-4 transition-all hover:-translate-y-0.5"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold shrink-0"
          style={{ background: `${color}18`, color, border: `1px solid ${color}30`, fontSize: '1.3rem' }}>
          {app.icon_url ? <img src={app.icon_url} className="w-full h-full rounded-2xl object-cover" alt="" /> : initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-semibold text-sm">{app.name}</h3>
            {app.latest_version && (
              <span className="text-xs px-1.5 py-0.5 rounded-md font-mono-custom"
                style={{ background: 'rgba(0,255,136,0.06)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.15)' }}>
                v{app.latest_version}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-xs mt-0.5 font-mono-custom truncate">{app.package_name}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.04)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.06)' }}>
              {app.category}
            </span>
            {app.review_count > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Star size={10} fill="currentColor" style={{ color: '#f59e0b' }} />
                {app.avg_rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>
      {app.description && (
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{app.description}</p>
      )}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Download size={11} /> {app.total_downloads.toLocaleString()} downloads
        </div>
        <div className="flex items-center gap-1 text-xs" style={{ color: '#00ff88' }}>
          <Shield size={10} /> Verified
        </div>
      </div>
    </Link>
  )
}

export default function Browse() {
  const [apps, setApps] = useState<AppSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [inputVal, setInputVal] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('downloads')

  const fetchApps = useCallback(async () => {
    setLoading(true)
    try {
      const { apps } = await api.getApps({
        q: query || undefined,
        category: category !== 'All' ? category : undefined,
        sort,
      })
      setApps(apps)
    } catch {
      setApps([])
    } finally {
      setLoading(false)
    }
  }, [query, category, sort])

  useEffect(() => { fetchApps() }, [fetchApps])

  useEffect(() => {
    const t = setTimeout(() => setQuery(inputVal), 350)
    return () => clearTimeout(t)
  }, [inputVal])

  return (
    <div className="min-h-screen pt-16" style={{ background: '#080b10' }}>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 font-display">Browse Apps</h1>
          <p className="text-gray-400 text-sm">Discover and install indie Android apps</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4b5563' }} />
            <input
              value={inputVal} onChange={e => setInputVal(e.target.value)}
              placeholder="Search apps, package names…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm text-gray-300 outline-none cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <option value="downloads">Most Downloads</option>
            <option value="rating">Top Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: category === c ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${category === c ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.07)'}`,
                color: category === c ? '#00ff88' : '#6b7280',
              }}>{c}</button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 rounded-2xl animate-pulse"
                style={{ background: 'rgba(255,255,255,0.03)' }} />
            ))}
          </div>
        ) : apps.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <Package size={40} className="mb-4" style={{ color: '#374151' }} />
            <h3 className="text-white font-semibold text-lg mb-2">No apps found</h3>
            {query ? (
              <>
                <p className="text-gray-500 text-sm mb-4">No results for "{query}"</p>
                <button onClick={() => { setInputVal(''); setQuery('') }}
                  className="text-sm px-4 py-2 rounded-xl"
                  style={{ background: 'rgba(0,255,136,0.08)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}>
                  Clear search
                </button>
              </>
            ) : (
              <p className="text-gray-500 text-sm">No apps published yet. Be the first!</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {apps.map(app => <AppCard key={app.id} app={app} />)}
          </div>
        )}

        {!loading && apps.length > 0 && (
          <p className="text-center text-gray-600 text-xs mt-8">{apps.length} app{apps.length !== 1 ? 's' : ''}</p>
        )}
      </div>
    </div>
  )
}
