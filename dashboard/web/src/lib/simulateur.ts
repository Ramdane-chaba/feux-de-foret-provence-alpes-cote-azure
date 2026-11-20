/**
 * Logique du simulateur de décision : pure, sans React, testée dans simulateur.test.ts.
 *
 * Un seuil « tient dans le budget » s'il ne dépasse le budget dans AUCUNE des saisons mesurées :
 * le nombre de jours de renfort d'un même seuil varie beaucoup d'une saison à l'autre
 * (hypothèse de l'objectif O3), donc une moyenne masquerait le dépassement de la saison la plus chargée.
 */

import type { LigneSeuil, Perimetre, Seuil } from "../types/donnees";

export interface BilanSaison {
  annee: number;
  joursRenfort: number;
  joursBulletin: number;
  joursSansFeu: number;
  feuxPeriode: number;
  feuxCouverts: number;
  feuxManques: number;
  /** Jours au-delà du budget (0 si le budget est tenu). */
  depassement: number;
}

export interface BilanSeuil {
  seuil: Seuil;
  saisons: BilanSaison[];
  feuxPeriode: number;
  feuxCouverts: number;
  feuxManques: number;
  joursRenfort: number;
  joursSansFeu: number;
  joursBulletin: number;
  /** Jours de renfort de la saison la plus chargée. */
  joursRenfortMax: number;
  /** Plus grand dépassement sur une saison. */
  depassementMax: number;
  tientDansLeBudget: boolean;
}

export function bilanSeuil(lignes: readonly LigneSeuil[], perimetre: Perimetre, seuil: Seuil, budget: number): BilanSeuil {
  const saisons: BilanSaison[] = lignes
    .filter((l) => l.perimetre === perimetre && l.seuil === seuil)
    .sort((a, b) => a.annee - b.annee)
    .map((l) => ({
      annee: l.annee,
      joursRenfort: l.jours_renfort,
      joursBulletin: l.jours_bulletin,
      joursSansFeu: l.jours_renfort_sans_feu,
      feuxPeriode: l.feux_periode,
      feuxCouverts: l.feux_couverts,
      feuxManques: l.feux_manques,
      depassement: Math.max(0, l.jours_renfort - budget),
    }));
  const total = (cle: keyof Omit<BilanSaison, "annee">): number => saisons.reduce((a, s) => a + s[cle], 0);
  const depassementMax = Math.max(0, ...saisons.map((s) => s.depassement));
  return {
    seuil,
    saisons,
    feuxPeriode: total("feuxPeriode"),
    feuxCouverts: total("feuxCouverts"),
    feuxManques: total("feuxManques"),
    joursRenfort: total("joursRenfort"),
    joursSansFeu: total("joursSansFeu"),
    joursBulletin: total("joursBulletin"),
    joursRenfortMax: Math.max(0, ...saisons.map((s) => s.joursRenfort)),
    depassementMax,
    tientDansLeBudget: saisons.length > 0 && depassementMax === 0,
  };
}

/**
 * Meilleur seuil compatible avec le budget : parmi les seuils qui tiennent dans le budget à chaque
 * saison, celui qui couvre le plus de feux (donc le plus bas). `null` si aucun ne tient.
 */
export function meilleurSeuil(bilans: readonly BilanSeuil[]): Seuil | null {
  const compatibles = bilans.filter((b) => b.tientDansLeBudget);
  if (compatibles.length === 0) return null;
  return compatibles.reduce((a, b) => (b.feuxCouverts > a.feuxCouverts ? b : a)).seuil;
}

export interface Verdict {
  tient: boolean;
  phrase: string;
  detail: string;
}

/** La phrase de verdict, toujours construite à partir du bilan. */
export function verdict(bilan: BilanSeuil, budget: number): Verdict {
  const j = (n: number): string => `${n} jour${n > 1 ? "s" : ""}`;
  if (bilan.tientDansLeBudget) {
    const marge = budget - bilan.joursRenfortMax;
    return {
      tient: true,
      phrase: "Ce seuil tient dans le budget.",
      detail:
        marge === 0
          ? `La saison la plus chargée demande exactement les ${j(budget)} prévus.`
          : `La saison la plus chargée demande ${j(bilan.joursRenfortMax)} de renfort : il reste une marge de ${j(marge)}.`,
    };
  }
  const dedans = bilan.saisons.filter((s) => s.depassement === 0);
  const dehors = bilan.saisons.filter((s) => s.depassement > 0);
  const pire = dehors.reduce((a, s) => (s.depassement > a.depassement ? s : a), dehors[0]!);
  const detail =
    dedans.length > 0
      ? `Il tient en ${dedans.map((s) => `${s.annee} (${j(s.joursRenfort)})`).join(", ")}, mais pas en ${dehors
          .map((s) => `${s.annee} (${j(s.joursRenfort)})`)
          .join(", ")}.`
      : `Il dépasse à chaque saison : ${dehors.map((s) => `${j(s.joursRenfort)} en ${s.annee}`).join(", ")}.`;
  return {
    tient: false,
    phrase: `Ce seuil dépasse le budget de ${j(pire.depassement)} en ${pire.annee}.`,
    detail,
  };
}
