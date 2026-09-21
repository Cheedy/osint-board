import type { Edge, Node } from '@xyflow/react';

export type Confidence = 'confirmed' | 'probable' | 'unverified';

export type EntityKind =
  | 'person'
  | 'birth'
  | 'username'
  | 'email'
  | 'phone'
  | 'social'
  | 'domain'
  | 'ip'
  | 'photo'
  | 'place'
  | 'org'
  | 'document'
  | 'vehicle'
  | 'wallet'
  | 'bank'
  | 'search'
  | 'note';

export type EntityData = {
  kind: EntityKind;
  /** La valeur principale du noeud : le nom, l'email, le pseudo... */
  label: string;
  fields: Record<string, string>;
  confidence: Confidence;
  note: string;
  /** D'ou vient l'info (URL ou description courte). */
  source: string;
  color: string;
  /** URL locale d'une capture / piece jointe (/files/...). */
  attachment: string;
  createdAt: number;
  [key: string]: unknown;
};

export type RelationData = {
  label: string;
  /** Comment le lien a ete etabli : Holehe, dork Google, recoupement manuel... */
  method: string;
  sourceUrl: string;
  confidence: Confidence;
  createdAt: number;
  [key: string]: unknown;
};

export type OsintNode = Node<EntityData, 'entity'>;
export type OsintEdge = Edge<RelationData, 'relation'>;

export type BoardMeta = {
  id: string;
  title: string;
  target: string;
  createdAt: number;
  updatedAt: number;
  nodeCount: number;
  edgeCount: number;
};

export type Board = {
  id: string;
  title: string;
  target: string;
  notes: string;
  viewport: { x: number; y: number; zoom: number };
  createdAt: number;
  updatedAt: number;
};

export type BoardState = {
  board: Board;
  nodes: OsintNode[];
  edges: OsintEdge[];
};

export type Snapshot = {
  id: string;
  createdAt: number;
  label: string;
  nodeCount: number;
  edgeCount: number;
};

export type SearchHit = {
  id: string;
  boardId: string;
  boardTitle: string;
  kind: EntityKind;
  label: string;
  confidence: Confidence;
  fields: Record<string, string>;
};

export type Tool = {
  id: string;
  name: string;
  category: string;
  /** URL avec {{value}} remplace par la valeur du noeud selectionne. */
  url?: string;
  /** Commande a copier (outils en ligne de commande). */
  cmd?: string;
  types: (EntityKind | '*')[];
  custom?: boolean;
  hint?: string;
};
