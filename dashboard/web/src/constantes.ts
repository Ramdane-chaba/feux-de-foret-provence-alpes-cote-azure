/**
 * Constantes de l'application.
 *
 * Règle : aucun chiffre issu des données n'est écrit ici ni dans les composants. Tout résultat
 * (nombre de feux, parts, jours de renfort…) vient des JSON de public/data/, écrits par
 * pipeline/exporter_web.py. Ce fichier ne contient que des réglages d'affichage et les
 * hypothèses de départ du simulateur, chacune documentée.
 */

import type { Niveau } from "./types/donnees";

/** Dossier des JSON, relatif à index.html. */
export const DOSSIER_DONNEES = "data";

/**
 * Position de départ du curseur « budget » du simulateur, en part de la saison.
 * Ce n'est PAS une donnée : le budget réel du SDIS 13 est inconnu (décision D013).
 * La moitié de la saison est un point de départ neutre ; le nombre de jours est calculé
 * à partir du nombre de jours de bulletin lu dans seuils.json.
 */
export const PART_BUDGET_INITIAL = 0.5;

/**
 * Récit, étape 1 : une année est dite « sèche » quand son cumul de pluie est sous la médiane
 * des années mesurées. La médiane est calculée dans le navigateur, pas écrite ici.
 */
export const DEFINITION_ANNEE_SECHE = "cumul de pluie sous la médiane";

/** Nombre de mois et d'heures « à risque » cités dans la fiche d'une commune. */
export const NB_MOIS_A_RISQUE = 3;
export const NB_HEURES_A_RISQUE = 4;

/** Échelle de la Météo des forêts (documentation Météo-France). Palette validée pour le daltonisme. */
export const NIVEAUX: Record<Niveau, { nom: string; couleur: string }> = {
  1: { nom: "Faible", couleur: "#34B27B" },
  2: { nom: "Modéré", couleur: "#F4D03F" },
  3: { nom: "Élevé", couleur: "#F28C28" },
  4: { nom: "Très élevé", couleur: "#D1245C" },
};
export const LISTE_NIVEAUX: readonly Niveau[] = [1, 2, 3, 4];

/** Palette « feu de nuit », reprise du thème du rapport Power BI (dashboard/SDIS13/theme-sdis13.json). */
export const COULEURS = {
  fond: "#0B1220",
  surface: "#111827",
  surfaceHaute: "#1A2436",
  bordure: "#243044",
  grille: "#223049",
  encre: "#F3F4F6",
  encreSecondaire: "#CBD5E1",
  encreDiscrete: "#8B98AD",
  accent: "#FF8A3D",
  neutre: "#5B6B85",
  neutreClair: "#94A3B8",
  bon: "#34D399",
  alerte: "#F43F5E",
} as const;

/** Dégradé séquentiel de la carte : du fond (aucun feu) au clair (beaucoup de feux). Une seule teinte. */
export const RAMPE_CARTE = ["#172033", "#33466B", "#6F8DBD", "#B9CDEB", "#F1F6FF"] as const;

export const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."] as const;
export const MOIS_LONGS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"] as const;
export const JOURS_SEMAINE = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."] as const;

/** Durée d'une année dans la lecture animée de la carte (ms). */
export const DUREE_ANNEE_MS = 1100;
/** Durée du comptage des chiffres de l'écran d'ouverture (ms). */
export const DUREE_COMPTEUR_MS = 1600;

/** Pages, dans l'ordre du mode présentation (flèches du clavier). */
export const PAGES = [
  { chemin: "/", titre: "Ouverture", court: "Ouverture" },
  { chemin: "/recit", titre: "L'histoire en 5 étapes", court: "Récit" },
  { chemin: "/simulateur", titre: "Simulateur de décision", court: "Simulateur" },
  { chemin: "/carte", titre: "Carte des communes", court: "Carte" },
  { chemin: "/calendrier", titre: "Calendrier des saisons", court: "Calendrier" },
  { chemin: "/synthese", titre: "Synthèse", court: "Synthèse" },
] as const;
