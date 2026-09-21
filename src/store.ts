import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react';
import type { Connection, EdgeChange, NodeChange, Viewport } from '@xyflow/react';
import { create } from 'zustand';
import { api } from './lib/api';
import { entityDef } from './lib/entityTypes';
import type {
  Board,
  BoardMeta,
  Confidence,
  EntityData,
  EntityKind,
  OsintEdge,
  OsintNode,
  RelationData,
  SearchHit,
  Snapshot,
  Tool,
} from './types';

type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';
type Theme = 'dark' | 'light';

const SAVE_DELAY = 700;
const MAX_HISTORY = 60;

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let toastTimer: ReturnType<typeof setTimeout> | null = null;
let viewport: Viewport = { x: 0, y: 0, zoom: 1 };
let dragging = false;

const uid = () => globalThis.crypto.randomUUID();

type HistoryEntry = { nodes: OsintNode[]; edges: OsintEdge[] };

export type DuplicateAsk = { node: OsintNode; sameBoard: SearchHit[]; otherBoards: SearchHit[] };

interface Store {
  boards: BoardMeta[];
  board: Board | null;
  nodes: OsintNode[];
  edges: OsintEdge[];
  snapshots: Snapshot[];
  customTools: Tool[];

  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  status: SaveStatus;
  lastSavedAt: number | null;
  loading: boolean;
  theme: Theme;
  toast: string | null;
  duplicate: DuplicateAsk | null;
  past: HistoryEntry[];
  future: HistoryEntry[];

  init: () => Promise<void>;
  setTheme: (t: Theme) => void;
  notify: (msg: string) => void;

  loadBoards: () => Promise<void>;
  newBoard: (title?: string) => Promise<void>;
  openBoard: (id: string) => Promise<void>;
  removeBoard: (id: string) => Promise<void>;
  duplicateBoard: (id: string) => Promise<void>;
  patchBoard: (patch: Partial<Board>) => void;

  onNodesChange: (changes: NodeChange<OsintNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<OsintEdge>[]) => void;
  onConnect: (conn: Connection) => void;
  setViewport: (v: Viewport) => void;

  addNode: (kind: EntityKind, position: { x: number; y: number }, label?: string, extra?: Partial<EntityData>) => string;
  updateNode: (id: string, patch: Partial<EntityData>) => void;
  setNodeField: (id: string, key: string, value: string) => void;
  removeNodeField: (id: string, key: string) => void;
  deleteNode: (id: string) => void;
  mergeNodes: (keepId: string, dropId: string) => void;
  setNodes: (nodes: OsintNode[]) => void;
  applyLayout: (nodes: OsintNode[], edges: OsintEdge[]) => void;

  updateEdge: (id: string, patch: Partial<RelationData>) => void;
  deleteEdge: (id: string) => void;
  flipEdge: (id: string) => void;

  select: (nodeId: string | null, edgeId?: string | null) => void;
  checkDuplicate: (nodeId: string) => Promise<void>;
  dismissDuplicate: () => void;

  save: () => Promise<void>;
  loadSnapshots: () => Promise<void>;
  makeSnapshot: (label: string) => Promise<void>;
  restoreSnapshot: (id: string) => Promise<void>;

  loadTools: () => Promise<void>;
  addTool: (tool: Omit<Tool, 'id'>) => Promise<void>;
  deleteTool: (id: string) => Promise<void>;

  undo: () => void;
  redo: () => void;
  importState: (nodes: OsintNode[], edges: OsintEdge[]) => void;
}

