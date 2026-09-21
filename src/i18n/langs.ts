/** Fichier sans dépendance : il est importé par le magasin d'état ET par les dictionnaires. */
export type Lang = 'fr' | 'en' | 'es' | 'pt' | 'it' | 'de';

/** Pas de drapeaux : un drapeau designe un pays, pas une langue. */
export const LANGS: { code: Lang; label: string }[] = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'it', label: 'Italiano' },
  { code: 'de', label: 'Deutsch' },
];

export const DEFAULT_LANG: Lang = 'fr';

/** Langue du navigateur si on la gère, sinon le français. */
export function detectLang(): Lang {
  const stored = localStorage.getItem('osint-lang') as Lang | null;
  if (stored && LANGS.some((l) => l.code === stored)) return stored;
  for (const nav of navigator.languages ?? [navigator.language]) {
    const code = nav.slice(0, 2).toLowerCase() as Lang;
    if (LANGS.some((l) => l.code === code)) return code;
  }
  return DEFAULT_LANG;
}
