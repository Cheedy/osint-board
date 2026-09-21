import { useReactFlow } from '@xyflow/react';
import { entityDef } from '../lib/entityTypes';
import { useStore } from '../store';

export default function DuplicateDialog() {
  const dup = useStore((s) => s.duplicate);
  const dismiss = useStore((s) => s.dismissDuplicate);
  const mergeNodes = useStore((s) => s.mergeNodes);
  const select = useStore((s) => s.select);
  const openBoard = useStore((s) => s.openBoard);
  const nodes = useStore((s) => s.nodes);
  const rf = useReactFlow();
  if (!dup) return null;

  const { node, sameBoard, otherBoards } = dup;

  return (
    <div className="modal-backdrop" onClick={dismiss}>
      <div className="modal modal-dup" onClick={(e) => e.stopPropagation()}>
        <h3>
          ⚠ « {node.data.label} » existe déjà
        </h3>

        {sameBoard.length > 0 ? (
          <>
            <p className="modal-sub">
              Déjà présent {sameBoard.length} fois dans cette enquête. Tu veux en faire quoi ?
            </p>
            <div className="dup-list">
              {sameBoard.map((h) => (
                <div key={h.id} className="dup-row">
                  <span className="dup-label">
                    {entityDef(h.kind).icon} {h.label}
                  </span>
                  <div className="dup-actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        const target = nodes.find((n) => n.id === h.id);
                        if (target) rf.setCenter(target.position.x + 110, target.position.y + 50, { zoom: 1.2, duration: 400 });
                        select(h.id, null);
                        dismiss();
                      }}
                    >
                      Voir
                    </button>
                    <button className="btn btn-accent btn-sm" onClick={() => mergeNodes(h.id, node.id)}>
                      Fusionner dedans
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="modal-sub">Rien en double ici, mais cette valeur apparaît ailleurs :</p>
        )}

        {otherBoards.length > 0 && (
          <div className="dup-cross">
            <div className="dup-cross-title">Aussi vu dans :</div>
            {otherBoards.map((h) => (
              <button
                key={h.id}
                className="dup-cross-row"
                onClick={() => {
                  void openBoard(h.boardId).then(() => select(h.id, null));
                  dismiss();
                }}
              >
                {entityDef(h.kind).icon} {h.label} — <b>{h.boardTitle}</b>
              </button>
            ))}
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={dismiss}>
            Garder séparé
          </button>
        </div>
      </div>
    </div>
  );
}
