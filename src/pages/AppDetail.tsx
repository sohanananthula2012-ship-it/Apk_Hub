import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Star, Download, Shield, ChevronLeft,
  CheckCircle, Clock, Globe, Package, AlertCircle
} from 'lucide-react'
import { api, AppDetail as AppDetailType, Release, Review } from '../lib/api'

function fmt(bytes: number) {
  if (!bytes) return '—'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function timeAgo(ts: number) {
  const diff = Date.now() / 1000 - ts
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`
  return new Date(ts * 1000).toLocaleDateString()
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={12}
          fill={i <= Math.round(rating) ? '#f59e0b' : 'transparent'}
          style={{ color: i <= Math.round(rating) ? '#f59e0b' : '#374151' }} />
      ))}
    </div>
  )
}

export default function AppDetailPage() {
  const { pkg } = useParams<{ pkg: string }>()
  const [app, setApp] = useState<AppDetailType | null>(null)
  const [releases, setReleases] = useState<Release[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'about' | 'versions' | 'reviews'>('about')

  useEffect(() => {
    if (!pkg) return
    setLoading(true)
    api.getApp(pkg)
      .then(({ app, releases, reviews }) => {
        setApp(app)
        setReleases(releases)
        setReviews(reviews)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [pkg])

  const latestRelease = releases.find(r => r.status === 'live')
  const initials = app?.name.slice(0, 2).toUpperCase() || '??'
  const colors = ['#00ff88', '#0095ff', '#c792ea', '#f59e0b', '#f97316', '#ec4899']
  const color = app ? colors[app.name.charCodeAt(0) % colors.length] : '#00ff88'

  if (loading) return (
    <div className="min-h-screen pt-16 flex items-center justify-center" style={{ background: '#080b10' }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#00ff88', borderTopColor: 'transparent' }} />
    </div>
  )

  if (error || !app) return (
    <div className="min-h-screen pt-16 flex flex-col items-center justify-center gap-4" style={{ background: '#080b10' }}>
      <AlertCircle size={40} style={{ color: '#f97316' }} />
      <h2 className="text-white font-bold text-xl">{error || 'App not found'}</h2>
      <Link to="/browse" className="text-sm px-4 py-2 rounded-xl"
        style={{ background: 'rgba(0,255,136,0.08)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}>
        ← Back to Browse
      </Link>
    </div>
  )

  const downloadUrl = latestRelease ? `/api/releases/${latestRelease.id}/download` : null

  return (
    <div className="min-h-screen pt-16" style={{ background: '#080b10' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Link to="/browse" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white mb-6 transition-colors">
          <ChevronLeft size={14} /> Browse
        </Link>

        {/* App header */}
        <div className="flex items-start gap-5 mb-8">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center font-bold text-2xl shrink-0"
            style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
            {app.icon_url ? <img src={app.icon_url} className="w-full h-full rounded-3xl object-cover" alt="" /> : initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white font-display">{app.name}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{app.developer_name} · {app.category}</p>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {app.review_count > 0 && (
                <div className="flex items-center gap-1.5">
                  <Stars rating={app.avg_rating} />
                  <span className="text-sm text-gray-400">{app.avg_rating.toFixed(1)} ({app.review_count})</span>
                </div>
              )}
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Download size={13} /> {app.total_downloads.toLocaleString()} downloads
              </span>
              {latestRelease && (
                <span className="text-xs px-2 py-0.5 rounded-md font-mono-custom"
                  style={{ background: 'rgba(0,255,136,0.06)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.15)' }}>
                  v{latestRelease.version_name}
                </span>
              )}
            </div>
          </div>
          {downloadUrl && (
            <a href={downloadUrl}
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg,#00ff88,#0095ff)', color: '#000' }}>
              <Download size={15} /> Download APK
            </a>
          )}
        </div>

        {/* Security badges */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { icon: <Shield size={12} />, label: 'SHA-256 verified', color: '#00ff88' },
            { icon: <CheckCircle size={12} />, label: 'Certificate locked', color: '#0095ff' },
            ...(latestRelease ? [
              { icon: <Clock size={12} />, label: `Updated ${timeAgo(latestRelease.created_at)}`, color: '#6b7280' },
              { icon: <Package size={12} />, label: `Min Android API ${latestRelease.min_sdk}`, color: '#6b7280' },
            ] : []),
          ].map(b => (
            <div key={b.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: `${b.color}10`, color: b.color, border: `1px solid ${b.color}25` }}>
              {b.icon} {b.label}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-white/5 mb-6">
          {(['about', 'versions', 'reviews'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2.5 text-sm font-medium capitalize transition-colors"
              style={{
                color: tab === t ? '#00ff88' : '#6b7280',
                borderBottom: tab === t ? '2px solid #00ff88' : '2px solid transparent',
              }}>{t} {t === 'versions' ? `(${releases.length})` : t === 'reviews' ? `(${reviews.length})` : ''}</button>
          ))}
        </div>

        {/* About */}
        {tab === 'about' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h3 className="text-white font-semibold mb-3">Description</h3>
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                {app.description || 'No description provided.'}
              </p>
              {app.website_url && (
                <a href={app.website_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-sm"
                  style={{ color: '#0095ff' }}>
                  <Globe size={14} /> Visit website
                </a>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h4 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-widest">App Info</h4>
                {[
                  { label: 'Package', value: app.package_name },
                  { label: 'Category', value: app.category },
                  ...(latestRelease ? [
                    { label: 'Version', value: latestRelease.version_name },
                    { label: 'Size', value: fmt(latestRelease.apk_size) },
                    { label: 'Min Android', value: `API ${latestRelease.min_sdk}` },
                    { label: 'Target Android', value: `API ${latestRelease.target_sdk}` },
                  ] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-xs text-gray-300 font-mono-custom text-right max-w-[60%] truncate">{value}</span>
                  </div>
                ))}
              </div>
              {app.cert_fingerprint && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(0,149,255,0.04)', border: '1px solid rgba(0,149,255,0.15)' }}>
                  <h4 className="text-xs font-semibold mb-2" style={{ color: '#0095ff' }}>
                    <Shield size={11} className="inline mr-1" />Certificate Fingerprint
                  </h4>
                  <p className="text-xs font-mono-custom text-gray-500 break-all">{app.cert_fingerprint}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Versions */}
        {tab === 'versions' && (
          <div className="flex flex-col gap-3">
            {releases.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">No releases yet.</p>
            ) : releases.map(r => (
              <div key={r.id} className="p-5 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold">v{r.version_name}</span>
                      <span className="text-xs font-mono-custom text-gray-600">code {r.version_code}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md"
                        style={{
                          background: r.status === 'live' ? 'rgba(0,255,136,0.08)' : 'rgba(255,255,255,0.04)',
                          color: r.status === 'live' ? '#00ff88' : '#6b7280',
                        }}>
                        {r.status}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md"
                        style={{ background: 'rgba(0,149,255,0.06)', color: '#0095ff' }}>
                        {r.channel}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs mt-1">{timeAgo(r.created_at)} · {fmt(r.apk_size)} · {r.downloads} downloads</p>
                  </div>
                  {r.status === 'live' && (
                    <a href={`/api/releases/${r.id}/download`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: 'rgba(0,255,136,0.08)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.15)' }}>
                      <Download size={12} /> Download
                    </a>
                  )}
                </div>
                {r.release_notes && (
                  <p className="text-gray-400 text-xs mt-3 leading-relaxed">{r.release_notes}</p>
                )}
                <div className="mt-3 p-2 rounded-lg text-xs font-mono-custom text-gray-600 break-all"
                  style={{ background: 'rgba(0,0,0,0.3)' }}>
                  SHA-256: {r.sha256 || '—'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reviews */}
        {tab === 'reviews' && (
          <div>
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">No reviews yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.map(r => (
                  <div key={r.id} className="p-4 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88' }}>
                          {r.user_name[0].toUpperCase()}
                        </div>
                        <span className="text-white text-sm font-medium">{r.user_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Stars rating={r.rating} />
                        <span className="text-gray-600 text-xs">{timeAgo(r.created_at)}</span>
                      </div>
                    </div>
                    {r.body && <p className="text-gray-400 text-sm leading-relaxed">{r.body}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
