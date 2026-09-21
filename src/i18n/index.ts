import { useStore } from '../store';
import { DICTS, dict, applyLang, currentLang, type Dict } from './current';
import { detectLang, LANGS, type Lang } from './langs';
import fr from './fr';

export { DICTS, dict, applyLang, currentLang, detectLang, LANGS };
export type { Dict, Lang };

/** Dictionnaire dans un composant : l'abonnement redessine à chaque changement de langue. */
export function useDict(): Dict {
  const lang = useStore((s) => s.lang);
  return DICTS[lang] ?? fr;
}

export function useLang(): Lang {
  return useStore((s) => s.lang);
}
