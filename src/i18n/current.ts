import { DEFAULT_LANG, type Lang } from './langs';
import fr, { type Dict } from './fr';
import en from './en';
import es from './es';
import pt from './pt';
import it from './it';
import de from './de';

export type { Dict };

export const DICTS: Record<Lang, Dict> = { fr, en, es, pt, it, de };

/**
 * Langue courante, tenue à jour par le magasin d'état.
 * Ce module n'importe pas le magasin : c'est ce qui évite un cycle d'imports.
 */
let current: Lang = DEFAULT_LANG;

export function applyLang(lang: Lang) {
  current = lang;
  if (typeof document !== 'undefined') document.documentElement.lang = lang;
}

/** Dictionnaire hors composant (export, mise en forme des dates…). */
export function dict(): Dict {
  return DICTS[current] ?? fr;
}

export function currentLang(): Lang {
  return current;
}
