import express from 'express'
import cors from 'cors'
import path from 'path'
import authRoutes from './routes/auth'
import appRoutes from './routes/apps'
import releaseRoutes from './routes/releases'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// Serve uploaded APK files (the download route handles this, but also direct serve)
app.use('/uploads', express.static(path.join(__dirname, '../../data/apks')))

app.use('/api/auth', authRoutes)
app.use('/api/apps', appRoutes)
app.use('/api/releases', releaseRoutes)
// SDK update check endpoint also lives under releases
app.use('/api/update', releaseRoutes)

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }))

app.listen(PORT, () => {
  console.log(`APK Hub API running on http://localhost:${PORT}`)
})
