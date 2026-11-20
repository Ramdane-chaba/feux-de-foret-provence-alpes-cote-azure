import { useEffect, useRef, useState, type RefObject } from "react";

/** Largeur réelle d'un élément : les graphiques se dessinent au pixel, sans mise à l'échelle du texte. */
export function useLargeur<T extends HTMLElement>(defaut = 640): [RefObject<T>, number] {
  const ref = useRef<T>(null);
  const [largeur, setLargeur] = useState(defaut);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const mesurer = (): void => {
      const l = Math.floor(element.getBoundingClientRect().width);
      if (l > 0) setLargeur(l);
    };
    mesurer();
    const observateur = new ResizeObserver(mesurer);
    observateur.observe(element);
    return () => observateur.disconnect();
  }, []);
  return [ref, largeur];
}

const REQUETE_MOUVEMENT = "(prefers-reduced-motion: reduce)";

/** Vrai si l'utilisateur a demandé à réduire les animations. */
export function useMouvementReduit(): boolean {
  const [reduit, setReduit] = useState(() => window.matchMedia(REQUETE_MOUVEMENT).matches);
  useEffect(() => {
    const requete = window.matchMedia(REQUETE_MOUVEMENT);
    const ecouter = (): void => setReduit(requete.matches);
    requete.addEventListener("change", ecouter);
    return () => requete.removeEventListener("change", ecouter);
  }, []);
  return reduit;
}

/** Ferme un élément flottant au clic extérieur ou avec Échap. */
export function useFermeture(ouvert: boolean, fermer: () => void, ...refs: RefObject<HTMLElement>[]): void {
  useEffect(() => {
    if (!ouvert) return;
    const clic = (e: PointerEvent): void => {
      if (!refs.some((r) => r.current?.contains(e.target as Node))) fermer();
    };
    const touche = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        e.stopPropagation();
        fermer();
      }
    };
    document.addEventListener("pointerdown", clic);
    document.addEventListener("keydown", touche, true);
    return () => {
      document.removeEventListener("pointerdown", clic);
      document.removeEventListener("keydown", touche, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ouvert, fermer]);
}

/** Hauteur de la fenêtre moins une réserve, bornée : pour un graphique qui doit tenir à l'écran. */
export function useHauteurDisponible(reserve: number, min: number, max: number): number {
  const calculer = (): number => Math.round(Math.max(min, Math.min(max, window.innerHeight - reserve)));
  const [hauteur, setHauteur] = useState(calculer);
  useEffect(() => {
    const ecouter = (): void => setHauteur(calculer());
    window.addEventListener("resize", ecouter);
    return () => window.removeEventListener("resize", ecouter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reserve, min, max]);
  return hauteur;
}
