import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import db from '../db'
import { JWT_SECRET } from '../middleware/auth'

const router = Router()

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    res.status(400).json({ error: 'name, email and password are required' })
    return
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' })
    return
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) {
    res.status(409).json({ error: 'Email already in use' })
    return
  }

  const hashed = await bcrypt.hash(password, 12)
  const id = uuid()
  db.prepare('INSERT INTO users (id, email, name, password) VALUES (?, ?, ?, ?)').run(id, email.toLowerCase().trim(), name.trim(), hashed)

  const token = jwt.sign({ userId: id, email }, JWT_SECRET, { expiresIn: '30d' })
  res.status(201).json({ token, user: { id, name: name.trim(), email: email.toLowerCase().trim(), plan: 'free' } })
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' })
    return
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' })
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, plan: user.plan } })
})

// GET /api/auth/me
router.get('/me', (req: Request, res: Response): void => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { userId: string }
    const user = db.prepare('SELECT id, name, email, plan, created_at FROM users WHERE id = ?').get(payload.userId) as any
    if (!user) { res.status(401).json({ error: 'User not found' }); return }
    res.json({ user })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
