import type { BoardMeta, BoardState, OsintEdge, OsintNode, SearchHit, Snapshot, Tool } from '../types';

async function req<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    headers: { 'content-type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    let msg = `Erreur ${res.status}`;
    try {
      msg = (await res.json()).error ?? msg;
    } catch {
      /* rien */
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

const body = (data: unknown) => JSON.stringify(data);

export const api = {
  listBoards: () => req<BoardMeta[]>('/api/boards'),
  createBoard: (title: string) => req<BoardState>('/api/boards', { method: 'POST', body: body({ title }) }),
  getBoard: (id: string) => req<BoardState>(`/api/boards/${id}`),
  saveBoard: (
    id: string,
    payload: {
      title: string;
      target: string;
      notes: string;
      viewport: { x: number; y: number; zoom: number };
      nodes: OsintNode[];
      edges: OsintEdge[];
    }
  ) => req<{ savedAt: number; snapshot: Snapshot | null }>(`/api/boards/${id}`, { method: 'PUT', body: body(payload) }),
  deleteBoard: (id: string) => req<{ deleted: boolean }>(`/api/boards/${id}`, { method: 'DELETE' }),
  duplicateBoard: (id: string) => req<BoardState>(`/api/boards/${id}/duplicate`, { method: 'POST' }),

  listSnapshots: (id: string) => req<Snapshot[]>(`/api/boards/${id}/snapshots`),
  createSnapshot: (id: string, label: string) =>
    req<Snapshot>(`/api/boards/${id}/snapshots`, { method: 'POST', body: body({ label }) }),
  restoreSnapshot: (id: string) => req<BoardState>(`/api/snapshots/${id}/restore`, { method: 'POST' }),

  search: (q: string, exact = false) =>
    req<SearchHit[]>(`/api/search?q=${encodeURIComponent(q)}${exact ? '&exact=1' : ''}`),

  upload: (boardId: string, dataUrl: string, name: string) =>
    req<{ url: string; name: string; mime: string }>(`/api/boards/${boardId}/attachments`, {
      method: 'POST',
      body: body({ dataUrl, name }),
    }),

  listTools: () => req<Tool[]>('/api/tools'),
  addTool: (tool: Omit<Tool, 'id'>) => req<Tool>('/api/tools', { method: 'POST', body: body(tool) }),
  deleteTool: (id: string) => req<{ deleted: boolean }>(`/api/tools/${id}`, { method: 'DELETE' }),
};
