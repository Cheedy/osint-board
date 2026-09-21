import { useReactFlow } from '@xyflow/react';
import { useRef, useState } from 'react';
import { autoLayout } from '../lib/layout';
import { entityDef } from '../lib/entityTypes';
import { exportJson, exportMarkdown, exportPdf, exportPng, parseImport } from '../lib/exporters';
import { useDict } from '../i18n';
import { useStore } from '../store';
import { timeAgo } from '../lib/format';

export default function Toolbar({ onSearch }: { onSearch: () => void }) {
  const d = useDict();
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
      ? d.toolbar.saving
      : status === 'dirty'
        ? d.toolbar.dirty
        : status === 'error'
          ? d.toolbar.saveError
          : lastSavedAt
            ? d.toolbar.savedAt(timeAgo(lastSavedAt))
            : d.toolbar.ready;

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
      notify(d.toolbar.imported(n.length));
    } catch {
      notify(d.toolbar.importError);
    }
  };

  return (
    <header className="toolbar">
      <div className="toolbar-title">
        <input
          className="title-input"
          value={board.title}
          onChange={(e) => patchBoard({ title: e.target.value })}
          placeholder={d.toolbar.titlePlaceholder}
        />
        <input
          className="target-input"
          value={board.target}
          onChange={(e) => patchBoard({ target: e.target.value })}
          placeholder={d.toolbar.targetPlaceholder}
        />
      </div>

      <div className={`save-status is-${status}`} title={d.toolbar.saveTitle}>
        <span className="dot" />
        {statusText}
      </div>

      <div className="toolbar-actions">
        <button className="btn btn-ghost" onClick={undo} disabled={!past.length} title={d.toolbar.undo}>
          ↶
        </button>
        <button className="btn btn-ghost" onClick={redo} disabled={!future.length} title={d.toolbar.redo}>
          ↷
        </button>
        <span className="sep" />
        <button className="btn btn-ghost" onClick={onSearch} title={d.toolbar.searchTitle}>
          🔍 {d.toolbar.search}
        </button>
        <button className="btn btn-ghost" onClick={arrange} title={d.toolbar.arrangeTitle}>
          ✨ {d.toolbar.arrange}
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => rf.fitView({ padding: 0.15, duration: 400 })}
          title={d.toolbar.fitTitle}
        >
          ⤢ {d.toolbar.fit}
        </button>
        {picked.length === 2 && (
          <button className="btn btn-accent" onClick={() => setMergeAsk(true)}>
            ⧉ {d.toolbar.merge}
          </button>
        )}
        <span className="sep" />
        <div className="menu-wrap">
          <button className="btn btn-ghost" onClick={() => setMenu((v) => !v)}>
            ⇧ {d.toolbar.export}
          </button>
          {menu && (
            <>
              <div className="menu-backdrop" onClick={() => setMenu(false)} />
              <div className="menu menu-right">
                <button
                  onClick={() => {
                    setMenu(false);
                    void exportPng(board, nodes, theme === 'dark', rf.getNodesBounds(nodes));
                  }}
                >
                  {d.toolbar.exportPng}
                </button>
                <button
                  onClick={() => {
                    setMenu(false);
                    exportPdf(board, nodes, edges);
                  }}
                >
                  {d.toolbar.exportPdf}
                </button>
                <button
                  onClick={() => {
                    setMenu(false);
                    exportMarkdown(board, nodes, edges);
                  }}
                >
                  {d.toolbar.exportMd}
                </button>
                <button
                  onClick={() => {
                    setMenu(false);
                    exportJson(board, nodes, edges);
                  }}
                >
                  {d.toolbar.exportJson}
                </button>
                <button
                  onClick={() => {
                    setMenu(false);
                    fileRef.current?.click();
                  }}
                >
                  {d.toolbar.importJson}
                </button>
              </div>
            </>
          )}
        </div>
        <button
          className="btn btn-ghost"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={d.toolbar.themeTitle}
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
            <h3>{d.merge.title}</h3>
            <p className="modal-sub">{d.merge.sub}</p>
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
                    {entityDef(n.data.kind).icon} {n.data.label || d.common.empty}
                  </b>
                  <span>{d.entity[n.data.kind].name}</span>
                </button>
              ))}
            </div>
            <button className="btn btn-ghost" onClick={() => setMergeAsk(false)}>
              {d.common.cancel}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
