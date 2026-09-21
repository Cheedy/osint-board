import { useReactFlow } from '@xyflow/react';
import { useRef, useState } from 'react';
import { autoLayout } from '../lib/layout';
import { entityDef } from '../lib/entityTypes';
import { exportJson, exportMarkdown, exportPdf, exportPng, parseImport } from '../lib/exporters';
import { useStore } from '../store';
import { timeAgo } from '../lib/format';

export default function Toolbar({ onSearch }: { onSearch: () => void }) {
  const board = useStore((s) => s.board);
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const status = useStore((s) => s.status);
  const lastSavedAt = useStore((s) => s.lastSavedAt);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const patchBoard = useStore((s) => s.patchBoard);
  const applyLayout = useStore((s) => s.applyLayout);
  const mergeNodes = useStore((s) => s.mergeNodes);
  const importState = useStore((s) => s.importState);
  const notify = useStore((s) => s.notify);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const past = useStore((s) => s.past);
  const future = useStore((s) => s.future);

  const rf = useReactFlow();
  const fileRef = useRef<HTMLInputElement>(null);
  const [menu, setMenu] = useState(false);
  const [mergeAsk, setMergeAsk] = useState(false);

  if (!board) return null;
  const picked = nodes.filter((n) => n.selected);

  const statusText =
    status === 'saving'
      ? 'Enregistrement…'
      : status === 'dirty'
        ? 'Modifié'
        : status === 'error'
          ? 'Erreur de sauvegarde'
          : lastSavedAt
            ? `Enregistré ${timeAgo(lastSavedAt)}`
            : 'Prêt';

  /** Range en arbre gauche→droite et realigne les ancrages pour que ça se lise d'un trait. */
  const arrange = () => {
    applyLayout(
      autoLayout(nodes, edges, 'LR'),
      edges.map((e) => ({ ...e, sourceHandle: 'right', targetHandle: 'left' }))
    );
    setTimeout(() => rf.fitView({ padding: 0.15, duration: 500 }), 60);
  };

  const doImport = async (file: File) => {
    try {
      const { nodes: n, edges: e } = parseImport(await file.text());
      importState(n, e);
      setTimeout(() => rf.fitView({ padding: 0.15, duration: 400 }), 80);
      notify(`${n.length} éléments importés`);
    } catch {
      notify('Fichier JSON illisible');
    }
  };

  return (
    <header className="toolbar">
      <div className="toolbar-title">
        <input
          className="title-input"
          value={board.title}
          onChange={(e) => patchBoard({ title: e.target.value })}
          placeholder="Nom de l’enquête"
        />
        <input
          className="target-input"
          value={board.target}
          onChange={(e) => patchBoard({ target: e.target.value })}
          placeholder="Cible principale…"
        />
      </div>

      <div className={`save-status is-${status}`} title="Sauvegarde automatique dans SQLite">
        <span className="dot" />
        {statusText}
      </div>

      <div className="toolbar-actions">
        <button className="btn btn-ghost" onClick={undo} disabled={!past.length} title="Annuler (Ctrl+Z)">
          ↶
        </button>
        <button className="btn btn-ghost" onClick={redo} disabled={!future.length} title="Rétablir (Ctrl+Y)">
          ↷
        </button>
        <span className="sep" />
        <button className="btn btn-ghost" onClick={onSearch} title="Rechercher (Ctrl+F)">
          🔍 Chercher
        </button>
        <button className="btn btn-ghost" onClick={arrange} title="Réorganiser le plan en arbre">
          ✨ Ranger
        </button>
        <button className="btn btn-ghost" onClick={() => rf.fitView({ padding: 0.15, duration: 400 })} title="Tout voir">
          ⤢ Ajuster
        </button>
        {picked.length === 2 && (
          <button className="btn btn-accent" onClick={() => setMergeAsk(true)}>
            ⧉ Fusionner
          </button>
        )}
        <span className="sep" />
        <div className="menu-wrap">
          <button className="btn btn-ghost" onClick={() => setMenu((v) => !v)}>
            ⇧ Exporter
          </button>
          {menu && (
            <>
              <div className="menu-backdrop" onClick={() => setMenu(false)} />
              <div className="menu menu-right">
                <button onClick={() => { setMenu(false); void exportPng(board, nodes, theme === 'dark', rf.getNodesBounds(nodes)); }}>
                  Image PNG du plan
                </button>
                <button onClick={() => { setMenu(false); exportPdf(board, nodes, edges); }}>
                  Rapport imprimable (PDF)
                </button>
                <button onClick={() => { setMenu(false); exportMarkdown(board, nodes, edges); }}>
                  Rapport Markdown
                </button>
                <button onClick={() => { setMenu(false); exportJson(board, nodes, edges); }}>
                  Sauvegarde JSON
                </button>
                <button onClick={() => { setMenu(false); fileRef.current?.click(); }}>Importer un JSON…</button>
              </div>
            </>
          )}
        </div>
        <button
          className="btn btn-ghost"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Changer de thème"
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        hidden
        onChange={(e) => e.target.files?.[0] && void doImport(e.target.files[0])}
      />

      {mergeAsk && picked.length === 2 && (
        <div className="modal-backdrop" onClick={() => setMergeAsk(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Fusionner deux nœuds</h3>
            <p className="modal-sub">Lequel gardes-tu ? L’autre lui cède ses champs et ses liens.</p>
            <div className="modal-choices">
              {picked.map((n, i) => (
                <button
                  key={n.id}
                  className="modal-choice"
                  onClick={() => {
                    mergeNodes(n.id, picked[1 - i].id);
                    setMergeAsk(false);
                  }}
                >
                  <b>
                    {entityDef(n.data.kind).icon} {n.data.label || '(vide)'}
                  </b>
                  <span>{entityDef(n.data.kind).name}</span>
                </button>
              ))}
            </div>
            <button className="btn btn-ghost" onClick={() => setMergeAsk(false)}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
