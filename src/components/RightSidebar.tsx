import { useMemo, useState } from 'react';
import { ENTITY_DEFS, entityDef } from '../lib/entityTypes';
import { TOOLS, TOOL_CATEGORIES, fillCmd, fillUrl, toolMatches } from '../lib/tools';
import { useDict } from '../i18n';
import { useStore } from '../store';
import type { EntityKind, Tool } from '../types';

export default function RightSidebar() {
  const d = useDict();
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

  const catLabel = (key: string) =>
    (d.tools.categories as Record<string, string>)[key] ?? key;

  const all = useMemo(() => [...TOOLS, ...customTools], [customTools]);
  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((t) => {
      if (q && !`${toolLabel(t)} ${catLabel(t.category)}`.toLowerCase().includes(q)) return false;
      if (onlyRelevant && kind && !toolMatches(t, kind)) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, search, onlyRelevant, kind, d]);

  const grouped = useMemo(() => {
    const map = new Map<string, Tool[]>();
    for (const t of list) {
      if (!map.has(t.category)) map.set(t.category, []);
      map.get(t.category)!.push(t);
    }
    const order = [...TOOL_CATEGORIES] as string[];
    return [...map.entries()].sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  }, [list]);

  /** Depose un noeud "Recherche" relie au noeud courant, pour garder la trace du chemin. */
  const traceSearch = (tool: Tool) => {
    if (!selected || !trace) return;
    const pos = { x: selected.position.x + 330, y: selected.position.y + 150 };
    const id = addNode('search', pos, `${toolLabel(tool)} : ${value}`.slice(0, 80), {
      fields: { outil: toolLabel(tool), date: new Date().toLocaleString(d.locale), resultat: '' },
      confidence: 'unverified',
    });
    onConnect({ source: selected.id, target: id, sourceHandle: 'right', targetHandle: 'left' });
  };

  const run = (tool: Tool) => {
    if (tool.cmd) {
      const cmd = fillCmd(tool.cmd, value);
      void navigator.clipboard.writeText(cmd);
      notify(d.tools.copied(cmd));
      traceSearch(tool);
      return;
    }
    if (!tool.url) return;
    const needsValue = tool.url.includes('{{');
    if (needsValue && !value) {
      notify(d.tools.needSelection);
      return;
    }
    window.open(fillUrl(tool.url, value), '_blank', 'noopener');
    traceSearch(tool);
  };

  const toolLabel = (tool: Tool) => {
    const variant = tool.variant ? (d.tools.variants as Record<string, string>)[tool.variant] : '';
    return variant ? `${tool.name} — ${variant}` : tool.name;
  };

  const hint = (tool: Tool) =>
    tool.hint ? ((d.tools.hints as Record<string, string>)[tool.hint] ?? tool.hint) : undefined;

  return (
    <aside className="side side-right">
      <div className="side-head">
        <h1>{d.tools.elements}</h1>
        <span className="side-sub">{d.tools.dragHint}</span>
      </div>
      <div className="palette">
        {ENTITY_DEFS.map((def) => (
          <button
            key={def.kind}
            className="palette-item"
            style={{ '--accent': def.color } as React.CSSProperties}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/osint-kind', def.kind);
              e.dataTransfer.effectAllowed = 'move';
            }}
            onClick={() => addNode(def.kind, { x: 120 + Math.random() * 200, y: 120 + Math.random() * 200 })}
            title={d.tools.dragTitle(d.entity[def.kind].name)}
          >
            <span className="palette-icon">{def.icon}</span>
            <span>{d.entity[def.kind].short || d.entity[def.kind].name}</span>
          </button>
        ))}
      </div>

      <div className="side-head side-head-sub">
        <h2>{d.tools.title}</h2>
        <button className="btn btn-ghost btn-sm" onClick={() => setAdding((v) => !v)}>
          {adding ? d.common.cancel : d.tools.addTool}
        </button>
      </div>

      {adding && (
        <form
          className="tool-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name || !form.url) return;
            void addTool({ name: form.name, url: form.url, category: 'custom', types: kind ? [kind] : ['*'] });
            setForm({ name: '', url: '' });
            setAdding(false);
          }}
        >
          <input
            placeholder={d.tools.toolName}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder={d.tools.toolUrl}
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
          />
          <div className="tool-form-hint">{d.tools.toolFormHint(kind ? d.entity[kind].name : '')}</div>
          <button className="btn btn-primary btn-sm" type="submit">
            {d.common.add}
          </button>
        </form>
      )}

      <div className="tool-context">
        {selected ? (
          <>
            <span className="tool-context-icon">{entityDef(selected.data.kind).icon}</span>
            <span className="tool-context-value">{value || d.tools.valuelessNode}</span>
          </>
        ) : (
          <span className="tool-context-empty">{d.tools.noSelection}</span>
        )}
      </div>

      <div className="tool-filters">
        <input
          className="side-filter"
          placeholder={d.tools.filterPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="toggle" title={d.tools.relevantTitle}>
          <input type="checkbox" checked={onlyRelevant} onChange={(e) => setOnlyRelevant(e.target.checked)} />
          {d.tools.relevant}
        </label>
        <label className="toggle" title={d.tools.traceTitle}>
          <input type="checkbox" checked={trace} onChange={(e) => setTrace(e.target.checked)} />
          {d.tools.trace}
        </label>
      </div>

      <div className="tool-list">
        {grouped.map(([cat, tools]) => (
          <div key={cat} className="tool-group">
            <div className="tool-cat">{catLabel(cat)}</div>
            {tools.map((t) => (
              <div key={t.id} className="tool-row">
                <button className="tool-btn" onClick={() => run(t)} title={hint(t) ?? t.url ?? t.cmd}>
                  <span className="tool-arrow">{t.cmd ? '⌨' : '↗'}</span>
                  <span className="tool-name">{toolLabel(t)}</span>
                </button>
                {t.custom && (
                  <button className="tool-del" title={d.tools.deleteTool} onClick={() => void deleteTool(t.id)}>
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
        {grouped.length === 0 && <div className="side-empty">{d.tools.noneForFilter}</div>}
      </div>
    </aside>
  );
}
