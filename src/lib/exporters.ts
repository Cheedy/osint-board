import { getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { toPng } from 'html-to-image';
import { confidenceLabel, entityDef } from './entityTypes';
import type { Board, OsintEdge, OsintNode } from '../types';

function download(filename: string, content: Blob | string, mime = 'text/plain;charset=utf-8') {
  const blob = typeof content === 'string' ? new Blob([content], { type: mime }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const slug = (s: string) =>
  (s || 'enquete')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

const stamp = () => new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', 'h');

/* --------------------------------------------------------------------- PNG */

export async function exportPng(
  board: Board,
  nodes: OsintNode[],
  dark: boolean,
  bounds = getNodesBounds(nodes)
) {
  const viewportEl = document.querySelector<HTMLElement>('.react-flow__viewport');
  if (!viewportEl || nodes.length === 0) return;

  const padding = 60;
  const width = Math.min(Math.max(Math.round(bounds.width) + padding * 2, 800), 6000);
  const height = Math.min(Math.max(Math.round(bounds.height) + padding * 2, 600), 6000);
  const vp = getViewportForBounds(bounds, width, height, 0.2, 2, 0.08);

  const dataUrl = await toPng(viewportEl, {
    backgroundColor: dark ? '#0d1017' : '#f7f7f5',
    width,
    height,
    pixelRatio: 2,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate(${vp.x}px, ${vp.y}px) scale(${vp.zoom})`,
    },
  });
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${slug(board.title)}_${stamp()}.png`;
  a.click();
}

/* -------------------------------------------------------------------- JSON */

export function exportJson(board: Board, nodes: OsintNode[], edges: OsintEdge[]) {
  const payload = {
    format: 'osint-recherches/v1',
    exportedAt: new Date().toISOString(),
    board: { title: board.title, target: board.target, notes: board.notes, viewport: board.viewport },
    nodes: nodes.map((n) => ({ id: n.id, position: n.position, width: n.width, data: n.data })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      data: e.data,
    })),
  };
  download(`${slug(board.title)}_${stamp()}.json`, JSON.stringify(payload, null, 2), 'application/json');
}

export type ImportedBoard = {
  board: Partial<Board>;
  nodes: OsintNode[];
  edges: OsintEdge[];
};

export function parseImport(text: string): ImportedBoard {
  const data = JSON.parse(text);
  const nodes: OsintNode[] = (data.nodes ?? []).map((n: any) => ({
    id: String(n.id),
    type: 'entity' as const,
    position: n.position ?? { x: 0, y: 0 },
    width: n.width || undefined,
    data: {
      kind: n.data?.kind ?? 'note',
      label: n.data?.label ?? '',
      fields: n.data?.fields ?? {},
      confidence: n.data?.confidence ?? 'probable',
      note: n.data?.note ?? '',
      source: n.data?.source ?? '',
      color: n.data?.color ?? '',
      attachment: n.data?.attachment ?? '',
      createdAt: n.data?.createdAt ?? Date.now(),
    },
  }));
  const edges: OsintEdge[] = (data.edges ?? []).map((e: any) => ({
    id: String(e.id),
    source: String(e.source),
    target: String(e.target),
    sourceHandle: e.sourceHandle ?? null,
    targetHandle: e.targetHandle ?? null,
    type: 'relation' as const,
    data: {
      label: e.data?.label ?? '',
      method: e.data?.method ?? '',
      sourceUrl: e.data?.sourceUrl ?? '',
      confidence: e.data?.confidence ?? 'probable',
      createdAt: e.data?.createdAt ?? Date.now(),
    },
  }));
  return { board: data.board ?? {}, nodes, edges };
}

/* ---------------------------------------------------------------- rapport */

function buildReport(board: Board, nodes: OsintNode[], edges: OsintEdge[]) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const name = (id: string) => byId.get(id)?.data.label || '(sans nom)';
  const icon = (id: string) => entityDef(byId.get(id)?.data.kind ?? 'note').icon;

  const groups = new Map<string, OsintNode[]>();
  for (const n of nodes) {
    const key = entityDef(n.data.kind).name;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(n);
  }

  const lines: string[] = [];
  lines.push(`# ${board.title}`);
  lines.push('');
  if (board.target) lines.push(`**Cible :** ${board.target}  `);
  lines.push(`**Généré le :** ${new Date().toLocaleString('fr-FR')}  `);
  lines.push(`**Contenu :** ${nodes.length} élément(s), ${edges.length} lien(s)`);
  lines.push('');
  if (board.notes) {
    lines.push('## Contexte');
    lines.push('');
    lines.push(board.notes);
    lines.push('');
  }

  lines.push('## Éléments trouvés');
  lines.push('');
  for (const [groupName, list] of groups) {
    lines.push(`### ${entityDef(list[0].data.kind).icon} ${groupName}`);
    lines.push('');
    for (const n of list) {
      lines.push(`- **${n.data.label || '(vide)'}** — _${confidenceLabel(n.data.confidence)}_`);
      for (const [k, v] of Object.entries(n.data.fields ?? {})) {
        if (v) lines.push(`  - ${k} : ${v}`);
      }
      if (n.data.source) lines.push(`  - source : ${n.data.source}`);
      if (n.data.note) lines.push(`  - note : ${n.data.note}`);
    }
    lines.push('');
  }

  if (edges.length) {
    lines.push('## Liens établis');
    lines.push('');
    for (const e of edges) {
      const d = e.data;
      const via = d?.method ? ` _(via ${d.method})_` : '';
      const src = d?.sourceUrl ? ` — source : ${d.sourceUrl}` : '';
      lines.push(
        `- ${icon(e.source)} **${name(e.source)}** → ${icon(e.target)} **${name(e.target)}** : ${
          d?.label || 'lien'
        }${via}${src}`
      );
    }
    lines.push('');
  }

  const chrono = [...nodes].sort((a, b) => (a.data.createdAt ?? 0) - (b.data.createdAt ?? 0));
  lines.push('## Chronologie de la recherche');
  lines.push('');
  for (const n of chrono) {
    const t = n.data.createdAt ? new Date(n.data.createdAt).toLocaleString('fr-FR') : '—';
    lines.push(`1. ${t} — ${entityDef(n.data.kind).icon} ${entityDef(n.data.kind).name} : ${n.data.label}`);
  }
  lines.push('');
  return lines.join('\n');
}

export function exportMarkdown(board: Board, nodes: OsintNode[], edges: OsintEdge[]) {
  download(`${slug(board.title)}_rapport_${stamp()}.md`, buildReport(board, nodes, edges), 'text/markdown;charset=utf-8');
}

/** Ouvre le rapport dans un onglet, pret a etre imprime en PDF (Ctrl+P). */
export function exportPdf(board: Board, nodes: OsintNode[], edges: OsintEdge[]) {
  const md = buildReport(board, nodes, edges);
  const html = md
    .split('\n')
    .map((line) => {
      if (line.startsWith('### ')) return `<h3>${esc(line.slice(4))}</h3>`;
      if (line.startsWith('## ')) return `<h2>${esc(line.slice(3))}</h2>`;
      if (line.startsWith('# ')) return `<h1>${esc(line.slice(2))}</h1>`;
      if (/^\s*-\s/.test(line)) {
        const depth = (line.match(/^\s*/)?.[0].length ?? 0) >= 2 ? 1 : 0;
        return `<div class="li d${depth}">${inline(line.replace(/^\s*-\s/, ''))}</div>`;
      }
      if (/^\d+\.\s/.test(line)) return `<div class="li d0">${inline(line)}</div>`;
      if (!line.trim()) return '';
      return `<p>${inline(line)}</p>`;
    })
    .join('\n');

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>${esc(board.title)} — rapport</title>
<style>
  body{font:14px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;max-width:800px;margin:40px auto;padding:0 24px;color:#16181d}
  h1{font-size:26px;border-bottom:2px solid #16181d;padding-bottom:8px;margin-bottom:4px}
  h2{font-size:19px;margin-top:32px;border-bottom:1px solid #d8dae0;padding-bottom:4px}
  h3{font-size:15px;margin-top:22px;color:#444}
  .li{margin:3px 0}.d1{margin-left:26px;color:#555;font-size:13px}
  em{color:#777;font-style:normal;font-size:12px;background:#eef0f4;padding:1px 6px;border-radius:10px}
  .print{position:fixed;top:16px;right:16px;padding:10px 16px;border:0;border-radius:8px;background:#16181d;color:#fff;cursor:pointer}
  @media print{.print{display:none}body{margin:0}}
</style></head><body>
<button class="print" onclick="window.print()">Imprimer / PDF</button>
${html}
</body></html>`);
  win.document.close();
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(s: string) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>');
}
