import { LANGS, useLang } from '../i18n';
import { useDict } from '../i18n';
import { useStore } from '../store';
import type { Lang } from '../i18n';

/** Sélecteur de langue, toujours accessible en bas de la colonne de gauche. */
export default function LanguagePicker() {
  const d = useDict();
  const lang = useLang();
  const setLang = useStore((s) => s.setLang);
  const active = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <label className="lang-picker" title={d.toolbar.langTitle}>
      <span className="lang-code">{active.code.toUpperCase()}</span>
      <span className="lang-label">{active.label}</span>
      <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} aria-label={d.toolbar.langTitle}>
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
      <span className="lang-caret">▾</span>
    </label>
  );
}
