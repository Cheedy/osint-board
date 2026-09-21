import type { EntityKind, Tool } from '../types';

/**
 * Catalogue d'outils OSINT. {{value}} est remplace par la valeur du noeud selectionne.
 * `url` = s'ouvre dans le navigateur, `cmd` = commande copiee dans le presse-papier.
 * Aucun appel reseau n'est fait par l'application : c'est toi qui cliques.
 */
export const TOOLS: Tool[] = [
  /* ------------------------------------------------------------- moteurs */
  { id: 'google', name: 'Google', category: 'Moteurs', url: 'https://www.google.com/search?q={{value}}', types: ['*'] },
  { id: 'google-exact', name: 'Google — expression exacte', category: 'Moteurs', url: 'https://www.google.com/search?q=%22{{value}}%22', types: ['*'] },
  { id: 'google-files', name: 'Google — documents (pdf/doc/xls)', category: 'Moteurs', url: 'https://www.google.com/search?q=%22{{value}}%22+(filetype%3Apdf+OR+filetype%3Adoc+OR+filetype%3Axls)', types: ['*'] },
  { id: 'bing', name: 'Bing', category: 'Moteurs', url: 'https://www.bing.com/search?q={{value}}', types: ['*'] },
  { id: 'ddg', name: 'DuckDuckGo', category: 'Moteurs', url: 'https://duckduckgo.com/?q={{value}}', types: ['*'] },
  { id: 'yandex', name: 'Yandex', category: 'Moteurs', url: 'https://yandex.com/search/?text={{value}}', types: ['*'] },
  { id: 'startpage', name: 'Startpage', category: 'Moteurs', url: 'https://www.startpage.com/sp/search?query={{value}}', types: ['*'] },
  { id: 'wayback', name: 'Wayback Machine', category: 'Moteurs', url: 'https://web.archive.org/web/*/{{value}}', types: ['*'] },

  /* -------------------------------------------------------------- pseudo */
  { id: 'whatsmyname', name: 'WhatsMyName', category: 'Pseudo', url: 'https://whatsmyname.app/?q={{value}}', types: ['username', 'person'] },
  { id: 'instantusername', name: 'Instant Username', category: 'Pseudo', url: 'https://instantusername.com/#/{{value}}', types: ['username'] },
  { id: 'namechk', name: 'Namechk', category: 'Pseudo', url: 'https://namechk.com/', types: ['username'], hint: 'colle le pseudo dans le champ' },
  { id: 'sherlock', name: 'Sherlock (CLI)', category: 'Pseudo', cmd: 'sherlock {{value}}', types: ['username'] },
  { id: 'maigret', name: 'Maigret (CLI)', category: 'Pseudo', cmd: 'maigret {{value}}', types: ['username'] },

  /* --------------------------------------------------------------- email */
  { id: 'epieos', name: 'Epieos', category: 'Email', url: 'https://epieos.com/?q={{value}}', types: ['email', 'phone'] },
  { id: 'holehe', name: 'Holehe (CLI)', category: 'Email', cmd: 'holehe {{value}}', types: ['email'] },
  { id: 'hibp', name: 'Have I Been Pwned', category: 'Email', url: 'https://haveibeenpwned.com/account/{{value}}', types: ['email'] },
  { id: 'hunter', name: 'Hunter — vérif email', category: 'Email', url: 'https://hunter.io/email-verifier/{{value}}', types: ['email'] },
  { id: 'emailrep', name: 'EmailRep', category: 'Email', url: 'https://emailrep.io/{{value}}', types: ['email'] },
  { id: 'gravatar', name: 'Gravatar', category: 'Email', url: 'https://fr.gravatar.com/site/check/{{value}}', types: ['email'] },
  { id: 'hunter-domain', name: 'Hunter — emails du domaine', category: 'Email', url: 'https://hunter.io/search/{{value}}', types: ['domain', 'org'] },

  /* ----------------------------------------------------------- téléphone */
  { id: 'pagesjaunes-inv', name: 'Annuaire inversé (PagesJaunes)', category: 'Téléphone', url: 'https://www.pagesjaunes.fr/annuaireinverse/recherche?quoiqui={{value}}', types: ['phone'] },
  { id: 'annuaire-118712', name: '118712 — annuaire inversé', category: 'Téléphone', url: 'https://www.118712.fr/annuaire-inverse/{{value}}', types: ['phone'] },
  { id: 'numlookup', name: 'NumLookup', category: 'Téléphone', url: 'https://www.numlookup.com/?number={{value}}', types: ['phone'] },
  { id: 'truecaller', name: 'Truecaller', category: 'Téléphone', url: 'https://www.truecaller.com/search/fr/{{value}}', types: ['phone'] },
  { id: 'phoneinfoga', name: 'PhoneInfoga (CLI)', category: 'Téléphone', cmd: 'phoneinfoga scan -n {{value}}', types: ['phone'] },

  /* ------------------------------------------------------ réseaux sociaux */
  { id: 'instagram', name: 'Instagram', category: 'Réseaux sociaux', url: 'https://www.instagram.com/{{value}}/', types: ['username', 'social'] },
  { id: 'x', name: 'X / Twitter', category: 'Réseaux sociaux', url: 'https://x.com/{{value}}', types: ['username', 'social'] },
  { id: 'tiktok', name: 'TikTok', category: 'Réseaux sociaux', url: 'https://www.tiktok.com/@{{value}}', types: ['username', 'social'] },
  { id: 'facebook', name: 'Facebook', category: 'Réseaux sociaux', url: 'https://www.facebook.com/{{value}}', types: ['username', 'social'] },
  { id: 'fb-search', name: 'Facebook — recherche', category: 'Réseaux sociaux', url: 'https://www.facebook.com/search/top?q={{value}}', types: ['person', 'username'] },
  { id: 'linkedin', name: 'LinkedIn — recherche', category: 'Réseaux sociaux', url: 'https://www.linkedin.com/search/results/all/?keywords={{value}}', types: ['person', 'org', 'username'] },
  { id: 'linkedin-dork', name: 'LinkedIn via Google', category: 'Réseaux sociaux', url: 'https://www.google.com/search?q=site%3Alinkedin.com%2Fin+%22{{value}}%22', types: ['person', 'org'] },
  { id: 'github', name: 'GitHub', category: 'Réseaux sociaux', url: 'https://github.com/{{value}}', types: ['username'] },
  { id: 'reddit', name: 'Reddit', category: 'Réseaux sociaux', url: 'https://www.reddit.com/user/{{value}}', types: ['username'] },
  { id: 'snapchat', name: 'Snapchat', category: 'Réseaux sociaux', url: 'https://www.snapchat.com/add/{{value}}', types: ['username'] },
  { id: 'telegram', name: 'Telegram', category: 'Réseaux sociaux', url: 'https://t.me/{{value}}', types: ['username'] },
  { id: 'youtube', name: 'YouTube', category: 'Réseaux sociaux', url: 'https://www.youtube.com/@{{value}}', types: ['username'] },
  { id: 'twitch', name: 'Twitch', category: 'Réseaux sociaux', url: 'https://www.twitch.tv/{{value}}', types: ['username'] },
  { id: 'steam', name: 'Steam', category: 'Réseaux sociaux', url: 'https://steamcommunity.com/id/{{value}}', types: ['username'] },

  /* --------------------------------------------------------------- image */
  { id: 'lens', name: 'Google Lens (par URL)', category: 'Image', url: 'https://lens.google.com/uploadbyurl?url={{value}}', types: ['photo', 'domain'] },
  { id: 'yandex-img', name: 'Yandex Images (par URL)', category: 'Image', url: 'https://yandex.com/images/search?rpt=imageview&url={{value}}', types: ['photo', 'domain'] },
  { id: 'tineye', name: 'TinEye', category: 'Image', url: 'https://tineye.com/search?url={{value}}', types: ['photo', 'domain'] },
  { id: 'pimeyes', name: 'PimEyes (visages)', category: 'Image', url: 'https://pimeyes.com/en', types: ['photo', 'person'], hint: 'upload manuel de la photo' },
  { id: 'fotoforensics', name: 'FotoForensics', category: 'Image', url: 'https://fotoforensics.com/', types: ['photo'], hint: 'upload manuel' },
  { id: 'exiftool', name: 'ExifTool (CLI)', category: 'Image', cmd: 'exiftool "{{value}}"', types: ['photo', 'document'] },

  /* ------------------------------------------------------- domaine / infra */
  { id: 'whois', name: 'Whois (ViewDNS)', category: 'Domaine & infra', url: 'https://viewdns.info/whois/?domain={{value}}', types: ['domain'] },
  { id: 'crtsh', name: 'crt.sh — certificats', category: 'Domaine & infra', url: 'https://crt.sh/?q={{value}}', types: ['domain'] },
  { id: 'urlscan', name: 'urlscan.io', category: 'Domaine & infra', url: 'https://urlscan.io/domain/{{value}}', types: ['domain'] },
  { id: 'securitytrails', name: 'SecurityTrails', category: 'Domaine & infra', url: 'https://securitytrails.com/domain/{{value}}/dns', types: ['domain'] },
  { id: 'dnsdumpster', name: 'DNSDumpster', category: 'Domaine & infra', url: 'https://dnsdumpster.com/', types: ['domain'] },
  { id: 'builtwith', name: 'BuiltWith', category: 'Domaine & infra', url: 'https://builtwith.com/{{value}}', types: ['domain'] },
  { id: 'shodan', name: 'Shodan', category: 'Domaine & infra', url: 'https://www.shodan.io/search?query={{value}}', types: ['domain', 'ip'] },
  { id: 'censys', name: 'Censys', category: 'Domaine & infra', url: 'https://search.censys.io/search?resource=hosts&q={{value}}', types: ['domain', 'ip'] },
  { id: 'ipinfo', name: 'IPinfo', category: 'Domaine & infra', url: 'https://ipinfo.io/{{value}}', types: ['ip'] },
  { id: 'abuseipdb', name: 'AbuseIPDB', category: 'Domaine & infra', url: 'https://www.abuseipdb.com/check/{{value}}', types: ['ip'] },

  /* ----------------------------------------------------------- fuites */
  { id: 'intelx', name: 'Intelligence X', category: 'Fuites & données', url: 'https://intelx.io/?s={{value}}', types: ['email', 'username', 'phone', 'domain', 'person'] },
  { id: 'dehashed', name: 'Dehashed', category: 'Fuites & données', url: 'https://dehashed.com/search?query={{value}}', types: ['email', 'username', 'phone'] },
  { id: 'leakcheck', name: 'LeakCheck', category: 'Fuites & données', url: 'https://leakcheck.io/', types: ['email', 'username'] },
  { id: 'psbdmp', name: 'Psbdmp — pastes', category: 'Fuites & données', url: 'https://psbdmp.ws/api/search/{{value}}', types: ['email', 'username'] },

  /* ----------------------------------------------------------- géo */
  { id: 'gmaps', name: 'Google Maps', category: 'Géo', url: 'https://www.google.com/maps/search/{{value}}', types: ['place', 'org'] },
  { id: 'geoportail', name: 'Géoportail (FR)', category: 'Géo', url: 'https://www.geoportail.gouv.fr/carte', types: ['place'] },
  { id: 'mapillary', name: 'Mapillary', category: 'Géo', url: 'https://www.mapillary.com/app/', types: ['place'] },
  { id: 'suncalc', name: 'SunCalc (heure via ombres)', category: 'Géo', url: 'https://www.suncalc.org/', types: ['place', 'photo'] },
  { id: 'overpass', name: 'Overpass Turbo', category: 'Géo', url: 'https://overpass-turbo.eu/', types: ['place'] },

  /* ----------------------------------------------------------- France */
  { id: 'annuaire-entreprises', name: 'Annuaire des entreprises', category: 'France', url: 'https://annuaire-entreprises.data.gouv.fr/rechercher?terme={{value}}', types: ['person', 'org'] },
  { id: 'pappers', name: 'Pappers', category: 'France', url: 'https://www.pappers.fr/recherche?q={{value}}', types: ['person', 'org'] },
  { id: 'societe', name: 'Societe.com', category: 'France', url: 'https://www.societe.com/cgi-bin/search?champs={{value}}', types: ['person', 'org'] },
  { id: 'bodacc', name: 'BODACC', category: 'France', url: 'https://www.bodacc.fr/pages/annonces-commerciales/?q={{value}}', types: ['person', 'org'] },
  { id: 'matchid', name: 'Fichier des décès (matchID)', category: 'France', url: 'https://deces.matchid.io/search?fullText={{value}}', types: ['person', 'birth'] },
  { id: 'geneanet', name: 'Geneanet', category: 'France', url: 'https://www.geneanet.org/fonds/individus/?go=1&nom={{value}}', types: ['person', 'birth'] },
  { id: 'filae', name: 'Filae — état civil', category: 'France', url: 'https://www.filae.com/recherche-genealogique/?lastname={{value}}', types: ['person', 'birth'] },
  { id: 'familysearch', name: 'FamilySearch', category: 'France', url: 'https://www.familysearch.org/search/record/results?q.text={{value}}', types: ['person', 'birth'] },
  { id: 'pagesblanches', name: 'PagesBlanches', category: 'France', url: 'https://www.pagesjaunes.fr/pagesblanches/recherche?quoiqui={{value}}', types: ['person', 'phone'] },
  { id: 'journal-officiel', name: 'Journal Officiel — assos', category: 'France', url: 'https://www.journal-officiel.gouv.fr/pages/associations-recherche/?q={{value}}', types: ['person', 'org'] },
  { id: 'cadastre', name: 'Cadastre', category: 'France', url: 'https://cadastre.data.gouv.fr/map', types: ['place'] },
];

export const TOOL_CATEGORIES = [
  'Moteurs',
  'Pseudo',
  'Email',
  'Téléphone',
  'Réseaux sociaux',
  'Image',
  'Domaine & infra',
  'Fuites & données',
  'Géo',
  'France',
  'Perso',
];

/** Remplace {{value}} par la valeur du noeud, encodee pour une URL. */
export function fillUrl(template: string, value: string): string {
  const v = value ?? '';
  return template
    .replaceAll('{{value}}', encodeURIComponent(v))
    .replaceAll('{{raw}}', v)
    .replaceAll('{{handle}}', encodeURIComponent(v.replace(/^@/, '')));
}

export function fillCmd(template: string, value: string): string {
  return template.replaceAll('{{value}}', value ?? '').replaceAll('{{raw}}', value ?? '');
}

export function toolMatches(tool: Tool, kind: EntityKind | null): boolean {
  if (!kind) return true;
  if (!tool.types || tool.types.length === 0) return true;
  return tool.types.includes('*') || tool.types.includes(kind);
}
