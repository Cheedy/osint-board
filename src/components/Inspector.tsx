import { useReactFlow } from '@xyflow/react';
import { useRef, useState } from 'react';
import { CONFIDENCE, ENTITY_DEFS, entityDef } from '../lib/entityTypes';
import { api } from '../lib/api';
import { KNOWN_PLATFORMS } from '../lib/platforms';
import { useStore } from '../store';
import type { Confidence, EntityKind } from '../types';

const METHODS = [
  'Recherche Google',
  'Dork Google',
  'Holehe',
  'Epieos',
  'Sherlock',
  'WhatsMyName',
  'Whois',
  'Recherche d’image inversée',
  'Profil public',
  'Recoupement manuel',
  'Capture d’écran',
  'Fuite de données',
  'Annuaire',
  'Registre public',
];

export default function Inspector() {
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
          <h2>Lien</h2>
          <button className="icon-btn" onClick={() => select(null, null)} title="Fermer">
            ×
          </button>
        </div>

        <div className="insp-link">
          <button className="link-end" onClick={() => select(edge.source, null)}>
            {entityDef(from?.data.kind ?? 'note').icon} {from?.data.label || '(vide)'}
          </button>
          <span className="link-arrow">↓</span>
          <button className="link-end" onClick={() => select(edge.target, null)}>
            {entityDef(to?.data.kind ?? 'note').icon} {to?.data.label || '(vide)'}
          </button>
        </div>

        <label className="field">
          <span>Ce que dit le lien</span>
          <input
            value={edge.data?.label ?? ''}
            placeholder="même pseudo, même photo de profil…"
            onChange={(e) => updateEdge(edge.id, { label: e.target.value })}
          />
        </label>

        <label className="field">
          <span>Comment tu l’as trouvé</span>
          <input
            list="methods"
            value={edge.data?.method ?? ''}
            placeholder="Holehe, dork Google, recoupement…"
            onChange={(e) => updateEdge(edge.id, { method: e.target.value })}
          />
          <datalist id="methods">
            {METHODS.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </label>

        <label className="field">
          <span>Source (URL ou référence)</span>
          <input
            value={edge.data?.sourceUrl ?? ''}
            placeholder="https://…"
            onChange={(e) => updateEdge(edge.id, { sourceUrl: e.target.value })}
          />
        </label>

        <div className="field">
          <span>Fiabilité</span>
          <div className="conf-row">
            {CONFIDENCE.map((c) => (
              <button
                key={c.value}
                className={`conf ${edge.data?.confidence === c.value ? 'is-active' : ''}`}
                style={{ '--c': c.color } as React.CSSProperties}
                onClick={() => updateEdge(edge.id, { confidence: c.value })}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="insp-actions">
          <button className="btn btn-ghost" onClick={() => flipEdge(edge.id)}>
            ↕ Inverser le sens
          </button>
          <button className="btn btn-danger" onClick={() => deleteEdge(edge.id)}>
            Supprimer le lien
          </button>
        </div>
      </aside>
    );
  }

  /* ----------------------------------------------------------------- noeud */
  const def = entityDef(node!.data.kind);
  const data = node!.data;
  const custom = Object.keys(data.fields ?? {}).filter((k) => !def.fields.some((f) => f.key === k));
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
      notify('Envoi du fichier impossible');
    }
  };

  return (
    <aside className="inspector">
      <div className="insp-head">
        <h2>
          {def.icon} {String(data.fields?.plateforme ?? '').trim() || def.name}
        </h2>
        <button className="icon-btn" onClick={() => select(null, null)} title="Fermer (Échap)">
          ×
        </button>
      </div>

      <label className="field">
        <span>{def.valueLabel}</span>
        <input
          value={data.label}
          placeholder={def.placeholder}
          onChange={(e) => updateNode(node!.id, { label: e.target.value })}
          onBlur={() => data.label.trim() && void checkDuplicate(node!.id)}
        />
      </label>

      <div className="field">
        <span>Fiabilité</span>
        <div className="conf-row">
          {CONFIDENCE.map((c) => (
            <button
              key={c.value}
              className={`conf ${data.confidence === c.value ? 'is-active' : ''}`}
              style={{ '--c': c.color } as React.CSSProperties}
              onClick={() => updateNode(node!.id, { confidence: c.value as Confidence })}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="insp-fields">
        {def.fields.map((f) => (
          <label className="field" key={f.key}>
            <span>{f.label}</span>
            <input
              value={data.fields?.[f.key] ?? ''}
              placeholder={f.placeholder ?? ''}
              list={f.key === 'plateforme' ? 'platforms' : undefined}
              onChange={(e) => setNodeField(node!.id, f.key, e.target.value)}
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
              <button className="field-del" onClick={() => removeNodeField(node!.id, k)} title="Retirer ce champ">
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
        <input placeholder="+ ajouter un champ" value={newField} onChange={(e) => setNewField(e.target.value)} />
      </form>

      <label className="field">
        <span>Source de l’info</span>
        <input
          value={data.source}
          placeholder="https://… ou « capture Insta du 12/03 »"
          onChange={(e) => updateNode(node!.id, { source: e.target.value })}
        />
      </label>

      <label className="field">
        <span>Note</span>
        <textarea
          rows={3}
          value={data.note}
          placeholder="Ce que tu retiens, les doutes, la prochaine étape…"
          onChange={(e) => updateNode(node!.id, { note: e.target.value })}
        />
      </label>

      <div className="field">
        <span>Pièce jointe</span>
        {data.attachment ? (
          <div className="insp-attach">
            <img src={data.attachment} alt="" />
            <button className="btn btn-ghost btn-sm" onClick={() => updateNode(node!.id, { attachment: '' })}>
              Retirer
            </button>
          </div>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>
              Choisir un fichier…
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
        <span>Changer de type</span>
        <select
          value={data.kind}
          onChange={(e) => updateNode(node!.id, { kind: e.target.value as EntityKind })}
        >
          {ENTITY_DEFS.map((d) => (
            <option key={d.kind} value={d.kind}>
              {d.icon} {d.name}
            </option>
          ))}
        </select>
      </div>

      {links.length > 0 && (
        <div className="insp-links">
          <span className="field-label">Connexions ({links.length})</span>
          {links.map((e) => {
            const other = nodes.find((n) => n.id === (e.source === node!.id ? e.target : e.source));
            const outgoing = e.source === node!.id;
            return (
              <button key={e.id} className="insp-link-row" onClick={() => select(null, e.id)}>
                <span className="dir">{outgoing ? '→' : '←'}</span>
                <span className="who">
                  {entityDef(other?.data.kind ?? 'note').icon} {other?.data.label || '(vide)'}
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
          Centrer
        </button>
        <button className="btn btn-danger" onClick={() => deleteNode(node!.id)}>
          Supprimer
        </button>
      </div>
    </aside>
  );
}
