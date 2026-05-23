const BASE = '/api'

function token() {
  return localStorage.getItem('apkhub_token')
}

function headers(extra: Record<string, string> = {}) {
  const h: Record<string, string> = { 'Content-Type': 'application/json', ...extra }
  const t = token()
  if (t) h['Authorization'] = `Bearer ${t}`
  return h
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data as T
}

export const api = {
  // Auth
  signup: (name: string, email: string, password: string) =>
    request<{ token: string; user: User }>('POST', '/auth/signup', { name, email, password }),

  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('POST', '/auth/login', { email, password }),

  me: () => request<{ user: User }>('GET', '/auth/me'),

  // Browse
  getApps: (params?: { q?: string; category?: string; sort?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString()
    return request<{ apps: AppSummary[] }>('GET', `/apps${qs ? '?' + qs : ''}`)
  },

  getApp: (pkg: string) =>
    request<{ app: AppDetail; releases: Release[]; reviews: Review[] }>('GET', `/apps/${pkg}`),

  // Dashboard
  getMyApps: () => request<{ apps: DashApp[] }>('GET', '/apps/dashboard/mine'),

  createApp: (data: { package_name: string; name: string; description?: string; category?: string; website_url?: string }) =>
    request<{ app: DashApp }>('POST', '/apps', data),

  updateApp: (id: string, data: Partial<{ name: string; description: string; category: string; website_url: string }>) =>
    request<{ ok: boolean }>('PUT', `/apps/${id}`, data),

  deleteApp: (id: string) =>
    request<{ ok: boolean }>('DELETE', `/apps/${id}`),

  // Releases
  uploadApk: async (formData: FormData) => {
    const res = await fetch(`${BASE}/releases/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token()}` },
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
    return data as { release: Release }
  },

  uploadFromDrive: (data: {
    app_id: string; drive_url: string; channel?: string
    rollout_percent?: number; mandatory?: boolean; release_notes?: string
    allow_downgrade?: boolean; update_strategy?: string
  }) => request<{ release: Release }>('POST', '/releases/from-drive', data),

  patchRelease: (id: string, data: Partial<{ rollout_percent: number; status: string; mandatory: boolean; release_notes: string }>) =>
    request<{ ok: boolean }>('PATCH', `/releases/${id}`, data),
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  plan: string
}

export interface AppSummary {
  id: string
  package_name: string
  name: string
  description: string
  icon_url: string
  category: string
  created_at: number
  release_count: number
  total_downloads: number
  avg_rating: number
  review_count: number
  latest_version: string | null
  latest_version_code: number | null
}

export interface AppDetail {
  id: string
  package_name: string
  name: string
  description: string
  icon_url: string
  category: string
  website_url: string
  developer_name: string
  avg_rating: number
  review_count: number
  total_downloads: number
  cert_fingerprint: string
  created_at: number
}

export interface Release {
  id: string
  version_name: string
  version_code: number
  channel: string
  status: string
  rollout_percent: number
  mandatory: boolean
  update_strategy: string
  release_notes: string
  apk_size: number
  sha256: string
  cert_fingerprint: string
  min_sdk: number
  target_sdk: number
  downloads: number
  created_at: number
}

export interface Review {
  id: string
  user_name: string
  rating: number
  body: string
  created_at: number
}

export interface DashApp {
  id: string
  package_name: string
  name: string
  description: string
  icon_url: string
  category: string
  public_key: string
  secret_key: string
  cert_fingerprint: string
  created_at: number
  total_downloads: number
  avg_rating: number
  review_count: number
  releases: Release[]
}
