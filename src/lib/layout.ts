import dagre from '@dagrejs/dagre';
import type { OsintEdge, OsintNode } from '../types';

const DEFAULT_W = 230;
const DEFAULT_H = 96;

/**
 * Range le plan en arbre (gauche -> droite par defaut).
 * Les noeuds isoles sont alignes proprement en bas plutot que dispersés.
 */
export function autoLayout(
  nodes: OsintNode[],
  edges: OsintEdge[],
  direction: 'LR' | 'TB' = 'LR'
): OsintNode[] {
  if (nodes.length === 0) return nodes;

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    nodesep: direction === 'LR' ? 46 : 60,
    // large : c'est dans cet espace que se posent les etiquettes des liens
    ranksep: direction === 'LR' ? 250 : 140,
    marginx: 40,
    marginy: 40,
  });

  const size = new Map<string, { w: number; h: number }>();
  for (const n of nodes) {
    const w = n.measured?.width ?? (n.width as number) ?? DEFAULT_W;
    const h = n.measured?.height ?? (n.height as number) ?? DEFAULT_H;
    size.set(n.id, { w, h });
    g.setNode(n.id, { width: w, height: h });
  }
  const ids = new Set(nodes.map((n) => n.id));
  for (const e of edges) {
    if (ids.has(e.source) && ids.has(e.target)) g.setEdge(e.source, e.target);
  }

  dagre.layout(g);

  return nodes.map((n) => {
    const pos = g.node(n.id);
    const s = size.get(n.id)!;
    if (!pos) return n;
    return { ...n, position: { x: pos.x - s.w / 2, y: pos.y - s.h / 2 } };
  });
}