export const useStore = create<Store>((set, get) => {
  /** Marque le plan comme modifie et programme la sauvegarde automatique. */
  const touch = () => {
    if (get().loading || !get().board) return;
    set({ status: 'dirty' });
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => void get().save(), SAVE_DELAY);
  };

  /** Empile l'etat courant pour pouvoir revenir en arriere (Ctrl+Z). */
  const pushHistory = () => {
    const { nodes, edges, past } = get();
    set({
      past: [...past, { nodes, edges }].slice(-MAX_HISTORY),
      future: [],
    });
  };

  const newNodeData = (kind: EntityKind, label: string, extra?: Partial<EntityData>): EntityData => ({
    kind,
    label,
    fields: {},
    confidence: 'probable',
    note: '',
    source: '',
    color: '',
    attachment: '',
    createdAt: Date.now(),
    ...extra,
  });

  return {
    boards: [],
    board: null,
    nodes: [],
    edges: [],
    snapshots: [],
    customTools: [],
    selectedNodeId: null,
    selectedEdgeId: null,
    status: 'idle',
    lastSavedAt: null,
    loading: false,
    theme: (localStorage.getItem('osint-theme') as Theme) || 'dark',
    toast: null,
    duplicate: null,
    past: [],
    future: [],

    async init() {
      document.documentElement.dataset.theme = get().theme;
      await Promise.all([get().loadBoards(), get().loadTools()]);
      const last = localStorage.getItem('osint-last-board');
      const boards = get().boards;
      const target = boards.find((b) => b.id === last) ?? boards[0];
      if (target) await get().openBoard(target.id);
    },

    setTheme(t) {
      localStorage.setItem('osint-theme', t);
      document.documentElement.dataset.theme = t;
      set({ theme: t });
    },

    notify(msg) {
      set({ toast: msg });
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => set({ toast: null }), 2600);
    },

    /* ------------------------------------------------------------ enquetes */

    async loadBoards() {
      set({ boards: await api.listBoards() });
    },

    async newBoard(title) {
      const state = await api.createBoard(title ?? 'Nouvelle enquête');
      await get().loadBoards();
      localStorage.setItem('osint-last-board', state.board.id);
      set({
        board: state.board,
        nodes: state.nodes,
        edges: state.edges,
        snapshots: [],
        selectedNodeId: null,
        selectedEdgeId: null,
        past: [],
        future: [],
        status: 'idle',
      });
      viewport = state.board.viewport;
      await get().loadSnapshots();
    },

    async openBoard(id) {
      if (get().status === 'dirty') await get().save();
      if (saveTimer) clearTimeout(saveTimer);
      set({ loading: true });
      try {
        const state = await api.getBoard(id);
        viewport = state.board.viewport;
        localStorage.setItem('osint-last-board', id);
        set({
          board: state.board,
          nodes: state.nodes,
          edges: state.edges,
          selectedNodeId: null,
          selectedEdgeId: null,
          past: [],
          future: [],
          status: 'idle',
          lastSavedAt: state.board.updatedAt,
        });
        await get().loadSnapshots();
      } finally {
        set({ loading: false });
      }
    },

    async removeBoard(id) {
      await api.deleteBoard(id);
      if (get().board?.id === id) {
        set({ board: null, nodes: [], edges: [], snapshots: [], selectedNodeId: null });
        localStorage.removeItem('osint-last-board');
      }
      await get().loadBoards();
      get().notify('Enquête supprimée');
    },

    async duplicateBoard(id) {
      const state = await api.duplicateBoard(id);
      await get().loadBoards();
      await get().openBoard(state.board.id);
      get().notify('Enquête dupliquée');
    },

    patchBoard(patch) {
      const board = get().board;
      if (!board) return;
      set({ board: { ...board, ...patch } });
      touch();
    },

    /* -------------------------------------------------------------- canvas */

    onNodesChange(changes) {
      const structural = changes.some((c) => c.type === 'remove' || c.type === 'add');
      const moveStart = changes.some((c) => c.type === 'position' && c.dragging === true);
      const moveEnd = changes.some((c) => c.type === 'position' && c.dragging === false);

      if (structural || (moveStart && !dragging)) pushHistory();
      if (moveStart) dragging = true;
      if (moveEnd) dragging = false;

      set({ nodes: applyNodeChanges(changes, get().nodes) });
      if (structural || moveEnd || changes.some((c) => c.type === 'dimensions' && c.resizing === false)) touch();
    },

    onEdgesChange(changes) {
      const structural = changes.some((c) => c.type === 'remove' || c.type === 'add');
      if (structural) pushHistory();
      set({ edges: applyEdgeChanges(changes, get().edges) });
      if (structural) touch();
    },

    onConnect(conn) {
      if (!conn.source || !conn.target || conn.source === conn.target) return;
      pushHistory();
      const edge: OsintEdge = {
        id: uid(),
        source: conn.source,
        target: conn.target,
        sourceHandle: conn.sourceHandle ?? null,
        targetHandle: conn.targetHandle ?? null,
        type: 'relation',
        data: { label: '', method: '', sourceUrl: '', confidence: 'probable', createdAt: Date.now() },
      };
      set({ edges: addEdge(edge, get().edges) as OsintEdge[], selectedEdgeId: edge.id, selectedNodeId: null });
      touch();
    },

    setViewport(v) {
      viewport = v;
    },

    /* --------------------------------------------------------------- noeuds */

    addNode(kind, position, label = '', extra) {
      pushHistory();
      const node: OsintNode = {
        id: uid(),
        type: 'entity',
        position,
        data: newNodeData(kind, label, extra),
      };
      set({ nodes: [...get().nodes, node], selectedNodeId: node.id, selectedEdgeId: null });
      touch();
      return node.id;
    },

    updateNode(id, patch) {
      set({
        nodes: get().nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
      });
      touch();
    },

    setNodeField(id, key, value) {
      set({
        nodes: get().nodes.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, fields: { ...n.data.fields, [key]: value } } } : n
        ),
      });
      touch();
    },

    removeNodeField(id, key) {
      set({
        nodes: get().nodes.map((n) => {
          if (n.id !== id) return n;
          const fields = { ...n.data.fields };
          delete fields[key];
          return { ...n, data: { ...n.data, fields } };
        }),
      });
      touch();
    },

    deleteNode(id) {
      pushHistory();
      set({
        nodes: get().nodes.filter((n) => n.id !== id),
        edges: get().edges.filter((e) => e.source !== id && e.target !== id),
        selectedNodeId: null,
      });
      touch();
    },

    mergeNodes(keepId, dropId) {
      const { nodes, edges } = get();
      const keep = nodes.find((n) => n.id === keepId);
      const drop = nodes.find((n) => n.id === dropId);
      if (!keep || !drop) return;
      pushHistory();

      const fields = { ...drop.data.fields };
      for (const [k, v] of Object.entries(keep.data.fields)) if (v) fields[k] = v;
      const note = [keep.data.note, drop.data.note].filter(Boolean).join('\n');
      const merged: OsintNode = {
        ...keep,
        data: {
          ...keep.data,
          fields,
          note,
          source: keep.data.source || drop.data.source,
          attachment: keep.data.attachment || drop.data.attachment,
          label: keep.data.label || drop.data.label,
        },
      };

      const rewired = edges
        .map((e) => ({
          ...e,
          source: e.source === dropId ? keepId : e.source,
          target: e.target === dropId ? keepId : e.target,
        }))
        .filter((e) => e.source !== e.target);

      // on enleve les doublons de liens crees par la fusion
      const seen = new Set<string>();
      const deduped = rewired.filter((e) => {
        const key = `${e.source}->${e.target}->${e.data?.label ?? ''}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      set({
        nodes: nodes.filter((n) => n.id !== dropId).map((n) => (n.id === keepId ? merged : n)),
        edges: deduped,
        selectedNodeId: keepId,
        duplicate: null,
      });
      touch();
      get().notify('Nœuds fusionnés');
    },

    setNodes(nodes) {
      pushHistory();
      set({ nodes });
      touch();
    },

    applyLayout(nodes, edges) {
      pushHistory();
      set({ nodes, edges });
      touch();
    },

    /* --------------------------------------------------------------- liens */

    updateEdge(id, patch) {
      set({
        edges: get().edges.map((e) =>
          e.id === id ? { ...e, data: { ...(e.data as RelationData), ...patch } } : e
        ),
      });
      touch();
    },

    deleteEdge(id) {
      pushHistory();
      set({ edges: get().edges.filter((e) => e.id !== id), selectedEdgeId: null });
      touch();
    },

    flipEdge(id) {
      pushHistory();
      set({
        edges: get().edges.map((e) =>
          e.id === id
            ? {
                ...e,
                source: e.target,
                target: e.source,
                sourceHandle: e.targetHandle ?? null,
                targetHandle: e.sourceHandle ?? null,
              }
            : e
        ),
      });
      touch();
    },

    select(nodeId, edgeId = null) {
      set({ selectedNodeId: nodeId, selectedEdgeId: edgeId });
    },

    /* ------------------------------------------------------------ doublons */

    async checkDuplicate(nodeId) {
      const node = get().nodes.find((n) => n.id === nodeId);
      const boardId = get().board?.id;
      if (!node || !boardId || !node.data.label.trim()) return;
      try {
        const hits = await api.search(node.data.label.trim(), true);
        const sameBoard = hits.filter((h) => h.boardId === boardId && h.id !== nodeId);
        const otherBoards = hits.filter((h) => h.boardId !== boardId);
        // le noeud tout juste cree n'est pas encore en base : on compare aux noeuds locaux aussi
        const localTwins = get().nodes.filter(
          (n) =>
            n.id !== nodeId &&
            n.data.label.trim().toLowerCase() === node.data.label.trim().toLowerCase() &&
            !sameBoard.some((h) => h.id === n.id)
        );
        const localHits: SearchHit[] = localTwins.map((n) => ({
          id: n.id,
          boardId,
          boardTitle: get().board?.title ?? '',
          kind: n.data.kind,
          label: n.data.label,
          confidence: n.data.confidence,
          fields: n.data.fields,
        }));
        // Deux comptes sociaux avec le meme pseudo sur des plateformes differentes,
        // c'est normal (et meme interessant) : on n'alerte pas la-dessus.
        const platform = String(node.data.fields?.plateforme ?? '').trim();
        const expected = (h: SearchHit) =>
          node.data.kind === 'social' &&
          h.kind === 'social' &&
          String(h.fields?.plateforme ?? '').trim() !== platform;

        const all = [...sameBoard, ...localHits].filter(
          (h, i, arr) =>
            arr.findIndex((x) => x.id === h.id) === i &&
            get().nodes.some((n) => n.id === h.id) &&
            !expected(h)
        );
        if (all.length || otherBoards.length) {
          set({ duplicate: { node, sameBoard: all, otherBoards } });
        }
      } catch {
        /* la detection de doublon ne doit jamais bloquer la saisie */
      }
    },

    dismissDuplicate() {
      set({ duplicate: null });
    },

    /* ---------------------------------------------------------- sauvegarde */

    async save() {
      const { board, nodes, edges } = get();
      if (!board) return;
      set({ status: 'saving' });
      try {
        const res = await api.saveBoard(board.id, {
          title: board.title,
          target: board.target,
          notes: board.notes,
          viewport,
          nodes,
          edges,
        });
        set({ status: 'saved', lastSavedAt: res.savedAt });
        if (res.snapshot) void get().loadSnapshots();
        void get().loadBoards();
      } catch (e) {
        set({ status: 'error' });
        get().notify('Sauvegarde impossible — le serveur répond pas');
      }
    },

    async loadSnapshots() {
      const board = get().board;
      if (!board) return;
      set({ snapshots: await api.listSnapshots(board.id) });
    },

    async makeSnapshot(label) {
      const board = get().board;
      if (!board) return;
      await get().save();
      await api.createSnapshot(board.id, label);
      await get().loadSnapshots();
      get().notify('Version enregistrée');
    },

    async restoreSnapshot(id) {
      if (saveTimer) clearTimeout(saveTimer);
      set({ loading: true });
      try {
        const state = await api.restoreSnapshot(id);
        viewport = state.board.viewport;
        set({
          board: state.board,
          nodes: state.nodes,
          edges: state.edges,
          selectedNodeId: null,
          selectedEdgeId: null,
          past: [],
          future: [],
          status: 'saved',
        });
        await get().loadSnapshots();
        get().notify('Version restaurée');
      } finally {
        set({ loading: false });
      }
    },

    /* --------------------------------------------------------- outils perso */

    async loadTools() {
      set({ customTools: await api.listTools() });
    },

    async addTool(tool) {
      const created = await api.addTool(tool);
      set({ customTools: [...get().customTools, created] });
      get().notify('Outil ajouté');
    },

    async deleteTool(id) {
      await api.deleteTool(id);
      set({ customTools: get().customTools.filter((t) => t.id !== id) });
    },

    /* ------------------------------------------------------------- annuler */

    undo() {
      const { past, nodes, edges } = get();
      if (!past.length) return;
      const prev = past[past.length - 1];
      set({
        past: past.slice(0, -1),
        future: [...get().future, { nodes, edges }],
        nodes: prev.nodes,
        edges: prev.edges,
      });
      touch();
    },

    redo() {
      const { future, nodes, edges } = get();
      if (!future.length) return;
      const next = future[future.length - 1];
      set({
        future: future.slice(0, -1),
        past: [...get().past, { nodes, edges }],
        nodes: next.nodes,
        edges: next.edges,
      });
      touch();
    },

    importState(nodes, edges) {
      pushHistory();
      set({ nodes, edges, selectedNodeId: null, selectedEdgeId: null });
      touch();
    },
  };
});

export const getViewport = () => viewport;

export function nodeTitle(node: OsintNode): string {
  return node.data.label || `${entityDef(node.data.kind).name} sans valeur`;
}

export const CONFIDENCE_ORDER: Confidence[] = ['confirmed', 'probable', 'unverified'];
