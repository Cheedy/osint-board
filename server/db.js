import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, '..');
/**
 * Dossier des donnees. OSINT_DATA_DIR permet de lancer une instance jetable
 * (tests, demos) sans jamais toucher aux enquetes reelles de data/.
 */
export const DATA_DIR = process.env.OSINT_DATA_DIR
  ? path.resolve(process.env.OSINT_DATA_DIR)
  : path.join(ROOT, 'data');
export const FILES_DIR = path.join(DATA_DIR, 'attachments');

fs.mkdirSync(FILES_DIR, { recursive: true });

export const db = new DatabaseSync(path.join(DATA_DIR, 'osint.db'));
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

export const now = () => Date.now();
export const uid = () => globalThis.crypto.randomUUID();

/** Lit les noeuds/aretes d'un plan et les renvoie au format attendu par le front. */
export function readBoard(boardId) {
  const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(boardId);
  if (!board) return null;
  const nodes = db
    .prepare('SELECT * FROM nodes WHERE board_id = ? ORDER BY created_at')
    .all(boardId)
    .map(rowToNode);
  const edges = db
    .prepare('SELECT * FROM edges WHERE board_id = ? ORDER BY created_at')
    .all(boardId)
    .map(rowToEdge);
  return {
    board: {
      id: board.id,
      title: board.title,
      target: board.target,
      notes: board.notes,
      viewport: safeJson(board.viewport, { x: 0, y: 0, zoom: 1 }),
      createdAt: board.created_at,
      updatedAt: board.updated_at,
    },
    nodes,
    edges,
  };
}

function rowToNode(r) {
  return {
    id: r.id,
    type: 'entity',
    position: { x: r.x, y: r.y },
    width: r.width || undefined,
    data: {
      kind: r.type,
      label: r.label,
      fields: safeJson(r.fields, {}),
      confidence: r.confidence,
      note: r.note,
      source: r.source,
      color: r.color,
      attachment: r.attachment,
      createdAt: r.created_at,
    },
  };
}

function rowToEdge(r) {
  return {
    id: r.id,
    source: r.source,
    target: r.target,
    sourceHandle: r.source_handle || null,
    targetHandle: r.target_handle || null,
    type: 'relation',
    data: {
      label: r.label,
      method: r.method,
      sourceUrl: r.source_url,
      confidence: r.confidence,
      createdAt: r.created_at,
    },
  };
}

export function safeJson(text, fallback) {
  try {
    const v = JSON.parse(text);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

/** Remplace integralement le contenu d'un plan (autosave). */
export function writeBoard(boardId, payload) {
  const t = now();
  db.exec('BEGIN');
  try {
    db.prepare(
      'UPDATE boards SET title = ?, target = ?, notes = ?, viewport = ?, updated_at = ? WHERE id = ?'
    ).run(
      payload.title ?? 'Sans titre',
      payload.target ?? '',
      payload.notes ?? '',
      JSON.stringify(payload.viewport ?? { x: 0, y: 0, zoom: 1 }),
      t,
      boardId
    );
    db.prepare('DELETE FROM nodes WHERE board_id = ?').run(boardId);
    db.prepare('DELETE FROM edges WHERE board_id = ?').run(boardId);

    const insNode = db.prepare(
      `INSERT INTO nodes (id, board_id, type, label, fields, confidence, note, source, color, attachment, x, y, width, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    );
    for (const n of payload.nodes ?? []) {
      const d = n.data ?? {};
      insNode.run(
        n.id,
        boardId,
        d.kind ?? 'note',
        d.label ?? '',
        JSON.stringify(d.fields ?? {}),
        d.confidence ?? 'probable',
        d.note ?? '',
        d.source ?? '',
        d.color ?? '',
        d.attachment ?? '',
        Number(n.position?.x ?? 0),
        Number(n.position?.y ?? 0),
        Number(n.width ?? 0),
        Number(d.createdAt ?? t)
      );
    }

    const insEdge = db.prepare(
      `INSERT INTO edges (id, board_id, source, target, source_handle, target_handle, label, method, source_url, confidence, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`
    );
    for (const e of payload.edges ?? []) {
      const d = e.data ?? {};
      insEdge.run(
        e.id,
        boardId,
        e.source,
        e.target,
        e.sourceHandle ?? '',
        e.targetHandle ?? '',
        d.label ?? '',
        d.method ?? '',
        d.sourceUrl ?? '',
        d.confidence ?? 'probable',
        Number(d.createdAt ?? t)
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

const SNAPSHOT_INTERVAL = 4 * 60 * 1000; // une photo du plan toutes les 4 min max
const MAX_SNAPSHOTS = 60;

/** Cree une sauvegarde datee du plan, en evitant d'en empiler une par seconde. */
export function maybeSnapshot(boardId, { force = false, label = '' } = {}) {
  const last = db
    .prepare('SELECT created_at FROM snapshots WHERE board_id = ? ORDER BY created_at DESC LIMIT 1')
    .get(boardId);
  const t = now();
  if (!force && last && t - last.created_at < SNAPSHOT_INTERVAL) return null;

  const state = readBoard(boardId);
  if (!state) return null;
  const id = uid();
  db.prepare(
    'INSERT INTO snapshots (id, board_id, created_at, label, node_count, edge_count, data) VALUES (?,?,?,?,?,?,?)'
  ).run(id, boardId, t, label, state.nodes.length, state.edges.length, JSON.stringify(state));

  const extra = db
    .prepare('SELECT id FROM snapshots WHERE board_id = ? ORDER BY created_at DESC LIMIT -1 OFFSET ?')
    .all(boardId, MAX_SNAPSHOTS);
  const del = db.prepare('DELETE FROM snapshots WHERE id = ?');
  for (const row of extra) del.run(row.id);

  return { id, createdAt: t, label, nodeCount: state.nodes.length, edgeCount: state.edges.length };
}
