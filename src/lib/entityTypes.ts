import type { Confidence, EntityKind } from '../types';

/**
 * Forme et couleur des elements. Les libelles (nom, champs, exemples) vivent
 * dans les dictionnaires de `src/i18n` : ici on ne garde que les cles de champs.
 */
export type EntityDef = {
  kind: EntityKind;
  icon: string;
  color: string;
  fields: string[];
};

export const ENTITY_DEFS: EntityDef[] = [
  { kind: 'person', icon: '👤', color: '#5b9cff', fields: ['alias', 'naissance', 'ville', 'metier', 'employeur'] },
  { kind: 'birth', icon: '🎂', color: '#b3a4ff', fields: ['lieu', 'precision', 'registre'] },
  { kind: 'username', icon: '@', color: '#c08bff', fields: ['plateformes', 'variantes'] },
  { kind: 'email', icon: '✉️', color: '#4fd1a5', fields: ['fournisseur', 'fuites', 'services'] },
  { kind: 'phone', icon: '☎️', color: '#ffb454', fields: ['operateur', 'pays', 'type', 'messageries'] },
  { kind: 'social', icon: '🪪', color: '#ff7ab8', fields: ['plateforme', 'handle', 'abonnes', 'creation', 'bio'] },
  { kind: 'domain', icon: '🌐', color: '#59c2ff', fields: ['registrar', 'creation', 'proprietaire', 'hebergeur', 'url'] },
  { kind: 'ip', icon: '📡', color: '#8fd67a', fields: ['fai', 'geo', 'ports', 'vu_le'] },
  { kind: 'photo', icon: '📷', color: '#ffd166', fields: ['origine', 'date', 'exif', 'lieu'] },
  { kind: 'place', icon: '📍', color: '#ff6b6b', fields: ['gps', 'type', 'periode'] },
  { kind: 'org', icon: '🏢', color: '#a0a8c0', fields: ['siren', 'dirigeants', 'adresse', 'creation'] },
  { kind: 'document', icon: '📄', color: '#bfa56a', fields: ['origine', 'date', 'auteur'] },
  { kind: 'vehicle', icon: '🚗', color: '#7ec8c3', fields: ['modele', 'couleur', 'vu_le'] },
  { kind: 'wallet', icon: '🪙', color: '#f2a65a', fields: ['chaine', 'solde', 'premiere_tx'] },
  { kind: 'bank', icon: '💳', color: '#9db4ff', fields: ['banque', 'titulaire', 'pays'] },
  { kind: 'search', icon: '🔍', color: '#7f8aa3', fields: ['outil', 'date', 'resultat'] },
  { kind: 'note', icon: '📝', color: '#c9c9c9', fields: ['detail'] },
];

export const ENTITY_BY_KIND: Record<EntityKind, EntityDef> = Object.fromEntries(
  ENTITY_DEFS.map((d) => [d.kind, d])
) as Record<EntityKind, EntityDef>;

export function entityDef(kind: EntityKind | string): EntityDef {
  return ENTITY_BY_KIND[kind as EntityKind] ?? ENTITY_BY_KIND.note;
}

export const CONFIDENCE: { value: Confidence; color: string }[] = [
  { value: 'confirmed', color: '#3ddc84' },
  { value: 'probable', color: '#ffb020' },
  { value: 'unverified', color: '#ff5d5d' },
];

export function confidenceColor(c: Confidence | string): string {
  return CONFIDENCE.find((x) => x.value === c)?.color ?? '#ffb020';
}
