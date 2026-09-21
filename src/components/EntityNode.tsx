import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useEffect, useRef, useState } from 'react';
import { confidenceColor, entityDef } from '../lib/entityTypes';
import { ageFrom } from '../lib/dates';
import { useDict } from '../i18n';
import { useStore } from '../store';
import type { OsintNode } from '../types';

const SIDES = [
  { id: 'top', position: Position.Top },
  { id: 'right', position: Position.Right },
  { id: 'bottom', position: Position.Bottom },
  { id: 'left', position: Position.Left },
];

export default function EntityNode({ id, data, selected }: NodeProps<OsintNode>) {
  const d = useDict();
  const def = entityDef(data.kind);
  const labels = d.entity[data.kind] ?? d.entity.note;
  const updateNode = useStore((s) => s.updateNode);
  const checkDuplicate = useStore((s) => s.checkDuplicate);
  const [editing, setEditing] = useState(!data.label);
  const [draft, setDraft] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  useEffect(() => {
    if (!editing) setDraft(data.label);
  }, [data.label, editing]);

  const commit = () => {
    setEditing(false);
    const value = draft.trim();
    if (value !== data.label) {
      updateNode(id, { label: value });
      if (value) void checkDuplicate(id);
    }
  };

  /* Pour un compte social, la plateforme sert d'en-tete : inutile de la repeter dessous. */
  const platform = String(data.fields?.plateforme ?? '').trim();
  /* Une date de naissance affiche l'age du jour, calcule au vol (rien n'est stocke). */
  const age = data.kind === 'birth' ? ageFrom(data.label) : null;
  const fieldLabel = (key: string) => (labels.fields as Record<string, string>)[key] ?? key;
  const shown = Object.entries(data.fields ?? {})
    .filter(([k, v]) => {
      if (!v || !String(v).trim()) return false;
      if (k === 'plateforme' && platform) return false;
      if (k === 'handle' && String(v).trim() === data.label.trim()) return false;
      return true;
    })
    .slice(0, 3);

  return (
    <div
      className={`node ${selected ? 'is-selected' : ''}`}
      style={
        {
          '--accent': data.color || def.color,
          '--conf': confidenceColor(data.confidence),
        } as React.CSSProperties
      }
    >
      {SIDES.map((s) => (
        <Handle key={s.id} id={s.id} type="source" position={s.position} className="node-handle" />
      ))}

      <div className="node-head">
        <span className="node-dot" title={d.confidence[data.confidence]} />
        <span className="node-icon">{def.icon}</span>
        <span className="node-kind">{platform || labels.name}</span>
        {data.source && (
          <a
            className="node-src"
            href={/^https?:\/\//.test(data.source) ? data.source : undefined}
            target="_blank"
            rel="noreferrer"
            title={data.source}
            onClick={(e) => e.stopPropagation()}
          >
            🔗
          </a>
        )}
      </div>

      {data.attachment && (
        <img className="node-img" src={data.attachment} alt={data.label} draggable={false} />
      )}

      {editing ? (
        <input
          ref={inputRef}
          className="node-input nodrag"
          value={draft}
          placeholder={labels.placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') {
              setDraft(data.label);
              setEditing(false);
            }
            e.stopPropagation();
          }}
        />
      ) : (
        <div className="node-label" onDoubleClick={() => setEditing(true)} title={d.node.editHint}>
          {data.label || <span className="node-empty">{labels.placeholder}</span>}
        </div>
      )}

      {(shown.length > 0 || age !== null) && (
        <div className="node-fields">
          {age !== null && (
            <div className="node-field">
              <span>{d.node.ageToday}</span>
              <b>{d.node.years(age)}</b>
            </div>
          )}
          {shown.map(([k, v]) => (
            <div key={k} className="node-field">
              <span>{fieldLabel(k)}</span>
              <b>{String(v)}</b>
            </div>
          ))}
        </div>
      )}

      {data.note && <div className="node-note">{data.note}</div>}
    </div>
  );
}
