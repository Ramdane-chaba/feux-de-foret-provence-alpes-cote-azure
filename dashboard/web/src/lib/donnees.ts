/**
 * Chargement des JSON à la demande : chaque page ne demande que ses fichiers,
 * et un fichier déjà demandé n'est jamais téléchargé deux fois (cache en mémoire).
 */

import type { FeatureCollection, MultiPolygon } from "geojson";
import { useEffect, useState } from "react";
import { DOSSIER_DONNEES } from "../constantes";
import type { Fichiers } from "../types/donnees";

export type Etat<T> =
  | { etat: "chargement" }
  | { etat: "pret"; donnees: T }
  | { etat: "erreur"; message: string };

const cache = new Map<string, Promise<unknown>>();

function telecharger<T>(fichier: string): Promise<T> {
  let promesse = cache.get(fichier) as Promise<T> | undefined;
  if (!promesse) {
    promesse = fetch(`${DOSSIER_DONNEES}/${fichier}`).then((reponse) => {
      if (!reponse.ok) throw new Error(`${fichier} : ${reponse.status}`);
      return reponse.json() as Promise<T>;
    });
    promesse.catch(() => cache.delete(fichier)); // un échec n'est pas gardé : la page peut réessayer
    cache.set(fichier, promesse);
  }
  return promesse;
}

export function charger<K extends keyof Fichiers>(nom: K): Promise<Fichiers[K]> {
  return telecharger<Fichiers[K]>(`${nom}.json`);
}

export type ContoursCommunes = FeatureCollection<MultiPolygon, { code: string; nom: string }>;

export function chargerContours(departement: string): Promise<ContoursCommunes> {
  return telecharger<ContoursCommunes>(`communes-${departement}.geojson`);
}

function usePromesse<T>(cle: string, fabrique: () => Promise<T>): Etat<T> {
  const [etat, setEtat] = useState<Etat<T>>({ etat: "chargement" });
  useEffect(() => {
    let actif = true;
    setEtat({ etat: "chargement" });
    fabrique().then(
      (donnees) => actif && setEtat({ etat: "pret", donnees }),
      (erreur: unknown) => actif && setEtat({ etat: "erreur", message: erreur instanceof Error ? erreur.message : String(erreur) }),
    );
    return () => {
      actif = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle]);
  return etat;
}

export function useDonnees<K extends keyof Fichiers>(nom: K): Etat<Fichiers[K]> {
  return usePromesse(nom, () => charger(nom));
}

export function useContours(departement: string | null): Etat<ContoursCommunes> {
  return usePromesse(`contours-${departement ?? ""}`, () =>
    departement === null ? Promise.reject(new Error("fond de carte absent de l'export")) : chargerContours(departement),
  );
}

type Contenus<T extends readonly Etat<unknown>[]> = { [I in keyof T]: T[I] extends Etat<infer U> ? U : never };

/** Réunit plusieurs états : prêt quand tous le sont, en erreur dès qu'un seul l'est. */
export function tous<T extends readonly Etat<unknown>[]>(...etats: T): Etat<Contenus<T>> {
  const erreur = etats.find((e) => e.etat === "erreur");
  if (erreur && erreur.etat === "erreur") return erreur;
  if (etats.some((e) => e.etat === "chargement")) return { etat: "chargement" };
  return { etat: "pret", donnees: etats.map((e) => (e.etat === "pret" ? e.donnees : undefined)) as Contenus<T> };
}
