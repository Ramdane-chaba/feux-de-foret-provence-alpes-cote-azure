import { describe, expect, it } from "vitest";
import type { LigneSeuil, Seuil } from "../types/donnees";
import { bilanSeuil, meilleurSeuil, verdict } from "./simulateur";

// Jeu d'essai inventé pour le test (ce ne sont pas les chiffres du SDIS 13).
function ligne(annee: number, seuil: Seuil, jours: number, couverts: number): LigneSeuil {
  return {
    perimetre: "departement", annee, seuil, jours_bulletin: 100, jours_renfort: jours,
    jours_renfort_avec_feu: jours, jours_renfort_sans_feu: 0, feux_periode: 100,
    feux_couverts: couverts, feux_manques: 100 - couverts, jours_avec_feu_manques: 0, surface_manquee_ha: 0,
  };
}
const lignes = [
  ligne(1, 2, 80, 90), ligne(2, 2, 90, 95),
  ligne(1, 3, 20, 40), ligne(2, 3, 50, 60),
  ligne(1, 4, 0, 0), ligne(2, 4, 10, 20),
];
const bilans = (budget: number) => ([2, 3, 4] as const).map((s) => bilanSeuil(lignes, "departement", s, budget));

describe("bilanSeuil", () => {
  it("additionne les saisons et mesure le dépassement de la saison la plus chargée", () => {
    const b = bilanSeuil(lignes, "departement", 3, 30);
    expect(b.feuxCouverts).toBe(100);
    expect(b.feuxPeriode).toBe(200);
    expect(b.joursRenfort).toBe(70);
    expect(b.joursRenfortMax).toBe(50);
    expect(b.depassementMax).toBe(20);
    expect(b.tientDansLeBudget).toBe(false);
  });
  it("tient quand le budget égale la saison la plus chargée", () => {
    expect(bilanSeuil(lignes, "departement", 3, 50).tientDansLeBudget).toBe(true);
  });
});

describe("meilleurSeuil", () => {
  it("prend le seuil compatible qui couvre le plus de feux", () => {
    expect(meilleurSeuil(bilans(100))).toBe(2);
    expect(meilleurSeuil(bilans(89))).toBe(3);
    expect(meilleurSeuil(bilans(49))).toBe(4);
    expect(meilleurSeuil(bilans(9))).toBeNull();
  });
});

describe("verdict", () => {
  it("annonce la marge quand le seuil tient", () => {
    const v = verdict(bilanSeuil(lignes, "departement", 3, 60), 60);
    expect(v.tient).toBe(true);
    expect(v.detail).toContain("marge de 10 jours");
  });
  it("annonce le dépassement et la saison quand une seule saison dépasse", () => {
    const v = verdict(bilanSeuil(lignes, "departement", 3, 30), 30);
    expect(v.phrase).toBe("Ce seuil dépasse le budget de 20 jours en 2.");
    expect(v.detail).toContain("Il tient en 1 (20 jours)");
  });
  it("annonce le pire dépassement quand toutes les saisons dépassent", () => {
    const v = verdict(bilanSeuil(lignes, "departement", 2, 10), 10);
    expect(v.phrase).toBe("Ce seuil dépasse le budget de 80 jours en 2.");
    expect(v.detail).toContain("à chaque saison");
  });
});
