import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';
import { confidenceColor } from '../lib/entityTypes';
import { useDict } from '../i18n';
import { useStore } from '../store';
import type { OsintEdge } from '../types';

export default function RelationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps<OsintEdge>) {
  const select = useStore((s) => s.select);
  const d = useDict();
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const unverified = data?.confidence === 'unverified';
  const color = selected ? 'var(--accent-ui)' : confidenceColor(data?.confidence ?? 'probable');
  const hasText = Boolean(data?.label || data?.method);

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: color,
          strokeWidth: selected ? 2.4 : 1.6,
          strokeDasharray: unverified ? '6 5' : undefined,
          opacity: selected ? 1 : 0.85,
        }}
      />
      {hasText && (
        <EdgeLabelRenderer>
          <div
            className={`edge-label nodrag nopan ${selected ? 'is-selected' : ''}`}
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
            onClick={(e) => {
              e.stopPropagation();
              select(null, id);
            }}
          >
            {data?.label && <span className="edge-text">{data.label}</span>}
            {data?.method && <span className="edge-method">{d.report.via(data.method)}</span>}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
