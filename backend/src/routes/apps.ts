import { Router, Response } from 'express'
import { v4 as uuid } from 'uuid'
import db from '../db'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { generatePublicKey, generateSecretKey } from '../utils/keys'

const router = Router()

// ── Public routes ──────────────────────────────────────────────────────────

// GET /api/apps  — browse all public apps
router.get('/', (req, res: Response): void => {
  const { q, category, sort = 'downloads' } = req.query as Record<string, string>

  let query = `
    SELECT a.id, a.package_name, a.name, a.description, a.icon_url,
           a.category, a.created_at,
           COUNT(DISTINCT r.id) AS release_count,
           COALESCE(SUM(r.downloads), 0) AS total_downloads,
           COALESCE(AVG(rv.rating), 0) AS avg_rating,
           COUNT(DISTINCT rv.id) AS review_count,
           (SELECT version_name FROM releases WHERE app_id = a.id AND status = 'live' ORDER BY version_code DESC LIMIT 1) AS latest_version,
           (SELECT version_code FROM releases WHERE app_id = a.id AND status = 'live' ORDER BY version_code DESC LIMIT 1) AS latest_version_code
    FROM apps a
    LEFT JOIN releases r ON r.app_id = a.id AND r.status = 'live'
    LEFT JOIN reviews rv ON rv.app_id = a.id
    WHERE 1=1
  `
  const params: any[] = []

  if (q) {
    query += ` AND (a.name LIKE ? OR a.package_name LIKE ? OR a.description LIKE ?)`
    params.push(`%${q}%`, `%${q}%`, `%${q}%`)
  }
  if (category) {
    query += ` AND a.category = ?`
    params.push(category)
  }

  query += ` GROUP BY a.id`

  const orderMap: Record<string, string> = {
    downloads: 'total_downloads DESC',
    rating: 'avg_rating DESC',
    newest: 'a.created_at DESC',
  }
  query += ` ORDER BY ${orderMap[sort] || orderMap.downloads}`

  const apps = db.prepare(query).all(...params)
  res.json({ apps })
})

// GET /api/apps/:pkg — single app detail (public)
router.get('/:pkg', (req, res: Response): void => {
  const app = db.prepare(`
    SELECT a.*, u.name AS developer_name,
           COALESCE(AVG(rv.rating), 0) AS avg_rating,
           COUNT(DISTINCT rv.id) AS review_count,
           COALESCE(SUM(r.downloads), 0) AS total_downloads
    FROM apps a
    JOIN users u ON u.id = a.owner_id
    LEFT JOIN releases r ON r.app_id = a.id AND r.status = 'live'
    LEFT JOIN reviews rv ON rv.app_id = a.id
    WHERE a.package_name = ?
    GROUP BY a.id
  `).get(req.params.pkg) as any

  if (!app) { res.status(404).json({ error: 'App not found' }); return }

  // Strip keys from public response
  delete app.secret_key
  delete app.public_key
  delete app.owner_id

  const releases = db.prepare(`
    SELECT id, version_name, version_code, channel, status, rollout_percent,
           mandatory, update_strategy, release_notes, apk_size, sha256,
           cert_fingerprint, min_sdk, target_sdk, downloads, created_at
    FROM releases WHERE app_id = ? AND status IN ('live','archived')
    ORDER BY version_code DESC
  `).all(app.id)

  const reviews = db.prepare(`
    SELECT id, user_name, rating, body, created_at
    FROM reviews WHERE app_id = ?
    ORDER BY created_at DESC LIMIT 20
  `).all(app.id)

  res.json({ app, releases, reviews })
})

// ── Authenticated routes ───────────────────────────────────────────────────

// GET /api/apps/dashboard/mine — developer's own apps
router.get('/dashboard/mine', requireAuth, (req: AuthRequest, res: Response): void => {
  const apps = db.prepare(`
    SELECT a.id, a.package_name, a.name, a.description, a.icon_url,
           a.category, a.public_key, a.secret_key, a.cert_fingerprint, a.created_at,
           COALESCE(SUM(r.downloads), 0) AS total_downloads,
           COALESCE(AVG(rv.rating), 0) AS avg_rating,
           COUNT(DISTINCT rv.id) AS review_count
    FROM apps a
    LEFT JOIN releases r ON r.app_id = a.id
    LEFT JOIN reviews rv ON rv.app_id = a.id
    WHERE a.owner_id = ?
    GROUP BY a.id
    ORDER BY a.created_at DESC
  `).all(req.userId)

  const appsWithReleases = (apps as any[]).map(app => {
    const releases = db.prepare(`
      SELECT id, version_name, version_code, channel, status,
             rollout_percent, mandatory, release_notes, apk_size,
             sha256, downloads, created_at
      FROM releases WHERE app_id = ?
      ORDER BY version_code DESC
    `).all(app.id)
    return { ...app, releases }
  })

  res.json({ apps: appsWithReleases })
})

// POST /api/apps — create a new app entry
router.post('/', requireAuth, (req: AuthRequest, res: Response): void => {
  const { package_name, name, description = '', category = 'Utilities', website_url = '' } = req.body
  if (!package_name || !name) {
    res.status(400).json({ error: 'package_name and name are required' })
    return
  }

  // Validate package name format
  if (!/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(package_name)) {
    res.status(400).json({ error: 'Invalid package name format (e.g. com.example.myapp)' })
    return
  }

  const existing = db.prepare('SELECT id FROM apps WHERE package_name = ?').get(package_name)
  if (existing) {
    res.status(409).json({ error: 'Package name already registered' })
    return
  }

  const id = uuid()
  const public_key = generatePublicKey()
  const secret_key = generateSecretKey()

  db.prepare(`
    INSERT INTO apps (id, owner_id, package_name, name, description, category, website_url, public_key, secret_key)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.userId, package_name, name, description, category, website_url, public_key, secret_key)

  const app = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId) as any
  res.status(201).json({
    app: { id, package_name, name, description, category, website_url, public_key, secret_key, releases: [] }
  })
})

// PUT /api/apps/:id — update app metadata
router.put('/:id', requireAuth, (req: AuthRequest, res: Response): void => {
  const app = db.prepare('SELECT * FROM apps WHERE id = ? AND owner_id = ?').get(req.params.id, req.userId) as any
  if (!app) { res.status(404).json({ error: 'App not found' }); return }

  const { name, description, category, website_url } = req.body
  db.prepare(`
    UPDATE apps SET name = COALESCE(?, name), description = COALESCE(?, description),
    category = COALESCE(?, category), website_url = COALESCE(?, website_url)
    WHERE id = ?
  `).run(name ?? null, description ?? null, category ?? null, website_url ?? null, req.params.id)

  res.json({ ok: true })
})

// DELETE /api/apps/:id
router.delete('/:id', requireAuth, (req: AuthRequest, res: Response): void => {
  const app = db.prepare('SELECT id FROM apps WHERE id = ? AND owner_id = ?').get(req.params.id, req.userId)
  if (!app) { res.status(404).json({ error: 'App not found' }); return }
  db.prepare('DELETE FROM apps WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

export default router
