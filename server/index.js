import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { db, uid, now, readBoard, writeBoard, maybeSnapshot, safeJson, ROOT, FILES_DIR } from './db.js';

const PORT = process.env.PORT || 8787;
const app = express();
app.use(express.json({ limit: '30mb' }));
app.use('/files', express.static(FILES_DIR));

const ok = (res, data) => res.json(data);
const fail = (res, code, msg) => res.status(code).json({ error: msg });

/* ---------------------------------------------------------------- enquetes */

app.get('/api/boards', (_req, res) => {
  const rows = db
    .prepare(
      `SELECT b.*,
              (SELECT COUNT(*) FROM nodes n WHERE n.board_id = b.id) AS node_count,
              (SELECT COUNT(*) FROM edges e WHERE e.board_id = b.id) AS edge_count
       FROM boards b ORDER BY b.updated_at DESC`
    )
    .all();
  ok(
    res,
    rows.map((b) => ({
      id: b.id,
      title: b.title,
      target: b.target,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
      nodeCount: b.node_count,
      edgeCount: b.edge_count,
    }))
  );
});

app.post('/api/boards', (req, res) => {
  const id = uid();
  const t = now();
  db.prepare(
    'INSERT INTO boards (id, title, target, notes, viewport, created_at, updated_at) VALUES (?,?,?,?,?,?,?)'
  ).run(
    id,
    req.body?.title?.trim() || 'Nouvelle enquete',
    req.body?.target || '',
    '',
    '{"x":0,"y":0,"zoom":1}',
    t,
    t
  );
  maybeSnapshot(id, { force: true, label: 'creation' });
  ok(res, readBoard(id));
});

app.get('/api/boards/:id', (req, res) => {
  const state = readBoard(req.params.id);
  if (!state) return fail(res, 404, 'Enquete introuvable');
  ok(res, state);
});

app.put('/api/boards/:id', (req, res) => {
  const exists = db.prepare('SELECT id FROM boards WHERE id = ?').get(req.params.id);
  if (!exists) return fail(res, 404, 'Enquete introuvable');
  writeBoard(req.params.id, req.body ?? {});
  const snap = maybeSnapshot(req.params.id);
  ok(res, { savedAt: now(), snapshot: snap });
});

app.delete('/api/boards/:id', (req, res) => {
  db.prepare('DELETE FROM boards WHERE id = ?').run(req.params.id);
  fs.rmSync(path.join(FILES_DIR, req.params.id), { recursive: true, force: true });
  ok(res, { deleted: true });
});

app.post('/api/boards/:id/duplicate', (req, res) => {
  const state = readBoard(req.params.id);
  if (!state) return fail(res, 404, 'Enquete introuvable');
  const id = uid();
  const t = now();
  const title = `${state.board.title} (copie)`;
  db.prepare(
    'INSERT INTO boards (id, title, target, notes, viewport, created_at, updated_at) VALUES (?,?,?,?,?,?,?)'
  ).run(id, title, state.board.target, state.board.notes, JSON.stringify(state.board.viewport), t, t);
  writeBoard(id, { ...state.board, title, nodes: state.nodes, edges: state.edges });
  maybeSnapshot(id, { force: true, label: 'copie' });
  ok(res, readBoard(id));
});

/* -------------------------------------------------------------- historique */

app.get('/api/boards/:id/snapshots', (req, res) => {
  const rows = db
    .prepare(
      'SELECT id, created_at, label, node_count, edge_count FROM snapshots WHERE board_id = ? ORDER BY created_at DESC'
    )
    .all(req.params.id);
  ok(
    res,
    rows.map((s) => ({
      id: s.id,
      createdAt: s.created_at,
      label: s.label,
      nodeCount: s.node_count,
      edgeCount: s.edge_count,
    }))
  );
});

app.post('/api/boards/:id/snapshots', (req, res) => {
  const snap = maybeSnapshot(req.params.id, {
    force: true,
    label: req.body?.label || 'point de sauvegarde',
  });
  if (!snap) return fail(res, 404, 'Enquete introuvable');
  ok(res, snap);
});

