import { useReactFlow } from '@xyflow/react';
import { useRef, useState } from 'react';
import { CONFIDENCE, ENTITY_DEFS, entityDef } from '../lib/entityTypes';
import { api } from '../lib/api';
import { KNOWN_PLATFORMS } from '../lib/platforms';
import { useDict } from '../i18n';
import { useStore } from '../store';
import type { Confidence, EntityKind } from '../types';

export default function Inspector() {
  const d = useDict();
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const selectedEdgeId = useStore((s) => s.selectedEdgeId);
  const updateNode = useStore((s) => s.updateNode);
  const setNodeField = useStore((s) => s.setNodeField);
  const removeNodeField = useStore((s) => s.removeNodeField);
  const deleteNode = useStore((s) => s.deleteNode);
  const updateEdge = useStore((s) => s.updateEdge);
  const deleteEdge = useStore((s) => s.deleteEdge);
  const flipEdge = useStore((s) => s.flipEdge);
  const select = useStore((s) => s.select);
  const checkDuplicate = useStore((s) => s.checkDuplicate);
  const board = useStore((s) => s.board);
  const notify = useStore((s) => s.notify);
  const rf = useReactFlow();
  const fileRef = useRef<HTMLInputElement>(null);
  const [newField, setNewField] = useState('');

  const node = nodes.find((n) => n.id === selectedNodeId) ?? null;
  const edge = edges.find((e) => e.id === selectedEdgeId) ?? null;
  if (!node && !edge) return null;

  /* ------------------------------------------------------------------ lien */
  if (edge) {
    const from = nodes.find((n) => n.id === edge.source);
    const to = nodes.find((n) => n.id === edge.target);
    return (
      <aside className="inspector">
        <div className="insp-head">
          <h2>{d.inspector.linkTitle}</h2>
          <button className="icon-btn" onClick={() => select(null, null)} title={d.common.close}>
            ×
          </button>
        </div>

        <div className="insp-link">
          <button className="link-end" onClick={() => select(edge.source, null)}>
            {entityDef(from?.data.kind ?? 'note').icon} {from?.data.label || d.common.empty}
          </button>
          <span className="link-arrow">↓</span>
          <button className="link-end" onClick={() => select(edge.target, null)}>
            {entityDef(to?.data.kind ?? 'note').icon} {to?.data.label || d.common.empty}
          </button>
        </div>

        <label className="field">
          <span>{d.inspector.linkSays}</span>
          <input
            value={edge.data?.label ?? ''}
            placeholder={d.inspector.linkSaysPlaceholder}
            onChange={(e) => updateEdge(edge.id, { label: e.target.value })}
          />
        </label>

        <label className="field">
          <span>{d.inspector.linkHow}</span>
          <input
            list="methods"
            value={edge.data?.method ?? ''}
            placeholder={d.inspector.linkHowPlaceholder}
            onChange={(e) => updateEdge(edge.id, { method: e.target.value })}
          />
          <datalist id="methods">
            {d.methods.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </label>

        <label className="field">
          <span>{d.inspector.linkSource}</span>
          <input
            value={edge.data?.sourceUrl ?? ''}
            placeholder={d.inspector.linkSourcePlaceholder}
            onChange={(e) => updateEdge(edge.id, { sourceUrl: e.target.value })}
          />
        </label>

        <div className="field">
          <span>{d.inspector.confidence}</span>
          <div className="conf-row">
            {CONFIDENCE.map((c) => (
              <button
                key={c.value}
                className={`conf ${edge.data?.confidence === c.value ? 'is-active' : ''}`}
                style={{ '--c': c.color } as React.CSSProperties}
                onClick={() => updateEdge(edge.id, { confidence: c.value })}
              >
                {d.confidence[c.value]}
              </button>
            ))}
          </div>
        </div>

        <div className="insp-actions">
          <button className="btn btn-ghost" onClick={() => flipEdge(edge.id)}>
            {d.inspector.flip}
          </button>
          <button className="btn btn-danger" onClick={() => deleteEdge(edge.id)}>
            {d.inspector.deleteLink}
          </button>
        </div>
      </aside>
    );
  }

  /* ----------------------------------------------------------------- noeud */
  const def = entityDef(node!.data.kind);
  const labels = d.entity[node!.data.kind] ?? d.entity.note;
  const fieldLabels = labels.fields as Record<string, string>;
  const placeholders = labels.ph as Record<string, string>;
  const data = node!.data;
  const custom = Object.keys(data.fields ?? {}).filter((k) => !def.fields.includes(k));
  const links = edges.filter((e) => e.source === node!.id || e.target === node!.id);

  const upload = async (file: File) => {
    if (!board) return;
    const dataUrl = await new Promise<string>((res) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.readAsDataURL(file);
    });
    try {
      const up = await api.upload(board.id, dataUrl, file.name);
      updateNode(node!.id, { attachment: up.url });
    } catch {
      notify(d.inspector.uploadError);
    }
  };

  return (
    <aside className="inspector">
      <div className="insp-head">
        <h2>
          {def.icon} {String(data.fields?.plateforme ?? '').trim() || labels.name}
        </h2>
        <button className="icon-btn" onClick={() => select(null, null)} title={d.common.closeEsc}>
          ×
        </button>
      </div>

      <label className="field">
        <span>{labels.value}</span>
        <input
          value={data.label}
          placeholder={labels.placeholder}
          onChange={(e) => updateNode(node!.id, { label: e.target.value })}
          onBlur={() => data.label.trim() && void checkDuplicate(node!.id)}
        />
      </label>

      <div className="field">
        <span>{d.inspector.confidence}</span>
        <div className="conf-row">
          {CONFIDENCE.map((c) => (
            <button
              key={c.value}
              className={`conf ${data.confidence === c.value ? 'is-active' : ''}`}
              style={{ '--c': c.color } as React.CSSProperties}
              onClick={() => updateNode(node!.id, { confidence: c.value as Confidence })}
            >
              {d.confidence[c.value]}
            </button>
          ))}
        </div>
      </div>

      <div className="insp-fields">
        {def.fields.map((key) => (
          <label className="field" key={key}>
            <span>{fieldLabels[key] ?? key}</span>
            <input
              value={data.fields?.[key] ?? ''}
              placeholder={placeholders[key] ?? ''}
              list={key === 'plateforme' ? 'platforms' : undefined}
              onChange={(e) => setNodeField(node!.id, key, e.target.value)}
            />
          </label>
        ))}
        <datalist id="platforms">
          {KNOWN_PLATFORMS.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
        {custom.map((k) => (
          <label className="field" key={k}>
            <span>
              {k}
              <button
                className="field-del"
                onClick={() => removeNodeField(node!.id, k)}
                title={d.inspector.removeField}
              >
                ×
              </button>
            </span>
            <input value={data.fields[k]} onChange={(e) => setNodeField(node!.id, k, e.target.value)} />
          </label>
        ))}
      </div>

      <form
        className="add-field"
        onSubmit={(e) => {
          e.preventDefault();
          const key = newField.trim();
          if (key) setNodeField(node!.id, key, '');
          setNewField('');
        }}
      >
        <input placeholder={d.inspector.addField} value={newField} onChange={(e) => setNewField(e.target.value)} />
      </form>

      <label className="field">
        <span>{d.inspector.source}</span>
        <input
          value={data.source}
          placeholder={d.inspector.sourcePlaceholder}
          onChange={(e) => updateNode(node!.id, { source: e.target.value })}
        />
      </label>

      <label className="field">
        <span>{d.inspector.note}</span>
        <textarea
          rows={3}
          value={data.note}
          placeholder={d.inspector.notePlaceholder}
          onChange={(e) => updateNode(node!.id, { note: e.target.value })}
        />
      </label>

      <div className="field">
        <span>{d.inspector.attachment}</span>
        {data.attachment ? (
          <div className="insp-attach">
            <img src={data.attachment} alt="" />
            <button className="btn btn-ghost btn-sm" onClick={() => updateNode(node!.id, { attachment: '' })}>
              {d.common.remove}
            </button>
          </div>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>
              {d.inspector.pickFile}
            </button>
            <input
              ref={fileRef}
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])}
            />
          </>
        )}
      </div>

      <div className="field">
        <span>{d.inspector.changeKind}</span>
        <select value={data.kind} onChange={(e) => updateNode(node!.id, { kind: e.target.value as EntityKind })}>
          {ENTITY_DEFS.map((entity) => (
            <option key={entity.kind} value={entity.kind}>
              {entity.icon} {d.entity[entity.kind].name}
            </option>
          ))}
        </select>
      </div>

      {links.length > 0 && (
        <div className="insp-links">
          <span className="field-label">{d.inspector.connections(links.length)}</span>
          {links.map((e) => {
            const other = nodes.find((n) => n.id === (e.source === node!.id ? e.target : e.source));
            const outgoing = e.source === node!.id;
            return (
              <button key={e.id} className="insp-link-row" onClick={() => select(null, e.id)}>
                <span className="dir">{outgoing ? '→' : '←'}</span>
                <span className="who">
                  {entityDef(other?.data.kind ?? 'note').icon} {other?.data.label || d.common.empty}
                </span>
                {e.data?.label && <span className="what">{e.data.label}</span>}
              </button>
            );
          })}
        </div>
      )}

      <div className="insp-actions">
        <button
          className="btn btn-ghost"
          onClick={() => rf.setCenter(node!.position.x + 110, node!.position.y + 50, { zoom: 1.2, duration: 400 })}
        >
          {d.inspector.center}
        </button>
        <button className="btn btn-danger" onClick={() => deleteNode(node!.id)}>
          {d.common.delete}
        </button>
      </div>
    </aside>
  );
}
