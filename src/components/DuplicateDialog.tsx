import { useReactFlow } from '@xyflow/react';
import { entityDef } from '../lib/entityTypes';
import { useDict } from '../i18n';
import { useStore } from '../store';

export default function DuplicateDialog() {
  const d = useDict();
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
        <h3>{d.duplicate.title(node.data.label)}</h3>

        {sameBoard.length > 0 ? (
          <>
            <p className="modal-sub">{d.duplicate.sub(sameBoard.length)}</p>
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
                      {d.duplicate.view}
                    </button>
                    <button className="btn btn-accent btn-sm" onClick={() => mergeNodes(h.id, node.id)}>
                      {d.duplicate.mergeInto}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="modal-sub">{d.duplicate.subElsewhere}</p>
        )}

        {otherBoards.length > 0 && (
          <div className="dup-cross">
            <div className="dup-cross-title">{d.duplicate.alsoSeen}</div>
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
            {d.duplicate.keepBoth}
          </button>
        </div>
      </div>
    </div>
  );
}
