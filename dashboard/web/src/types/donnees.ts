/** Types des fichiers JSON écrits par pipeline/exporter_web.py (un fichier par page). */

export type Seuil = 2 | 3 | 4;
export type Niveau = 1 | 2 | 3 | 4;
export type Perimetre = "departement" | "hors_marseille";

export interface Meta {
  genere_le: string;
  date_export: string;
  departement: string;
  fond_de_carte: boolean;
  sources: { nom: string; detail: string }[];
}

export interface Accueil {
  saisons: number[];
  seuil_reference: Seuil;
  feux: number;
  feux_periode: number;
  feux_couverts: number;
  jours_renfort: number;
  jours_bulletin: number;
  /** Première et dernière année de la BDIFF chargée pour le département. */
  annee_debut: number;
  annee_fin: number;
}

export interface AnneeFeux {
  annee: number;
  nb_feux: number;
  surface_ha: number;
  /** Cumul annuel de la pluie quotidienne moyenne des stations du département. */
  pluie_mm: number;
  jours_pluie_mesuree: number;
  jours: number;
}

export interface CommuneRang {
  code_insee: string;
  nom: string;
  prioritaire: boolean;
  nb_feux: number;
  surface_ha: number;
}

export interface Recit {
  annees: AnneeFeux[];
  communes_hors_marseille: CommuneRang[];
  feux_marseille: number;
}

export interface LigneSeuil {
  perimetre: Perimetre;
  annee: number;
  seuil: Seuil;
  jours_bulletin: number;
  jours_renfort: number;
  jours_renfort_avec_feu: number;
  jours_renfort_sans_feu: number;
  feux_periode: number;
  feux_couverts: number;
  feux_manques: number;
  jours_avec_feu_manques: number;
  surface_manquee_ha: number;
}

export interface Seuils {
  saisons: number[];
  seuils: Seuil[];
  seuil_reference: Seuil;
  lignes: LigneSeuil[];
}

export interface Jour {
  /** AAAA-MM-JJ */
  jour: string;
  annee: number;
  niveau: Niveau;
  nb_feux: number;
  nb_feux_hors_marseille: number;
  surface_ha: number;
  tx_max_c: number | null;
  un_min_pct: number | null;
  rr_veille_mm: number | null;
  rafale_ms: number | null;
}

export interface Jours {
  saisons: number[];
  seuils: Seuil[];
  seuil_reference: Seuil;
  jours: Jour[];
}

export interface CommuneCarte {
  code: string;
  nom: string;
  prioritaire: boolean;
  est_marseille: boolean;
  nb_feux: number;
  surface_ha: number;
  feux_par_annee: number[];
  ha_par_annee: number[];
  /** 12 valeurs, janvier en premier. */
  feux_par_mois: number[];
  /** 24 valeurs, heure de la première alerte. */
  feux_par_heure: number[];
}

export interface Carte {
  annees: number[];
  communes: CommuneCarte[];
}

export interface Ratio {
  numerateur: number;
  denominateur: number;
}

export interface Synthese {
  saisons: number[];
  seuil_reference: Seuil;
  grand_feu_ha: number;
  plage_patrouille: [number, number];
  feux: number;
  feux_periode: number;
  feux_hors_periode: number;
  i1: Ratio;
  i1_autres: Ratio;
  i2: Ratio;
  feux_par_heure: { heure: number; nb_feux: number; nb_feux_couverts: number }[];
  historique: {
    communes_avec_feu: number;
    communes_prioritaires: number;
    feux_hors_marseille: number;
    feux_prioritaires: number;
    annee_debut: number;
    annee_fin: number;
  };
}

export interface TermeGlossaire {
  id: string;
  terme: string;
  definition: string;
  regle?: string;
  exemple?: string;
  unite?: string;
  statut?: string;
}

export interface Glossaire {
  source: string;
  termes: TermeGlossaire[];
}

/** Nom du fichier JSON → type de son contenu. */
export interface Fichiers {
  meta: Meta;
  accueil: Accueil;
  recit: Recit;
  seuils: Seuils;
  jours: Jours;
  carte: Carte;
  synthese: Synthese;
  glossaire: Glossaire;
}
