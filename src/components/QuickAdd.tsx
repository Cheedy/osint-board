import { useEffect, useMemo, useRef, useState } from 'react';
import { ENTITY_DEFS, entityDef } from '../lib/entityTypes';
import { analyze, normalizeValue } from '../lib/detect';
import type { EntityKind } from '../types';

const LINK_PREF = 'osint-quickadd-link';

type Props = {
  screen: { x: number; y: number };
  /** Le quick add vient d'un fil tire depuis un noeud : le lien est automatique. */
  wire: boolean;
  /** Nom du noeud auquel on peut relier (celui du fil, ou celui selectionne). */
  anchorLabel: string;
  onCreate: (kind: EntityKind, label: string, link: boolean) => void;
  onClose: () => void;
};

export default function QuickAdd({ screen, wire, anchorLabel, onCreate, onClose }: Props) {
  const [text, setText] = useState('');
  const [forced, setForced] = useState<EntityKind | null>(null);
  const [link, setLink] = useState(() => localStorage.getItem(LINK_PREF) === '1');
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const found = useMemo(() => analyze(text), [text]);
  const kind = forced ?? found.kind;
  const canLink = Boolean(anchorLabel) || wire;

  useEffect(() => {
    inputRef.current?.focus();
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [onClose]);

  const toggleLink = () => {
    const next = !link;
    setLink(next);
    localStorage.setItem(LINK_PREF, next ? '1' : '0');
  };

  const create = (k: EntityKind) => {
    onCreate(k, normalizeValue(k, text), link);
    onClose();
  };

  const style: React.CSSProperties = {
    left: Math.min(screen.x, window.innerWidth - 360),
    top: Math.min(screen.y, window.innerHeight - 340),
  };

  return (
    <div className="quickadd" style={style} ref={boxRef}>
      <input
        ref={inputRef}
        className="quickadd-input"
        value={text}
        placeholder="Colle une valeur ou un lien de profil…"
        onChange={(e) => {
          setText(e.target.value);
          setForced(null);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') create(kind);
          if (e.key === 'Escape') onClose();
          e.stopPropagation();
        }}
      />

      <div className="quickadd-hint">
        {text ? (
          <>
            Détecté : <b>{found.fields.plateforme ?? entityDef(kind).name}</b>
            {found.fields.handle ? ` · ${found.fields.handle}` : ''} — Entrée pour créer
          </>
        ) : (
          'Choisis un type, ou colle une valeur et je devine'
        )}
      </div>

      {wire ? (
        <div className="quickadd-link is-on">→ sera relié à « {anchorLabel || 'l’élément d’origine'} »</div>
      ) : (
        canLink && (
          <button className={`quickadd-link ${link ? 'is-on' : ''}`} onClick={toggleLink}>
            <span className="box">{link ? '✓' : ''}</span> relier à « {anchorLabel} »
          </button>
        )
      )}

      <div className="quickadd-grid">
        {ENTITY_DEFS.map((d) => (
          <button
            key={d.kind}
            className={`chip ${d.kind === kind ? 'is-active' : ''}`}
            style={{ '--accent': d.color } as React.CSSProperties}
            onClick={() => create(d.kind)}
            onMouseEnter={() => setForced(d.kind)}
            onMouseLeave={() => setForced(null)}
          >
            <span>{d.icon}</span>
            {d.short ?? d.name}
          </button>
        ))}
      </div>
    </div>
  );
}
