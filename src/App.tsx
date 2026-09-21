import { ReactFlowProvider } from '@xyflow/react';
import { useEffect, useState } from 'react';
import Board from './components/Board';
import DuplicateDialog from './components/DuplicateDialog';
import Inspector from './components/Inspector';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import SearchPalette from './components/SearchPalette';
import Toolbar from './components/Toolbar';
import { useDict } from './i18n';
import { dict } from './i18n/current';
import { useStore } from './store';
import LanguagePicker from './components/LanguagePicker';

export default function App() {
  const d = useDict();
  const init = useStore((s) => s.init);
  const board = useStore((s) => s.board);
  const toast = useStore((s) => s.toast);
  const newBoard = useStore((s) => s.newBoard);
  const select = useStore((s) => s.select);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const makeSnapshot = useStore((s) => s.makeSnapshot);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = el && /input|textarea|select/i.test(el.tagName);
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setSearching(true);
      } else if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void makeSnapshot(dict().history.manualPoint);
      } else if (mod && !e.shiftKey && e.key.toLowerCase() === 'z' && !typing) {
        e.preventDefault();
        undo();
      } else if (mod && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z')) && !typing) {
        e.preventDefault();
        redo();
      } else if (e.key === 'Escape') {
        setSearching(false);
        select(null, null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo, select, makeSnapshot]);

  // La sauvegarde en attente part avant la fermeture de l'onglet.
  useEffect(() => {
    const onLeave = () => {
      if (useStore.getState().status === 'dirty') void useStore.getState().save();
    };
    window.addEventListener('beforeunload', onLeave);
    return () => window.removeEventListener('beforeunload', onLeave);
  }, []);

  return (
    <ReactFlowProvider>
      <div className="app">
        <LeftSidebar />
        <main className="main">
          {board ? (
            <>
              <Toolbar onSearch={() => setSearching(true)} />
              <div className="work">
                <Board />
                <Inspector />
              </div>
            </>
          ) : (
            <div className="welcome">
              <div className="welcome-card">
                <h1>🕸️ {d.welcome.title}</h1>
                <p>{d.welcome.text}</p>
                <button className="btn btn-primary" onClick={() => void newBoard()}>
                  {d.welcome.cta}
                </button>
                <div className="welcome-lang">
                  <LanguagePicker />
                </div>
              </div>
            </div>
          )}
        </main>
        <RightSidebar />

        {searching && <SearchPalette onClose={() => setSearching(false)} />}
        <DuplicateDialog />
        {toast && <div className="toast">{toast}</div>}
      </div>
    </ReactFlowProvider>
  );
}
