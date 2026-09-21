import { useState } from 'react';
import { useDict } from '../i18n';
import { useStore } from '../store';
import { timeAgo, formatTime } from '../lib/format';
import LanguagePicker from './LanguagePicker';

export default function LeftSidebar() {
  const d = useDict();
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
        <h1>{d.boards.title}</h1>
        <button className="btn btn-primary btn-sm" onClick={() => void newBoard()} title={d.boards.newTitle}>
          {d.boards.new}
        </button>
      </div>

      {boards.length > 6 && (
        <input
          className="side-filter"
          placeholder={d.boards.filter}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      )}

      <div className="board-list">
        {visible.length === 0 && <div className="side-empty">{d.boards.none}</div>}
        {visible.map((b) => (
          <div
            key={b.id}
            className={`board-item ${b.id === board?.id ? 'is-active' : ''}`}
            onClick={() => void openBoard(b.id)}
          >
            <div className="board-item-main">
              <div className="board-title">{b.title}</div>
              <div className="board-meta">{d.boards.summary(b.nodeCount, b.edgeCount, timeAgo(b.updatedAt))}</div>
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
                  {d.boards.duplicate}
                </button>
                <button
                  className="danger"
                  onClick={() => {
                    setMenuFor(null);
                    if (confirm(d.boards.confirmDelete(b.title))) void removeBoard(b.id);
                  }}
                >
                  {d.common.delete}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {board && (
        <div className="history">
          <div className="side-head side-head-sub">
            <h2>{d.history.title}</h2>
            <button
              className="btn btn-ghost btn-sm"
              title={d.history.addTitle}
              onClick={() => void makeSnapshot(d.history.manualPoint)}
            >
              {d.history.add}
            </button>
          </div>
          <div className="history-list">
            {snapshots.length === 0 && <div className="side-empty">{d.history.none}</div>}
            {snapshots.map((s, i) => (
              <button
                key={s.id}
                className="history-item"
                title={d.history.restoreTitle}
                onClick={() => {
                  if (confirm(d.history.confirmRestore(formatTime(s.createdAt)))) void restoreSnapshot(s.id);
                }}
              >
                <span className="history-time">{formatTime(s.createdAt)}</span>
                <span className="history-meta">{d.history.meta(s.nodeCount, s.edgeCount, s.label)}</span>
                {i === 0 && <span className="history-tag">{d.history.latest}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="side-foot">
        <LanguagePicker />
      </div>
    </aside>
  );
}
