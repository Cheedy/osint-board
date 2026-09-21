import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import EntityNode from './EntityNode';
import RelationEdge from './RelationEdge';
import QuickAdd from './QuickAdd';
import { entityDef } from '../lib/entityTypes';
import { analyze } from '../lib/detect';
import { api } from '../lib/api';
import { useStore } from '../store';
import type { EntityKind, OsintNode } from '../types';

const nodeTypes = { entity: EntityNode };
const edgeTypes = { relation: RelationEdge };

const defaultEdgeOptions = {
  type: 'relation',
  markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
};

export default function Board() {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const board = useStore((s) => s.board);
  const theme = useStore((s) => s.theme);
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const onNodesChange = useStore((s) => s.onNodesChange);
  const onEdgesChange = useStore((s) => s.onEdgesChange);
  const onConnect = useStore((s) => s.onConnect);
  const addNode = useStore((s) => s.addNode);
  const select = useStore((s) => s.select);
  const setViewport = useStore((s) => s.setViewport);
  const checkDuplicate = useStore((s) => s.checkDuplicate);
  const notify = useStore((s) => s.notify);

  const rf = useReactFlow();
  const wrapper = useRef<HTMLDivElement>(null);
  const [quick, setQuick] = useState<{
    screen: { x: number; y: number };
    flow: { x: number; y: number };
    /** Si le quick add vient d'un fil tire depuis un noeud, on relie automatiquement. */
    linkFrom?: { nodeId: string; handleId: string | null };
  } | null>(null);

  /* Etat du fil en cours de tirage, pour rattraper les laches imprecis. */
  const dragFrom = useRef<{ nodeId: string; handleId: string | null } | null>(null);
  const connected = useRef(false);

  /* Reouvre le plan exactement ou on l'avait laisse. */
  useEffect(() => {
    if (board) rf.setViewport(board.viewport, { duration: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board?.id]);

  const centerOfCanvas = useCallback(() => {
    const rect = wrapper.current?.getBoundingClientRect();
    const x = (rect?.left ?? 0) + (rect?.width ?? 800) / 2 + (Math.random() * 80 - 40);
    const y = (rect?.top ?? 0) + (rect?.height ?? 600) / 2 + (Math.random() * 80 - 40);
    return rf.screenToFlowPosition({ x, y });
  }, [rf]);

  /** Pose le nouvel element a droite de celui dont il decoule, sous ses freres. */
  const placeNear = useCallback((anchor: OsintNode, offset = 0) => {
    const state = useStore.getState();
    const children = state.edges.filter((e) => e.source === anchor.id).length;
    return {
      x: anchor.position.x + 330,
      y: anchor.position.y + (children + offset) * 132,
    };
  }, []);

  /**
   * Transforme une trouvaille (URL de profil, email, numero...) en element sur le plan,
   * relie au noeud selectionne quand il y en a un.
   */
  const addFinding = useCallback(
    (text: string, opts: { link: boolean; offset?: number; at?: { x: number; y: number } }) => {
      const found = analyze(text);
      const state = useStore.getState();
      const anchor = opts.link ? (state.nodes.find((n) => n.id === state.selectedNodeId) ?? null) : null;
      const position = opts.at ?? (anchor ? placeNear(anchor, opts.offset ?? 0) : centerOfCanvas());

      const id = addNode(found.kind, position, found.label, {
        fields: found.fields,
        source: found.source,
      });
      if (anchor) {
        onConnect({ source: anchor.id, target: id, sourceHandle: 'right', targetHandle: 'left' });
        select(anchor.id, null);
      }
      return { id, found, anchor };
    },
    [addNode, onConnect, select, placeNear, centerOfCanvas]
  );

  /* Coller : une image devient une capture, un texte devient le bon type d'element. */
  useEffect(() => {
    const onPaste = async (e: ClipboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /input|textarea/i.test(el.tagName)) return;
      if (!board) return;

      const file = Array.from(e.clipboardData?.items ?? [])
        .find((i) => i.type.startsWith('image/'))
        ?.getAsFile();

      if (file) {
        e.preventDefault();
        const dataUrl = await new Promise<string>((res) => {
          const reader = new FileReader();
          reader.onload = () => res(String(reader.result));
          reader.readAsDataURL(file);
        });
        try {
          const up = await api.upload(board.id, dataUrl, file.name || 'capture.png');
          const state = useStore.getState();
          const anchor = state.nodes.find((n) => n.id === state.selectedNodeId) ?? null;
          const id = addNode('photo', anchor ? placeNear(anchor) : centerOfCanvas(), 'Capture', {
            attachment: up.url,
          });
          if (anchor) {
            onConnect({ source: anchor.id, target: id, sourceHandle: 'right', targetHandle: 'left' });
            select(anchor.id, null);
            notify(`Capture ajoutée et reliée à « ${anchor.data.label || 'l’élément sélectionné'} »`);
          } else {
            notify('Capture ajoutée au plan');
          }
        } catch {
          notify('Impossible d’enregistrer la capture');
        }
        return;
      }

      const text = e.clipboardData?.getData('text/plain')?.trim();
      if (!text) return;
      e.preventDefault();

      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      const anchorLabel = useStore.getState().nodes.find((n) => n.id === useStore.getState().selectedNodeId)?.data
        .label;

      if (lines.length > 1 && lines.length <= 25) {
        lines.forEach((line, i) => addFinding(line, { link: true, offset: i }));
        notify(
          anchorLabel
            ? `${lines.length} éléments ajoutés et reliés à « ${anchorLabel} »`
            : `${lines.length} éléments ajoutés`
        );
        return;
      }

      const { id, found, anchor } = addFinding(text, { link: true });
      if (anchor) {
        const what = found.fields.plateforme ? `${found.fields.plateforme}` : entityDef(found.kind).name;
        notify(`${what} relié à « ${anchor.data.label || 'l’élément sélectionné'} »`);
      }
      void checkDuplicate(id);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [board, addNode, addFinding, placeNear, centerOfCanvas, checkDuplicate, notify, onConnect, select]);

  const onDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains('react-flow__pane')) return;
    setQuick({
      screen: { x: e.clientX, y: e.clientY },
      flow: rf.screenToFlowPosition({ x: e.clientX, y: e.clientY }),
    });
  };

  /**
   * Lacher un fil n'importe ou sur le noeud cible le relie (pas besoin de viser le point),
   * et le lacher dans le vide propose directement de creer l'element suivant, deja relie.
   */
  const onConnectEnd = (event: MouseEvent | TouchEvent) => {
    const from = dragFrom.current;
    dragFrom.current = null;
    if (!from || connected.current) return;

    const pt = 'changedTouches' in event ? event.changedTouches[0] : (event as MouseEvent);
    if (!pt) return;
    const el = document.elementFromPoint(pt.clientX, pt.clientY) as HTMLElement | null;
    const nodeEl = el?.closest('.react-flow__node') as HTMLElement | null;
    const targetId = nodeEl?.dataset.id;

    if (targetId && targetId !== from.nodeId) {
      onConnect({ source: from.nodeId, target: targetId, sourceHandle: from.handleId, targetHandle: null });
      return;
    }
    if (!targetId && el?.classList.contains('react-flow__pane')) {
      setQuick({
        screen: { x: pt.clientX, y: pt.clientY },
        flow: rf.screenToFlowPosition({ x: pt.clientX, y: pt.clientY }),
        linkFrom: from,
      });
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const kind = e.dataTransfer.getData('application/osint-kind') as EntityKind;
    if (!kind) return;
    const position = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY });
    addNode(kind, position);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  return (
    <div className="canvas" ref={wrapper} onDoubleClick={onDoubleClick} onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={(c) => {
          connected.current = true;
          onConnect(c);
        }}
        onConnectStart={(_, { nodeId, handleId }) => {
          connected.current = false;
          dragFrom.current = nodeId ? { nodeId, handleId } : null;
        }}
        onConnectEnd={onConnectEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        connectionRadius={60}
        /* le double-clic sert a creer un element, pas a zoomer */
        zoomOnDoubleClick={false}
        deleteKeyCode={['Delete']}
        multiSelectionKeyCode={['Shift', 'Control']}
        onNodeClick={(_, n) => select(n.id)}
        onEdgeClick={(_, e) => select(null, e.id)}
        onPaneClick={() => select(null, null)}
        onMoveEnd={(_, vp) => setViewport(vp)}
        minZoom={0.1}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        colorMode={theme}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.4} />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => {
            const data = (n as OsintNode).data;
            return data?.color || entityDef(data?.kind ?? 'note').color;
          }}
          maskColor="rgba(0,0,0,.35)"
        />
      </ReactFlow>

      {quick && (
        <QuickAdd
          screen={quick.screen}
          wire={Boolean(quick.linkFrom)}
          anchorLabel={
            quick.linkFrom
              ? (nodes.find((n) => n.id === quick.linkFrom!.nodeId)?.data.label ?? '')
              : (selectedNode?.data.label ?? '')
          }
          onClose={() => setQuick(null)}
          onCreate={(kind, label, link) => {
            const found = analyze(label);
            const useAnalysis = found.kind === kind;
            const id = addNode(kind, quick.flow, label, {
              fields: useAnalysis ? found.fields : {},
              source: useAnalysis ? found.source : '',
            });
            const from = quick.linkFrom ?? (link && selectedNode ? { nodeId: selectedNode.id, handleId: 'right' } : null);
            if (from) {
              onConnect({ source: from.nodeId, target: id, sourceHandle: from.handleId, targetHandle: 'left' });
            }
            select(id, null);
            if (label) void checkDuplicate(id);
          }}
        />
      )}

      {nodes.length === 0 && (
        <div className="canvas-empty">
          <h2>Plan vide</h2>
          <p>
            <b>Double-clic</b> n’importe où pour créer un élément · <b>Ctrl+V</b> pour coller une valeur, un lien de
            profil ou une capture · ou glisse un type depuis la palette de droite.
          </p>
        </div>
      )}
    </div>
  );
}
