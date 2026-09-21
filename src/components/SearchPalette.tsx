import { useReactFlow } from '@xyflow/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { entityDef } from '../lib/entityTypes';
import { useDict } from '../i18n';
import { api } from '../lib/api';
import { useStore } from '../store';
import type { SearchHit } from '../types';

export default function SearchPalette({ onClose }: { onClose: () => void }) {
  const d = useDict();
  const nodes = useStore((s) => s.nodes);
  const board = useStore((s) => s.board);
  const select = useStore((s) => s.select);
  const openBoard = useStore((s) => s.openBoard);
  const rf = useReactFlow();
  const [q, setQ] = useState('');
  const [others, setOthers] = useState<SearchHit[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => inputRef.current?.focus(), []);

  const local = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return nodes
      .filter((n) =>
        [n.data.label, n.data.note, n.data.source, ...Object.values(n.data.fields ?? {})]
          .join(' ')
          .toLowerCase()
          .includes(needle)
      )
      .slice(0, 12);
  }, [q, nodes]);

  useEffect(() => {
    const needle = q.trim();
    if (needle.length < 2) {
      setOthers([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const hits = await api.search(needle);
        setOthers(hits.filter((h) => h.boardId !== board?.id).slice(0, 8));
      } catch {
        setOthers([]);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [q, board?.id]);

  const goTo = (id: string) => {
    const n = nodes.find((x) => x.id === id);
    if (!n) return;
    select(id, null);
    rf.setCenter(n.position.x + 110, n.position.y + 50, { zoom: 1.2, duration: 420 });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="palette-search" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={q}
          placeholder={d.search.placeholder}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter' && local[0]) goTo(local[0].id);
          }}
        />

        {q && (
          <div className="search-results">
            {local.length > 0 && <div className="search-group">{d.search.here}</div>}
            {local.map((n) => (
              <button key={n.id} className="search-row" onClick={() => goTo(n.id)}>
                <span>{entityDef(n.data.kind).icon}</span>
                <b>{n.data.label || d.common.empty}</b>
                <span className="search-kind">{d.entity[n.data.kind].name}</span>
              </button>
            ))}

            {others.length > 0 && <div className="search-group">{d.search.elsewhere}</div>}
            {others.map((h) => (
              <button
                key={h.id}
                className="search-row"
                onClick={() => {
                  void openBoard(h.boardId).then(() => select(h.id, null));
                  onClose();
                }}
              >
                <span>{entityDef(h.kind).icon}</span>
                <b>{h.label}</b>
                <span className="search-kind">{h.boardTitle}</span>
              </button>
            ))}

            {local.length === 0 && others.length === 0 && <div className="side-empty">{d.search.nothing}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
