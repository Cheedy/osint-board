import { detectPlatform, splitUrl } from './platforms';
import { formatDate, parseDate } from './dates';
import type { EntityKind } from '../types';

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const URLISH = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+([/?#]|$)/i;

const RULES: { kind: EntityKind; test: RegExp }[] = [
  { kind: 'wallet', test: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/ },
  { kind: 'wallet', test: /^0x[a-fA-F0-9]{40}$/ },
  { kind: 'bank', test: /^[A-Z]{2}\d{2}[\sA-Z0-9]{10,30}$/i },
  { kind: 'ip', test: /^(\d{1,3}\.){3}\d{1,3}$/ },
  { kind: 'ip', test: /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i },
  { kind: 'ip', test: /^\d{15}$/ },
  { kind: 'phone', test: /^(\+\d{1,3}[\s.-]?)?(\(?\d{1,4}\)?[\s.-]?){2,5}\d{2,4}$/ },
  { kind: 'username', test: /^@[\w.-]{2,30}$/ },
  { kind: 'vehicle', test: /^[A-Z]{2}-\d{3}-[A-Z]{2}$/i },
  { kind: 'person', test: /^[A-ZÀ-Ý][\wà-ÿ'’-]+( [A-ZÀ-Ý][\wà-ÿ'’-]+){1,3}$/ },
];

export type Analysis = {
  kind: EntityKind;
  label: string;
  fields: Record<string, string>;
  /** URL d'origine, gardee comme source cliquable sur le noeud. */
  source: string;
};

/**
 * Analyse un texte colle et en deduit un element complet.
 * Une URL de profil devient un compte social avec sa plateforme et son pseudo,
 * le reste est type au mieux (email, telephone, domaine, wallet...).
 */
export function analyze(raw: string): Analysis {
  const text = (raw ?? '').trim();
  const empty = { kind: 'note' as EntityKind, label: text, fields: {}, source: '' };
  if (!text) return { ...empty, label: '' };
  if (text.length > 160 || text.includes('\n')) return empty;

  if (EMAIL.test(text)) return { kind: 'email', label: text.toLowerCase(), fields: {}, source: '' };

  if (URLISH.test(text)) {
    const url = /^https?:\/\//i.test(text) ? text : `https://${text}`;
    const hit = detectPlatform(text);
    // sans pseudo dans l'URL, c'est le site lui-meme et pas un profil
    if (hit && hit.handle) {
      return {
        kind: 'social',
        label: hit.handle || splitUrl(text).host,
        fields: { plateforme: hit.platform, handle: hit.handle },
        source: url,
      };
    }
    const { host, rest } = splitUrl(text);
    const hasPath = rest.replace(/^\//, '').length > 0;
    return {
      kind: 'domain',
      label: host,
      fields: hasPath ? { url } : {},
      source: hasPath ? url : '',
    };
  }

  // avant le telephone : 12.03.1988 a la meme tete qu'un numero
  const date = parseDate(text);
  if (date) return { kind: 'birth', label: formatDate(date), fields: {}, source: '' };

  for (const rule of RULES) {
    if (rule.test.test(text)) return { kind: rule.kind, label: text, fields: {}, source: '' };
  }
  if (/^[\w.-]{3,30}$/.test(text)) return { kind: 'username', label: text, fields: {}, source: '' };
  return empty;
}

/** Type devine seul, pour l'affichage du quick add. */
export function guessKind(text: string): EntityKind {
  return analyze(text).kind;
}

/** Nettoie une valeur collee selon le type devine. */
export function normalizeValue(kind: EntityKind, value: string): string {
  const v = value.trim();
  if (kind === 'email') return v.toLowerCase();
  if (kind === 'domain') return v.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  return v;
}