app.post('/api/snapshots/:id/restore', (req, res) => {
  const snap = db.prepare('SELECT * FROM snapshots WHERE id = ?').get(req.params.id);
  if (!snap) return fail(res, 404, 'Sauvegarde introuvable');
  // on photographie d abord l etat courant : une restauration ne perd jamais rien
  maybeSnapshot(snap.board_id, { force: true, label: 'avant restauration' });
  const state = safeJson(snap.data, null);
  if (!state) return fail(res, 500, 'Sauvegarde illisible');
  writeBoard(snap.board_id, { ...state.board, nodes: state.nodes, edges: state.edges });
  ok(res, readBoard(snap.board_id));
});

/* --------------------------------------------- recherche globale / doublons */

app.get('/api/search', (req, res) => {
  const q = String(req.query.q ?? '').trim();
  if (!q) return ok(res, []);
  const exact = req.query.exact === '1';
  const sql = exact
    ? `SELECT n.*, b.title AS board_title FROM nodes n JOIN boards b ON b.id = n.board_id
       WHERE LOWER(n.label) = LOWER(?) ORDER BY n.created_at DESC LIMIT 50`
    : `SELECT n.*, b.title AS board_title FROM nodes n JOIN boards b ON b.id = n.board_id
       WHERE LOWER(n.label) LIKE LOWER(?) OR LOWER(n.note) LIKE LOWER(?) OR LOWER(n.fields) LIKE LOWER(?)
       ORDER BY n.created_at DESC LIMIT 50`;
  const rows = exact ? db.prepare(sql).all(q) : db.prepare(sql).all(`%${q}%`, `%${q}%`, `%${q}%`);
  ok(
    res,
    rows.map((n) => ({
      id: n.id,
      boardId: n.board_id,
      boardTitle: n.board_title,
      kind: n.type,
      label: n.label,
      confidence: n.confidence,
      fields: safeJson(n.fields, {}),
    }))
  );
});

/* ----------------------------------------------------------- pieces jointes */

app.post('/api/boards/:id/attachments', (req, res) => {
  const { dataUrl, name } = req.body ?? {};
  const match = /^data:([\w.+/-]+);base64,(.+)$/s.exec(dataUrl ?? '');
  if (!match) return fail(res, 400, 'Fichier illisible');
  const [, mime, b64] = match;
  const ext = (name && path.extname(name)) || '.' + (mime.split('/')[1] || 'bin').split('+')[0];
  const dir = path.join(FILES_DIR, req.params.id);
  fs.mkdirSync(dir, { recursive: true });
  const file = `${uid()}${ext}`;
  fs.writeFileSync(path.join(dir, file), Buffer.from(b64, 'base64'));
  ok(res, { url: `/files/${req.params.id}/${file}`, name: name || file, mime });
});

/* ------------------------------------------------------------- outils perso */

app.get('/api/tools', (_req, res) => {
  const rows = db.prepare('SELECT * FROM custom_tools ORDER BY created_at').all();
  ok(
    res,
    rows.map((t) => ({
      id: t.id,
      name: t.name,
      url: t.url,
      category: t.category,
      types: safeJson(t.types, []),
      custom: true,
    }))
  );
});

app.post('/api/tools', (req, res) => {
  const { name, url, category, types } = req.body ?? {};
  if (!name || !url) return fail(res, 400, 'Nom et URL obligatoires');
  const id = uid();
  db.prepare(
    'INSERT INTO custom_tools (id, name, url, category, types, created_at) VALUES (?,?,?,?,?,?)'
  ).run(id, name, url, category || 'Perso', JSON.stringify(types ?? []), now());
  ok(res, { id, name, url, category: category || 'Perso', types: types ?? [], custom: true });
});

app.delete('/api/tools/:id', (req, res) => {
  db.prepare('DELETE FROM custom_tools WHERE id = ?').run(req.params.id);
  ok(res, { deleted: true });
});

/* ------------------------------------------------------------------ static */

const dist = path.join(ROOT, 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`[osint] API + base SQLite pretes sur http://localhost:${PORT}`);
});
