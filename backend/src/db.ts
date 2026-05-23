import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DATA_DIR = path.join(__dirname, '../../data')
const UPLOADS_DIR = path.join(DATA_DIR, 'apks')

fs.mkdirSync(DATA_DIR, { recursive: true })
fs.mkdirSync(UPLOADS_DIR, { recursive: true })

const db = new Database(path.join(DATA_DIR, 'apkhub.db'))

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    email       TEXT UNIQUE NOT NULL,
    name        TEXT NOT NULL,
    password    TEXT NOT NULL,
    plan        TEXT NOT NULL DEFAULT 'free',
    created_at  INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS apps (
    id                   TEXT PRIMARY KEY,
    owner_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    package_name         TEXT UNIQUE NOT NULL,
    name                 TEXT NOT NULL,
    description          TEXT NOT NULL DEFAULT '',
    icon_url             TEXT NOT NULL DEFAULT '',
    category             TEXT NOT NULL DEFAULT 'Utilities',
    website_url          TEXT NOT NULL DEFAULT '',
    public_key           TEXT UNIQUE NOT NULL,
    secret_key           TEXT UNIQUE NOT NULL,
    cert_fingerprint     TEXT NOT NULL DEFAULT '',
    created_at           INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS releases (
    id               TEXT PRIMARY KEY,
    app_id           TEXT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    version_name     TEXT NOT NULL,
    version_code     INTEGER NOT NULL,
    channel          TEXT NOT NULL DEFAULT 'stable',
    status           TEXT NOT NULL DEFAULT 'pending',
    rollout_percent  INTEGER NOT NULL DEFAULT 100,
    mandatory        BOOLEAN NOT NULL DEFAULT 0,
    allow_downgrade  BOOLEAN NOT NULL DEFAULT 0,
    update_strategy  TEXT NOT NULL DEFAULT 'FLEXIBLE',
    release_notes    TEXT NOT NULL DEFAULT '',
    apk_path         TEXT NOT NULL,
    apk_size         INTEGER NOT NULL DEFAULT 0,
    sha256           TEXT NOT NULL DEFAULT '',
    cert_fingerprint TEXT NOT NULL DEFAULT '',
    min_sdk          INTEGER NOT NULL DEFAULT 21,
    target_sdk       INTEGER NOT NULL DEFAULT 34,
    downloads        INTEGER NOT NULL DEFAULT 0,
    created_at       INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id         TEXT PRIMARY KEY,
    app_id     TEXT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    user_name  TEXT NOT NULL,
    rating     INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    body       TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
`)

export { UPLOADS_DIR }
export default db
