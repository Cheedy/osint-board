import { useMemo, useState } from 'react';
import { ENTITY_DEFS, entityDef } from '../lib/entityTypes';
import { TOOLS, fillCmd, fillUrl, toolMatches } from '../lib/tools';
import { useStore } from '../store';
import type { EntityKind, Tool } from '../types';

export default function RightSidebar() {
  const nodes = useStore((s) => s.nodes);
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const customTools = useStore((s) => s.customTools);
  const addTool = useStore((s) => s.addTool);
  const deleteTool = useStore((s) => s.deleteTool);
  const addNode = useStore((s) => s.addNode);
  const onConnect = useStore((s) => s.onConnect);
  const notify = useStore((s) => s.notify);

  const [search, setSearch] = useState('');
  const [onlyRelevant, setOnlyRelevant] = useState(true);
  const [trace, setTrace] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', url: '' });

  const selected = nodes.find((n) => n.id === selectedNodeId) ?? null;
  const value = selected?.data.label ?? '';
  const kind = (selected?.data.kind ?? null) as EntityKind | null;

  const all = useMemo(() => [...TOOLS, ...customTools], [customTools]);
  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((t) => {
      if (q && !(`${t.name} ${t.category}`.toLowerCase().includes(q))) return false;
      if (onlyRelevant && kind && !toolMatches(t, kind)) return false;
      return true;
    });
  }, [all, search, onlyRelevant, kind]);

  const grouped = useMemo(() => {
    const map = new Map<string, Tool[]>();
    for (const t of list) {
      if (!map.has(t.category)) map.set(t.category, []);
      map.get(t.category)!.push(t);
    }
    return [...map.entries()];
  }, [list]);

  /** Depose un noeud "Recherche" relie au noeud courant, pour garder la trace du chemin. */
  const traceSearch = (tool: Tool) => {
    if (!selected || !trace) return;
    const pos = { x: selected.position.x + 300, y: selected.position.y + 140 };
    const id = addNode('search', pos, `${tool.name} : ${value}`.slice(0, 80), {
      fields: { outil: tool.name, date: new Date().toLocaleString('fr-FR'), resultat: '' },
      confidence: 'unverified',
    });
    onConnect({ source: selected.id, target: id, sourceHandle: 'right', targetHandle: 'left' });
  };

  const run = (tool: Tool) => {
    if (tool.cmd) {
      const cmd = fillCmd(tool.cmd, value);
      void navigator.clipboard.writeText(cmd);
      notify(`Commande copiée : ${cmd}`);
      traceSearch(tool);
      return;
    }
    if (!tool.url) return;
    const needsValue = tool.url.includes('{{');
    if (needsValue && !value) {
      notify('Sélectionne d’abord un nœud (sa valeur remplit la recherche)');
      return;
    }
    window.open(fillUrl(tool.url, value), '_blank', 'noopener');
    traceSearch(tool);
  };

  return (
    <aside className="side side-right">
      <div className="side-head">
        <h1>Éléments</h1>
        <span className="side-sub">glisse sur le plan</span>
      </div>
      <div className="palette">
        {ENTITY_DEFS.map((d) => (
          <button
            key={d.kind}
            className="palette-item"
            style={{ '--accent': d.color } as React.CSSProperties}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/osint-kind', d.kind);
              e.dataTransfer.effectAllowed = 'move';
            }}
            onClick={() => addNode(d.kind, { x: 120 + Math.random() * 200, y: 120 + Math.random() * 200 })}
            title={`${d.name} — glisse-le sur le plan`}
          >
            <span className="palette-icon">{d.icon}</span>
            <span>{d.short ?? d.name}</span>
          </button>
        ))}
      </div>

      <div className="side-head side-head-sub">
        <h2>Outils OSINT</h2>
        <button className="btn btn-ghost btn-sm" onClick={() => setAdding((v) => !v)}>
          {adding ? 'Annuler' : '+ Outil'}
        </button>
      </div>

      {adding && (
        <form
          className="tool-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name || !form.url) return;
            void addTool({ name: form.name, url: form.url, category: 'Perso', types: kind ? [kind] : ['*'] });
            setForm({ name: '', url: '' });
            setAdding(false);
          }}
        >
          <input placeholder="Nom de l’outil" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input
            placeholder="https://site.fr/?q={{value}}"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
          />
          <div className="tool-form-hint">
            {'{{value}}'} sera remplacé par la valeur du nœud sélectionné
            {kind ? ` (rangé dans les outils « ${entityDef(kind).name} »)` : ''}.
          </div>
          <button className="btn btn-primary btn-sm" type="submit">
            Ajouter
          </button>
        </form>
      )}

      <div className="tool-context">
        {selected ? (
          <>
            <span className="tool-context-icon">{entityDef(selected.data.kind).icon}</span>
            <span className="tool-context-value">{value || '(nœud sans valeur)'}</span>
          </>
        ) : (
          <span className="tool-context-empty">Aucun nœud sélectionné</span>
        )}
      </div>

      <div className="tool-filters">
        <input className="side-filter" placeholder="Chercher un outil…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <label className="toggle" title="N’afficher que les outils adaptés au type sélectionné">
          <input type="checkbox" checked={onlyRelevant} onChange={(e) => setOnlyRelevant(e.target.checked)} />
          adaptés
        </label>
        <label className="toggle" title="Créer un nœud « Recherche » relié, à chaque outil ouvert">
          <input type="checkbox" checked={trace} onChange={(e) => setTrace(e.target.checked)} />
          tracer
        </label>
      </div>

      <div className="tool-list">
        {grouped.map(([cat, tools]) => (
          <div key={cat} className="tool-group">
            <div className="tool-cat">{cat}</div>
            {tools.map((t) => (
              <div key={t.id} className="tool-row">
                <button className="tool-btn" onClick={() => run(t)} title={t.hint ?? t.url ?? t.cmd}>
                  <span className="tool-arrow">{t.cmd ? '⌨' : '↗'}</span>
                  <span className="tool-name">{t.name}</span>
                </button>
                {t.custom && (
                  <button className="tool-del" title="Supprimer cet outil" onClick={() => void deleteTool(t.id)}>
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
        {grouped.length === 0 && <div className="side-empty">Aucun outil pour ce filtre.</div>}
      </div>
    </aside>
  );
}
