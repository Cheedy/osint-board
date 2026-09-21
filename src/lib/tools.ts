import type { EntityKind, Tool } from '../types';

/**
 * Catalogue d'outils OSINT. {{value}} est remplace par la valeur du noeud selectionne.
 * `url` = s'ouvre dans le navigateur, `cmd` = commande copiee dans le presse-papier.
 * Aucun appel reseau n'est fait par l'application : c'est toi qui cliques.
 */
export const TOOLS: Tool[] = [
  /* ------------------------------------------------------------- moteurs */
  { id: 'google', name: 'Google', category: 'engines', url: 'https://www.google.com/search?q={{value}}', types: ['*'] },
  { id: 'google-exact', name: 'Google', variant: 'exactPhrase', category: 'engines', url: 'https://www.google.com/search?q=%22{{value}}%22', types: ['*'] },
  { id: 'google-files', name: 'Google', variant: 'documents', category: 'engines', url: 'https://www.google.com/search?q=%22{{value}}%22+(filetype%3Apdf+OR+filetype%3Adoc+OR+filetype%3Axls)', types: ['*'] },
  { id: 'bing', name: 'Bing', category: 'engines', url: 'https://www.bing.com/search?q={{value}}', types: ['*'] },
  { id: 'ddg', name: 'DuckDuckGo', category: 'engines', url: 'https://duckduckgo.com/?q={{value}}', types: ['*'] },
  { id: 'yandex', name: 'Yandex', category: 'engines', url: 'https://yandex.com/search/?text={{value}}', types: ['*'] },
  { id: 'startpage', name: 'Startpage', category: 'engines', url: 'https://www.startpage.com/sp/search?query={{value}}', types: ['*'] },
  { id: 'wayback', name: 'Wayback Machine', category: 'engines', url: 'https://web.archive.org/web/*/{{value}}', types: ['*'] },

  /* -------------------------------------------------------------- pseudo */
  { id: 'whatsmyname', name: 'WhatsMyName', category: 'username', url: 'https://whatsmyname.app/?q={{value}}', types: ['username', 'person'] },
  { id: 'instantusername', name: 'Instant Username', category: 'username', url: 'https://instantusername.com/#/{{value}}', types: ['username'] },
  { id: 'namechk', name: 'Namechk', category: 'username', url: 'https://namechk.com/', types: ['username'], hint: 'pasteHandle' },
  { id: 'sherlock', name: 'Sherlock', variant: 'cli', category: 'username', cmd: 'sherlock {{value}}', types: ['username'] },
  { id: 'maigret', name: 'Maigret', variant: 'cli', category: 'username', cmd: 'maigret {{value}}', types: ['username'] },

  /* --------------------------------------------------------------- email */
  { id: 'epieos', name: 'Epieos', category: 'email', url: 'https://epieos.com/?q={{value}}', types: ['email', 'phone'] },
  { id: 'holehe', name: 'Holehe', variant: 'cli', category: 'email', cmd: 'holehe {{value}}', types: ['email'] },
  { id: 'hibp', name: 'Have I Been Pwned', category: 'email', url: 'https://haveibeenpwned.com/account/{{value}}', types: ['email'] },
  { id: 'hunter', name: 'Hunter', variant: 'emailCheck', category: 'email', url: 'https://hunter.io/email-verifier/{{value}}', types: ['email'] },
  { id: 'emailrep', name: 'EmailRep', category: 'email', url: 'https://emailrep.io/{{value}}', types: ['email'] },
  { id: 'gravatar', name: 'Gravatar', category: 'email', url: 'https://fr.gravatar.com/site/check/{{value}}', types: ['email'] },
  { id: 'hunter-domain', name: 'Hunter', variant: 'domainEmails', category: 'email', url: 'https://hunter.io/search/{{value}}', types: ['domain', 'org'] },

  /* ----------------------------------------------------------- téléphone */
  { id: 'pagesjaunes-inv', name: 'PagesJaunes', variant: 'reverseDirectory', category: 'phone', url: 'https://www.pagesjaunes.fr/annuaireinverse/recherche?quoiqui={{value}}', types: ['phone'] },
  { id: 'annuaire-118712', name: '118712', variant: 'reverseDirectory', category: 'phone', url: 'https://www.118712.fr/annuaire-inverse/{{value}}', types: ['phone'] },
  { id: 'numlookup', name: 'NumLookup', category: 'phone', url: 'https://www.numlookup.com/?number={{value}}', types: ['phone'] },
  { id: 'truecaller', name: 'Truecaller', category: 'phone', url: 'https://www.truecaller.com/search/fr/{{value}}', types: ['phone'] },
  { id: 'phoneinfoga', name: 'PhoneInfoga', variant: 'cli', category: 'phone', cmd: 'phoneinfoga scan -n {{value}}', types: ['phone'] },

  /* ------------------------------------------------------ réseaux sociaux */
  { id: 'instagram', name: 'Instagram', category: 'social', url: 'https://www.instagram.com/{{value}}/', types: ['username', 'social'] },
  { id: 'x', name: 'X / Twitter', category: 'social', url: 'https://x.com/{{value}}', types: ['username', 'social'] },
  { id: 'tiktok', name: 'TikTok', category: 'social', url: 'https://www.tiktok.com/@{{value}}', types: ['username', 'social'] },
  { id: 'facebook', name: 'Facebook', category: 'social', url: 'https://www.facebook.com/{{value}}', types: ['username', 'social'] },
  { id: 'fb-search', name: 'Facebook', variant: 'searchIn', category: 'social', url: 'https://www.facebook.com/search/top?q={{value}}', types: ['person', 'username'] },
  { id: 'linkedin', name: 'LinkedIn', variant: 'searchIn', category: 'social', url: 'https://www.linkedin.com/search/results/all/?keywords={{value}}', types: ['person', 'org', 'username'] },
  { id: 'linkedin-dork', name: 'LinkedIn', variant: 'viaGoogle', category: 'social', url: 'https://www.google.com/search?q=site%3Alinkedin.com%2Fin+%22{{value}}%22', types: ['person', 'org'] },
  { id: 'github', name: 'GitHub', category: 'social', url: 'https://github.com/{{value}}', types: ['username'] },
  { id: 'reddit', name: 'Reddit', category: 'social', url: 'https://www.reddit.com/user/{{value}}', types: ['username'] },
  { id: 'snapchat', name: 'Snapchat', category: 'social', url: 'https://www.snapchat.com/add/{{value}}', types: ['username'] },
  { id: 'telegram', name: 'Telegram', category: 'social', url: 'https://t.me/{{value}}', types: ['username'] },
  { id: 'youtube', name: 'YouTube', category: 'social', url: 'https://www.youtube.com/@{{value}}', types: ['username'] },
  { id: 'twitch', name: 'Twitch', category: 'social', url: 'https://www.twitch.tv/{{value}}', types: ['username'] },
  { id: 'steam', name: 'Steam', category: 'social', url: 'https://steamcommunity.com/id/{{value}}', types: ['username'] },

  /* --------------------------------------------------------------- image */
  { id: 'lens', name: 'Google Lens', variant: 'byUrl', category: 'image', url: 'https://lens.google.com/uploadbyurl?url={{value}}', types: ['photo', 'domain'] },
  { id: 'yandex-img', name: 'Yandex Images', variant: 'byUrl', category: 'image', url: 'https://yandex.com/images/search?rpt=imageview&url={{value}}', types: ['photo', 'domain'] },
  { id: 'tineye', name: 'TinEye', category: 'image', url: 'https://tineye.com/search?url={{value}}', types: ['photo', 'domain'] },
  { id: 'pimeyes', name: 'PimEyes', variant: 'faces', category: 'image', url: 'https://pimeyes.com/en', types: ['photo', 'person'], hint: 'uploadPhoto' },
  { id: 'fotoforensics', name: 'FotoForensics', category: 'image', url: 'https://fotoforensics.com/', types: ['photo'], hint: 'upload' },
  { id: 'exiftool', name: 'ExifTool', variant: 'cli', category: 'image', cmd: 'exiftool "{{value}}"', types: ['photo', 'document'] },

  /* ------------------------------------------------------- domaine / infra */
  { id: 'whois', name: 'Whois (ViewDNS)', category: 'infra', url: 'https://viewdns.info/whois/?domain={{value}}', types: ['domain'] },
  { id: 'crtsh', name: 'crt.sh', variant: 'certificates', category: 'infra', url: 'https://crt.sh/?q={{value}}', types: ['domain'] },
  { id: 'urlscan', name: 'urlscan.io', category: 'infra', url: 'https://urlscan.io/domain/{{value}}', types: ['domain'] },
  { id: 'securitytrails', name: 'SecurityTrails', category: 'infra', url: 'https://securitytrails.com/domain/{{value}}/dns', types: ['domain'] },
  { id: 'dnsdumpster', name: 'DNSDumpster', category: 'infra', url: 'https://dnsdumpster.com/', types: ['domain'] },
  { id: 'builtwith', name: 'BuiltWith', category: 'infra', url: 'https://builtwith.com/{{value}}', types: ['domain'] },
  { id: 'shodan', name: 'Shodan', category: 'infra', url: 'https://www.shodan.io/search?query={{value}}', types: ['domain', 'ip'] },
  { id: 'censys', name: 'Censys', category: 'infra', url: 'https://search.censys.io/search?resource=hosts&q={{value}}', types: ['domain', 'ip'] },
  { id: 'ipinfo', name: 'IPinfo', category: 'infra', url: 'https://ipinfo.io/{{value}}', types: ['ip'] },
  { id: 'abuseipdb', name: 'AbuseIPDB', category: 'infra', url: 'https://www.abuseipdb.com/check/{{value}}', types: ['ip'] },

  /* ----------------------------------------------------------- fuites */
  { id: 'intelx', name: 'Intelligence X', category: 'leaks', url: 'https://intelx.io/?s={{value}}', types: ['email', 'username', 'phone', 'domain', 'person'] },
  { id: 'dehashed', name: 'Dehashed', category: 'leaks', url: 'https://dehashed.com/search?query={{value}}', types: ['email', 'username', 'phone'] },
  { id: 'leakcheck', name: 'LeakCheck', category: 'leaks', url: 'https://leakcheck.io/', types: ['email', 'username'] },
  { id: 'psbdmp', name: 'Psbdmp', variant: 'pastes', category: 'leaks', url: 'https://psbdmp.ws/api/search/{{value}}', types: ['email', 'username'] },

  /* ----------------------------------------------------------- géo */
  { id: 'gmaps', name: 'Google Maps', category: 'geo', url: 'https://www.google.com/maps/search/{{value}}', types: ['place', 'org'] },
  { id: 'geoportail', name: 'Géoportail', variant: 'franceOnly', category: 'geo', url: 'https://www.geoportail.gouv.fr/carte', types: ['place'] },
  { id: 'mapillary', name: 'Mapillary', category: 'geo', url: 'https://www.mapillary.com/app/', types: ['place'] },
  { id: 'suncalc', name: 'SunCalc', variant: 'shadows', category: 'geo', url: 'https://www.suncalc.org/', types: ['place', 'photo'] },
  { id: 'overpass', name: 'Overpass Turbo', category: 'geo', url: 'https://overpass-turbo.eu/', types: ['place'] },

  /* ----------------------------------------------------------- France */
  { id: 'annuaire-entreprises', name: 'annuaire-entreprises.gouv', variant: 'companyRegistry', category: 'france', url: 'https://annuaire-entreprises.data.gouv.fr/rechercher?terme={{value}}', types: ['person', 'org'] },
  { id: 'pappers', name: 'Pappers', category: 'france', url: 'https://www.pappers.fr/recherche?q={{value}}', types: ['person', 'org'] },
  { id: 'societe', name: 'Societe.com', category: 'france', url: 'https://www.societe.com/cgi-bin/search?champs={{value}}', types: ['person', 'org'] },
  { id: 'bodacc', name: 'BODACC', category: 'france', url: 'https://www.bodacc.fr/pages/annonces-commerciales/?q={{value}}', types: ['person', 'org'] },
  { id: 'matchid', name: 'matchID', variant: 'deathRecords', category: 'france', url: 'https://deces.matchid.io/search?fullText={{value}}', types: ['person', 'birth'] },
  { id: 'geneanet', name: 'Geneanet', category: 'france', url: 'https://www.geneanet.org/fonds/individus/?go=1&nom={{value}}', types: ['person', 'birth'] },
  { id: 'filae', name: 'Filae', variant: 'civilRecords', category: 'france', url: 'https://www.filae.com/recherche-genealogique/?lastname={{value}}', types: ['person', 'birth'] },
  { id: 'familysearch', name: 'FamilySearch', category: 'france', url: 'https://www.familysearch.org/search/record/results?q.text={{value}}', types: ['person', 'birth'] },
  { id: 'pagesblanches', name: 'PagesBlanches', category: 'france', url: 'https://www.pagesjaunes.fr/pagesblanches/recherche?quoiqui={{value}}', types: ['person', 'phone'] },
  { id: 'journal-officiel', name: 'Journal Officiel', variant: 'associations', category: 'france', url: 'https://www.journal-officiel.gouv.fr/pages/associations-recherche/?q={{value}}', types: ['person', 'org'] },
  { id: 'cadastre', name: 'Cadastre', category: 'france', url: 'https://cadastre.data.gouv.fr/map', types: ['place'] },
];

/** Ordre d'affichage des categories dans la colonne de droite. */
export const TOOL_CATEGORIES = [
  'engines',
  'username',
  'email',
  'phone',
  'social',
  'image',
  'infra',
  'leaks',
  'geo',
  'france',
  'custom',
] as const;

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
