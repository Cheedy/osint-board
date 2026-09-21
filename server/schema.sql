PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS boards (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  target      TEXT NOT NULL DEFAULT '',
  notes       TEXT NOT NULL DEFAULT '',
  viewport    TEXT NOT NULL DEFAULT '{"x":0,"y":0,"zoom":1}',
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS nodes (
  id          TEXT PRIMARY KEY,
  board_id    TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  label       TEXT NOT NULL DEFAULT '',
  fields      TEXT NOT NULL DEFAULT '{}',
  confidence  TEXT NOT NULL DEFAULT 'probable',
  note        TEXT NOT NULL DEFAULT '',
  source      TEXT NOT NULL DEFAULT '',
  color       TEXT NOT NULL DEFAULT '',
  attachment  TEXT NOT NULL DEFAULT '',
  x           REAL NOT NULL DEFAULT 0,
  y           REAL NOT NULL DEFAULT 0,
  width       REAL NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_nodes_board ON nodes(board_id);
CREATE INDEX IF NOT EXISTS idx_nodes_label ON nodes(label);

CREATE TABLE IF NOT EXISTS edges (
  id            TEXT PRIMARY KEY,
  board_id      TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  source        TEXT NOT NULL,
  target        TEXT NOT NULL,
  source_handle TEXT NOT NULL DEFAULT '',
  target_handle TEXT NOT NULL DEFAULT '',
  label         TEXT NOT NULL DEFAULT '',
  method        TEXT NOT NULL DEFAULT '',
  source_url    TEXT NOT NULL DEFAULT '',
  confidence    TEXT NOT NULL DEFAULT 'probable',
  created_at    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_edges_board ON edges(board_id);

CREATE TABLE IF NOT EXISTS snapshots (
  id          TEXT PRIMARY KEY,
  board_id    TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  created_at  INTEGER NOT NULL,
  label       TEXT NOT NULL DEFAULT '',
  node_count  INTEGER NOT NULL DEFAULT 0,
  edge_count  INTEGER NOT NULL DEFAULT 0,
  data        TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_snap_board ON snapshots(board_id, created_at DESC);

CREATE TABLE IF NOT EXISTS custom_tools (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  url         TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'Perso',
  types       TEXT NOT NULL DEFAULT '[]',
  created_at  INTEGER NOT NULL
);
