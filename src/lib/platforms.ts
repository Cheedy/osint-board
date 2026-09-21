/**
 * Reconnaissance des profils de reseaux sociaux a partir d'une URL.
 * Sert a transformer un lien copie (un profil LinkedIn trouve, par exemple)
 * en element correctement type, avec la plateforme et le pseudo deja remplis.
 */

export type UrlParts = { host: string; rest: string };

export function splitUrl(url: string): UrlParts {
  const clean = url
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '');
  const cut = clean.search(/[/?#]/);
  const host = (cut === -1 ? clean : clean.slice(0, cut)).toLowerCase();
  const rest = cut === -1 ? '' : clean.slice(cut);
  return { host, rest };
}

/** Segments du chemin, sans la query string ni les segments vides. */
function segments(rest: string): string[] {
  return rest
    .split(/[?#]/)[0]
    .split('/')
    .filter(Boolean)
    .map((s) => decodeURIComponent(s));
}

/** Premier segment utile : saute les prefixes du type /in/, /user/, /@… */
function seg(rest: string, skip: string[] = []): string {
  const parts = segments(rest);
  if (!parts.length) return '';
  const first = parts[0].toLowerCase();
  const value = skip.includes(first) ? (parts[1] ?? '') : parts[0];
  return value.replace(/^@/, '');
}

function queryParam(rest: string, key: string): string {
  const q = rest.split(/[?#]/)[1];
  if (!q) return '';
  return new URLSearchParams(q).get(key) ?? '';
}

type Platform = {
  name: string;
  host: RegExp;
  handle: (rest: string) => string;
};

const PLATFORMS: Platform[] = [
  {
    name: 'LinkedIn',
    host: /(^|\.)linkedin\.com$/,
    handle: (r) => seg(r, ['in', 'company', 'school', 'pub', 'profile']),
  },
  { name: 'Instagram', host: /(^|\.)instagram\.com$/, handle: (r) => seg(r, ['p', 'reel', 'stories']) },
  { name: 'X / Twitter', host: /(^|\.)(twitter\.com|x\.com)$/, handle: (r) => seg(r, ['i', 'intent']) },
  { name: 'Facebook', host: /(^|\.)(facebook\.com|fb\.com|m\.facebook\.com)$/, handle: (r) => (r.includes('profile.php') ? queryParam(r, 'id') : seg(r, ['people', 'profile.php'])) },
  { name: 'TikTok', host: /(^|\.)tiktok\.com$/, handle: (r) => seg(r) },
  { name: 'Snapchat', host: /(^|\.)snapchat\.com$/, handle: (r) => seg(r, ['add']) },
  { name: 'Telegram', host: /(^|\.)(t\.me|telegram\.me)$/, handle: (r) => seg(r, ['s']) },
  { name: 'Reddit', host: /(^|\.)reddit\.com$/, handle: (r) => seg(r, ['user', 'u']) },
  { name: 'GitHub', host: /(^|\.)github\.com$/, handle: (r) => seg(r) },
  { name: 'GitLab', host: /(^|\.)gitlab\.com$/, handle: (r) => seg(r) },
  { name: 'YouTube', host: /(^|\.)youtube\.com$/, handle: (r) => seg(r, ['channel', 'c', 'user']) },
  { name: 'Twitch', host: /(^|\.)twitch\.tv$/, handle: (r) => seg(r) },
  { name: 'Discord', host: /(^|\.)discord\.(com|gg)$/, handle: (r) => seg(r, ['users', 'invite']) },
  { name: 'Steam', host: /(^|\.)steamcommunity\.com$/, handle: (r) => seg(r, ['id', 'profiles']) },
  { name: 'Pinterest', host: /(^|\.)pinterest\.[a-z.]+$/, handle: (r) => seg(r) },
  { name: 'VK', host: /(^|\.)vk\.com$/, handle: (r) => seg(r) },
  { name: 'Mastodon', host: /(^|\.)(mastodon\.[a-z.]+|piaille\.fr|mamot\.fr)$/, handle: (r) => seg(r) },
  { name: 'Bluesky', host: /(^|\.)bsky\.app$/, handle: (r) => seg(r, ['profile']) },
  { name: 'Threads', host: /(^|\.)threads\.(net|com)$/, handle: (r) => seg(r) },
  { name: 'SoundCloud', host: /(^|\.)soundcloud\.com$/, handle: (r) => seg(r) },
  { name: 'Spotify', host: /(^|\.)(open\.spotify\.com|spotify\.com)$/, handle: (r) => seg(r, ['user', 'artist']) },
  { name: 'Flickr', host: /(^|\.)flickr\.com$/, handle: (r) => seg(r, ['photos', 'people']) },
  { name: 'Medium', host: /(^|\.)medium\.com$/, handle: (r) => seg(r) },
  { name: 'Behance', host: /(^|\.)behance\.net$/, handle: (r) => seg(r) },
  { name: 'Dribbble', host: /(^|\.)dribbble\.com$/, handle: (r) => seg(r) },
  { name: 'Stack Overflow', host: /(^|\.)stackoverflow\.com$/, handle: (r) => segments(r)[2] ?? seg(r, ['users']) },
  { name: 'Keybase', host: /(^|\.)keybase\.io$/, handle: (r) => seg(r) },
  { name: 'OnlyFans', host: /(^|\.)onlyfans\.com$/, handle: (r) => seg(r) },
  { name: 'Strava', host: /(^|\.)strava\.com$/, handle: (r) => seg(r, ['athletes']) },
  { name: 'Malt', host: /(^|\.)malt\.fr$/, handle: (r) => seg(r, ['profile']) },
  { name: 'Leboncoin', host: /(^|\.)leboncoin\.fr$/, handle: (r) => seg(r, ['profil', 'boutique']) },
  { name: 'Doctolib', host: /(^|\.)doctolib\.fr$/, handle: (r) => segments(r).pop() ?? '' },
  { name: 'Viadeo', host: /(^|\.)viadeo\.(com|journaldunet\.com)$/, handle: (r) => seg(r, ['p']) },
  { name: 'Tinder', host: /(^|\.)tinder\.com$/, handle: (r) => seg(r, ['@']) },
  { name: 'Skype', host: /(^|\.)(join\.skype\.com|skype\.com)$/, handle: (r) => seg(r, ['invite']) },
];

export type PlatformHit = { platform: string; handle: string; url: string };

/** Renvoie la plateforme et le pseudo si l'URL est un profil connu. */
export function detectPlatform(url: string): PlatformHit | null {
  const { host, rest } = splitUrl(url);
  if (!host.includes('.')) return null;
  const match = PLATFORMS.find((p) => p.host.test(host));
  if (!match) return null;
  const handle = (match.handle(rest) || '').trim();
  return { platform: match.name, handle, url: url.trim() };
}

export const KNOWN_PLATFORMS = PLATFORMS.map((p) => p.name);
