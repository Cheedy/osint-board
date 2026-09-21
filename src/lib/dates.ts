const MOIS: Record<string, number> = {
  janvier: 0,
  fevrier: 1,
  février: 1,
  mars: 2,
  avril: 3,
  mai: 4,
  juin: 5,
  juillet: 6,
  aout: 7,
  août: 7,
  septembre: 8,
  octobre: 9,
  novembre: 10,
  decembre: 11,
  décembre: 11,
};

const JJMMAAAA = /^([0-3]?\d)[/.\- ]([0-1]?\d)[/.\- ]((?:19|20)\d{2})$/;
const ISO = /^((?:19|20)\d{2})-([0-1]\d)-([0-3]\d)$/;
const LITTERAL = /^([0-3]?\d)(?:er)?\s+([a-zéèûôA-ZÉÈÛÔ]+)\s+((?:19|20)\d{2})$/;

function build(year: number, month: number, day: number): Date | null {
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  const d = new Date(year, month, day);
  // rejette les dates impossibles genre 31/02
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null;
  if (d.getTime() > Date.now()) return null;
  return d;
}

/** Reconnait une date de naissance ecrite a la francaise, en ISO ou en toutes lettres. */
export function parseDate(text: string): Date | null {
  const t = (text ?? '').trim();
  if (!t) return null;

  const fr = JJMMAAAA.exec(t);
  if (fr) return build(Number(fr[3]), Number(fr[2]) - 1, Number(fr[1]));

  const iso = ISO.exec(t);
  if (iso) return build(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));

  const lit = LITTERAL.exec(t);
  if (lit) {
    const month = MOIS[lit[2].toLowerCase()];
    if (month === undefined) return null;
    return build(Number(lit[3]), month, Number(lit[1]));
  }
  return null;
}

/** Ramene toutes les ecritures a JJ/MM/AAAA. */
export function formatDate(d: Date): string {
  const p2 = (n: number) => String(n).padStart(2, '0');
  return `${p2(d.getDate())}/${p2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Age atteint aujourd'hui, ou null si le texte n'est pas une date. */
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
