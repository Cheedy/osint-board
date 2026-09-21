import type { Confidence, EntityKind } from '../types';

export type FieldDef = { key: string; label: string; placeholder?: string };

export type EntityDef = {
  kind: EntityKind;
  name: string;
  /** Libelle court pour la palette et les puces, quand `name` est trop long. */
  short?: string;
  icon: string;
  color: string;
  /** Nom du champ principal affiche en gros sur le noeud. */
  valueLabel: string;
  placeholder: string;
  fields: FieldDef[];
};

export const ENTITY_DEFS: EntityDef[] = [
  {
    kind: 'person',
    name: 'Personne',
    icon: '👤',
    color: '#5b9cff',
    valueLabel: 'Nom complet',
    placeholder: 'Jean Dupont',
    fields: [
      { key: 'alias', label: 'Alias / surnom' },
      { key: 'naissance', label: 'Date de naissance', placeholder: '12/03/1988' },
      { key: 'ville', label: 'Ville' },
      { key: 'metier', label: 'Métier / poste' },
      { key: 'employeur', label: 'Employeur' },
    ],
  },
  {
    kind: 'birth',
    name: 'Date de naissance',
    short: 'Naissance',
    icon: '🎂',
    color: '#b3a4ff',
    valueLabel: 'Date de naissance',
    placeholder: '12/03/1988',
    fields: [
      { key: 'lieu', label: 'Lieu de naissance' },
      { key: 'precision', label: 'Précision', placeholder: 'exacte / année seule / estimée' },
      { key: 'registre', label: 'Registre / acte' },
    ],
  },
  {
    kind: 'username',
    name: 'Pseudo',
    icon: '@',
    color: '#c08bff',
    valueLabel: 'Pseudo',
    placeholder: 'jdupont92',
    fields: [
      { key: 'plateformes', label: 'Plateformes trouvées' },
      { key: 'variantes', label: 'Variantes testées' },
    ],
  },
  {
    kind: 'email',
    name: 'Email',
    icon: '✉️',
    color: '#4fd1a5',
    valueLabel: 'Adresse email',
    placeholder: 'jean.dupont@gmail.com',
    fields: [
      { key: 'fournisseur', label: 'Fournisseur' },
      { key: 'fuites', label: 'Fuites / breaches' },
      { key: 'services', label: 'Services liés' },
    ],
  },
  {
    kind: 'phone',
    name: 'Téléphone',
    icon: '☎️',
    color: '#ffb454',
    valueLabel: 'Numéro',
    placeholder: '+33 6 12 34 56 78',
    fields: [
      { key: 'operateur', label: 'Opérateur' },
      { key: 'pays', label: 'Pays / région' },
      { key: 'type', label: 'Type', placeholder: 'mobile / fixe / VoIP' },
      { key: 'messageries', label: 'WhatsApp / Telegram / Signal' },
    ],
  },
  {
    kind: 'social',
    name: 'Compte social',
    icon: '🪪',
    color: '#ff7ab8',
    valueLabel: 'Profil',
    placeholder: 'instagram.com/jdupont',
    fields: [
      { key: 'plateforme', label: 'Plateforme' },
      { key: 'handle', label: 'Identifiant' },
      { key: 'abonnes', label: 'Abonnés' },
      { key: 'creation', label: 'Créé le' },
      { key: 'bio', label: 'Bio' },
    ],
  },
  {
    kind: 'domain',
    name: 'Domaine / site',
    icon: '🌐',
    color: '#59c2ff',
    valueLabel: 'Domaine ou URL',
    placeholder: 'exemple.fr',
    fields: [
      { key: 'registrar', label: 'Registrar' },
      { key: 'creation', label: 'Date de création' },
      { key: 'proprietaire', label: 'Propriétaire (whois)' },
      { key: 'hebergeur', label: 'Hébergeur' },
    ],
  },
  {
    kind: 'ip',
    name: 'IP / appareil',
    icon: '📡',
    color: '#8fd67a',
    valueLabel: 'IP / identifiant',
    placeholder: '81.45.12.3 — ou IMEI, MAC',
    fields: [
      { key: 'fai', label: 'FAI / hébergeur' },
      { key: 'geo', label: 'Géolocalisation' },
      { key: 'ports', label: 'Ports / services' },
      { key: 'vu_le', label: 'Vu le' },
    ],
  },
  {
    kind: 'photo',
    name: 'Photo / capture',
    icon: '📷',
    color: '#ffd166',
    valueLabel: 'Légende',
    placeholder: 'Capture du profil Insta',
    fields: [
      { key: 'origine', label: 'Origine' },
      { key: 'date', label: 'Date du cliché' },
      { key: 'exif', label: 'EXIF / métadonnées' },
      { key: 'lieu', label: 'Lieu identifié' },
    ],
  },
  {
    kind: 'place',
    name: 'Lieu / adresse',
    icon: '📍',
    color: '#ff6b6b',
    valueLabel: 'Adresse ou lieu',
    placeholder: '12 rue des Lilas, Lyon',
    fields: [
      { key: 'gps', label: 'Coordonnées GPS' },
      { key: 'type', label: 'Type', placeholder: 'domicile / travail / vu sur photo' },
      { key: 'periode', label: 'Période' },
    ],
  },
  {
    kind: 'org',
    name: 'Organisation',
    icon: '🏢',
    color: '#a0a8c0',
    valueLabel: 'Nom',
    placeholder: 'Acme SARL',
    fields: [
      { key: 'siren', label: 'SIREN / identifiant' },
      { key: 'dirigeants', label: 'Dirigeants' },
      { key: 'adresse', label: 'Siège' },
      { key: 'creation', label: 'Immatriculée le' },
    ],
  },
  {
    kind: 'document',
    name: 'Document',
    icon: '📄',
    color: '#bfa56a',
    valueLabel: 'Titre du document',
    placeholder: 'CV trouvé en PDF',
    fields: [
      { key: 'origine', label: 'Origine' },
      { key: 'date', label: 'Date' },
      { key: 'auteur', label: 'Auteur / métadonnées' },
    ],
  },
  {
    kind: 'vehicle',
    name: 'Véhicule',
    icon: '🚗',
    color: '#7ec8c3',
    valueLabel: 'Plaque / modèle',
    placeholder: 'AB-123-CD',
    fields: [
      { key: 'modele', label: 'Marque / modèle' },
      { key: 'couleur', label: 'Couleur' },
      { key: 'vu_le', label: 'Vu le / où' },
    ],
  },
  {
    kind: 'wallet',
    name: 'Wallet crypto',
    icon: '🪙',
    color: '#f2a65a',
    valueLabel: 'Adresse',
    placeholder: 'bc1q...',
    fields: [
      { key: 'chaine', label: 'Blockchain' },
      { key: 'solde', label: 'Solde' },
      { key: 'premiere_tx', label: 'Première transaction' },
    ],
  },
  {
    kind: 'bank',
    name: 'Compte bancaire',
    icon: '💳',
    color: '#9db4ff',
    valueLabel: 'IBAN / référence',
    placeholder: 'FR76 ....',
    fields: [
      { key: 'banque', label: 'Banque' },
      { key: 'titulaire', label: 'Titulaire' },
      { key: 'pays', label: 'Pays' },
    ],
  },
  {
    kind: 'search',
    name: 'Recherche',
    icon: '🔍',
    color: '#7f8aa3',
    valueLabel: 'Requête effectuée',
    placeholder: 'site:linkedin.com "Jean Dupont" Lyon',
    fields: [
      { key: 'outil', label: 'Outil utilisé', placeholder: 'Google, Epieos, Holehe...' },
      { key: 'date', label: 'Effectuée le' },
      { key: 'resultat', label: 'Ce que ça a donné' },
    ],
  },
  {
    kind: 'note',
    name: 'Note',
    icon: '📝',
    color: '#c9c9c9',
    valueLabel: 'Titre',
    placeholder: 'Hypothèse à vérifier',
    fields: [{ key: 'detail', label: 'Détail' }],
  },
];

export const ENTITY_BY_KIND: Record<EntityKind, EntityDef> = Object.fromEntries(
  ENTITY_DEFS.map((d) => [d.kind, d])
) as Record<EntityKind, EntityDef>;

export function entityDef(kind: EntityKind | string): EntityDef {
  return ENTITY_BY_KIND[kind as EntityKind] ?? ENTITY_BY_KIND.note;
}

export const CONFIDENCE: { value: Confidence; label: string; short: string; color: string }[] = [
  { value: 'confirmed', label: 'Confirmé', short: 'OK', color: '#3ddc84' },
  { value: 'probable', label: 'Probable', short: '~', color: '#ffb020' },
  { value: 'unverified', label: 'À vérifier', short: '?', color: '#ff5d5d' },
];

export function confidenceColor(c: Confidence | string): string {
  return CONFIDENCE.find((x) => x.value === c)?.color ?? '#ffb020';
}

export function confidenceLabel(c: Confidence | string): string {
  return CONFIDENCE.find((x) => x.value === c)?.label ?? 'Probable';
}
