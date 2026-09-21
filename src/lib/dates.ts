import { dict } from '../i18n/current';

/** Noms de mois des six langues gérées, pour reconnaître « 7 juin 1993 » ou « 7 June 1993 ». */
const MONTH_NAMES: string[][] = [
  ['janvier', 'january', 'jan', 'enero', 'ene', 'janeiro', 'gennaio', 'gen', 'januar'],
  ['fevrier', 'february', 'feb', 'febrero', 'fevereiro', 'febbraio', 'februar'],
  ['mars', 'march', 'mar', 'marzo', 'marco', 'marz'],
  ['avril', 'april', 'apr', 'abril', 'aprile'],
  ['mai', 'may', 'mayo', 'maio', 'maggio', 'mag'],
  ['juin', 'june', 'jun', 'junio', 'junho', 'giugno', 'giu'],
  ['juillet', 'july', 'jul', 'julio', 'julho', 'luglio', 'lug', 'juli'],
  ['aout', 'august', 'aug', 'agosto', 'ago'],
  ['septembre', 'september', 'sep', 'sept', 'septiembre', 'setembro', 'settembre', 'set'],
  ['octobre', 'october', 'oct', 'octubre', 'outubro', 'ottobre', 'ott', 'oktober', 'okt'],
  ['novembre', 'november', 'nov', 'noviembre', 'novembro'],
  ['decembre', 'december', 'dec', 'diciembre', 'dic', 'dezembro', 'dicembre', 'dezember', 'dez'],
];

/** Sans accents ni casse : « März » et « março » deviennent comparables. */
function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

const MONTH_INDEX = new Map<string, number>();
MONTH_NAMES.forEach((names, i) => names.forEach((n) => MONTH_INDEX.set(fold(n), i)));

const JJMMAAAA = /^([0-3]?\d)[/.\- ]([0-1]?\d)[/.\- ]((?:19|20)\d{2})$/;
const ISO = /^((?:19|20)\d{2})-([0-1]\d)-([0-3]\d)$/;
/** « 7 juin 1993 », « 7th June 1993 », « 7. März 1993 » */
const DAY_FIRST = /^([0-3]?\d)(?:er|st|nd|rd|th|\.)?\s+([^\s\d]+)\.?\s+((?:19|20)\d{2})$/;
/** « June 7, 1993 » */
const MONTH_FIRST = /^([^\s\d]+)\.?\s+([0-3]?\d)(?:st|nd|rd|th)?,?\s+((?:19|20)\d{2})$/;

function build(year: number, month: number, day: number): Date | null {
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  const d = new Date(year, month, day);
  // rejette les dates impossibles genre 31/02
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null;
  if (d.getTime() > Date.now()) return null;
  return d;
}

/** Reconnaît une date de naissance en chiffres, en ISO ou avec le mois en toutes lettres. */
export function parseDate(text: string): Date | null {
  const t = (text ?? '').trim();
  if (!t) return null;

  const numeric = JJMMAAAA.exec(t);
  if (numeric) return build(Number(numeric[3]), Number(numeric[2]) - 1, Number(numeric[1]));

  const iso = ISO.exec(t);
  if (iso) return build(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));

  const dayFirst = DAY_FIRST.exec(t);
  if (dayFirst) {
    const month = MONTH_INDEX.get(fold(dayFirst[2]));
    if (month !== undefined) return build(Number(dayFirst[3]), month, Number(dayFirst[1]));
  }

  const monthFirst = MONTH_FIRST.exec(t);
  if (monthFirst) {
    const month = MONTH_INDEX.get(fold(monthFirst[1]));
    if (month !== undefined) return build(Number(monthFirst[3]), month, Number(monthFirst[2]));
  }
  return null;
}

/** Ramène toutes les écritures à la forme courte de la langue active. */
export function formatDate(d: Date): string {
  return d.toLocaleDateString(dict().locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Âge atteint aujourd'hui, ou null si le texte n'est pas une date. */
export function ageFrom(text: string): number | null {
  const d = parseDate(text);
  if (!d) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const beforeBirthday =
    now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 && age < 130 ? age : null;
}
