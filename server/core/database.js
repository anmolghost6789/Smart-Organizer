import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

let dbInstance = null;

export function getDatabase(dbFilePath = null) {
  if (dbInstance) return dbInstance;

  const defaultPath = path.join(process.cwd(), 'desktopor_data.sqlite');
  const targetPath = dbFilePath || defaultPath;

  const dbDir = path.dirname(targetPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  dbInstance = new DatabaseSync(targetPath);

  // Set WAL mode and pragmatic performance settings
  dbInstance.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS scans (
      id TEXT PRIMARY KEY,
      folder_path TEXT NOT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      total_files INTEGER DEFAULT 0,
      total_size INTEGER DEFAULT 0,
      status TEXT DEFAULT 'running'
    );

    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      scan_id TEXT NOT NULL,
      path TEXT NOT NULL,
      name TEXT NOT NULL,
      extension TEXT,
      size INTEGER NOT NULL,
      created_at TEXT,
      modified_at TEXT,
      category TEXT NOT NULL,
      mime TEXT,
      sha256 TEXT,
      partial_hash TEXT,
      phash TEXT,
      is_duplicate INTEGER DEFAULT 0,
      duplicate_group_id TEXT,
      is_recommended_keep INTEGER DEFAULT 0,
      FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_files_path ON files(path);
    CREATE INDEX IF NOT EXISTS idx_files_sha256 ON files(sha256);
    CREATE INDEX IF NOT EXISTS idx_files_size ON files(size);
    CREATE INDEX IF NOT EXISTS idx_files_category ON files(category);

    CREATE TABLE IF NOT EXISTS operations (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      source_dir TEXT NOT NULL,
      target_dir TEXT NOT NULL,
      files_count INTEGER NOT NULL,
      total_size INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      status TEXT DEFAULT 'completed'
    );

    CREATE TABLE IF NOT EXISTS operation_items (
      id TEXT PRIMARY KEY,
      operation_id TEXT NOT NULL,
      original_path TEXT NOT NULL,
      organized_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      sha256 TEXT,
      status TEXT DEFAULT 'active',
      FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS custom_rules (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      pattern TEXT NOT NULL,
      target_category TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  return dbInstance;
}
