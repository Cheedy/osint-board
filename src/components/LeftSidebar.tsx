import { useState } from 'react';
import { useStore } from '../store';
import { timeAgo, formatTime } from '../lib/format';

export default function LeftSidebar() {
  const boards = useStore((s) => s.boards);
  const board = useStore((s) => s.board);
  const snapshots = useStore((s) => s.snapshots);
  const openBoard = useStore((s) => s.openBoard);
  const newBoard = useStore((s) => s.newBoard);
  const removeBoard = useStore((s) => s.removeBoard);
  const duplicateBoard = useStore((s) => s.duplicateBoard);
  const restoreSnapshot = useStore((s) => s.restoreSnapshot);
  const makeSnapshot = useStore((s) => s.makeSnapshot);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const visible = boards.filter((b) => b.title.toLowerCase().includes(filter.toLowerCase()));

  return (
    <aside className="side side-left">
      <div className="side-head">
        <h1>Enquêtes</h1>
        <button className="btn btn-primary btn-sm" onClick={() => void newBoard()} title="Nouvelle enquête">
          + Nouvelle
        </button>
      </div>

      {boards.length > 6 && (
        <input
          className="side-filter"
          placeholder="Filtrer…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      )}

      <div className="board-list">
        {visible.length === 0 && <div className="side-empty">Aucune enquête. Crée la première.</div>}
        {visible.map((b) => (
          <div
            key={b.id}
            className={`board-item ${b.id === board?.id ? 'is-active' : ''}`}
            onClick={() => void openBoard(b.id)}
          >
            <div className="board-item-main">
              <div className="board-title">{b.title}</div>
              <div className="board-meta">
                {b.nodeCount} élément{b.nodeCount > 1 ? 's' : ''} · {b.edgeCount} lien
                {b.edgeCount > 1 ? 's' : ''} · {timeAgo(b.updatedAt)}
              </div>
            </div>
            <button
              className="board-more"
              onClick={(e) => {
                e.stopPropagation();
                setMenuFor(menuFor === b.id ? null : b.id);
              }}
            >
              ⋯
            </button>
            {menuFor === b.id && (
              <div className="menu" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => {
                    setMenuFor(null);
                    void duplicateBoard(b.id);
                  }}
                >
                  Dupliquer
                </button>
                <button
                  className="danger"
                  onClick={() => {
                    setMenuFor(null);
                    if (confirm(`Supprimer « ${b.title} » et tout son contenu ?`)) void removeBoard(b.id);
                  }}
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {board && (
        <div className="history">
          <div className="side-head side-head-sub">
            <h2>Historique</h2>
            <button
              className="btn btn-ghost btn-sm"
              title="Figer une version maintenant (Ctrl+S)"
              onClick={() => void makeSnapshot('point manuel')}
            >
              + Version
            </button>
          </div>
          <div className="history-list">
            {snapshots.length === 0 && <div className="side-empty">Pas encore de version.</div>}
            {snapshots.map((s, i) => (
              <button
                key={s.id}
                className="history-item"
                title="Restaurer cette version"
                onClick={() => {
                  if (confirm(`Revenir à la version de ${formatTime(s.createdAt)} ?\n\nL’état actuel sera gardé comme version avant de basculer.`))
                    void restoreSnapshot(s.id);
                }}
              >
                <span className="history-time">{formatTime(s.createdAt)}</span>
                <span className="history-meta">
                  {s.nodeCount} él. · {s.edgeCount} liens {s.label ? `· ${s.label}` : ''}
                </span>
                {i === 0 && <span className="history-tag">le plus récent</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
