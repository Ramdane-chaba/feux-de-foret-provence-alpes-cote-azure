/**
 * Mode présentation, pour la soutenance : plein écran, navigation cachée, pages qui défilent
 * avec les flèches du clavier. Une page à étapes (le récit) peut consommer les flèches avant
 * le changement de page, grâce à `useEtapesPresentation`.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PAGES } from "../constantes";

type Direction = 1 | -1;
/** Renvoie vrai si la page a traité la flèche (elle avait encore une étape dans cette direction). */
type GestionEtapes = (direction: Direction) => boolean;

interface ApiPresentation {
  actif: boolean;
  basculer: () => void;
  enregistrerEtapes: (gestion: GestionEtapes | null) => void;
}

const Contexte = createContext<ApiPresentation | null>(null);

export function FournisseurPresentation({ children }: { children: ReactNode }): JSX.Element {
  const [actif, setActif] = useState(false);
  const etapes = useRef<GestionEtapes | null>(null);
  const naviguer = useNavigate();
  const { pathname } = useLocation();
  const indice = PAGES.findIndex((p) => p.chemin === pathname);

  const quitter = useCallback(() => {
    setActif(false);
    if (document.fullscreenElement) void document.exitFullscreen();
  }, []);

  const basculer = useCallback(() => {
    if (actif) {
      quitter();
      return;
    }
    setActif(true);
    // Le plein écran peut être refusé par le navigateur : le mode présentation fonctionne quand même.
    document.documentElement.requestFullscreen?.().catch(() => undefined);
  }, [actif, quitter]);

  const avancer = useCallback(
    (direction: Direction) => {
      if (etapes.current?.(direction)) return;
      const suivant = PAGES[(indice === -1 ? 0 : indice) + direction];
      if (suivant) naviguer(suivant.chemin);
    },
    [indice, naviguer],
  );

  useEffect(() => {
    document.documentElement.classList.toggle("presentation", actif);
    if (!actif) return;
    const touche = (e: KeyboardEvent): void => {
      const cible = e.target as HTMLElement;
      // Les curseurs et les champs gardent leurs flèches.
      if (cible.matches("input, select, textarea") && e.key !== "Escape") return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        avancer(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp" || e.key === "ArrowUp") {
        e.preventDefault();
        avancer(-1);
      } else if (e.key === "Escape") {
        quitter();
      }
    };
    // Sortir du plein écran avec Échap (géré par le navigateur) quitte aussi le mode présentation.
    const pleinEcran = (): void => {
      if (!document.fullscreenElement) setActif(false);
    };
    window.addEventListener("keydown", touche);
    document.addEventListener("fullscreenchange", pleinEcran);
    return () => {
      window.removeEventListener("keydown", touche);
      document.removeEventListener("fullscreenchange", pleinEcran);
    };
  }, [actif, avancer, quitter]);

  const api = useMemo<ApiPresentation>(
    () => ({ actif, basculer, enregistrerEtapes: (g) => (etapes.current = g) }),
    [actif, basculer],
  );

  return (
    <Contexte.Provider value={api}>
      {children}
      {actif && (
        <div className="barre-presentation sans-impression">
          <button type="button" className="bouton bouton--discret" onClick={() => avancer(-1)} aria-label="Précédent">
            ←
          </button>
          <span>
            {indice === -1 ? "–" : indice + 1} / {PAGES.length} · {PAGES[indice]?.titre ?? "Page introuvable"}
          </span>
          <button type="button" className="bouton bouton--discret" onClick={() => avancer(1)} aria-label="Suivant">
            →
          </button>
          <span className="barre-presentation__aide">Flèches pour avancer · Échap pour quitter</span>
        </div>
      )}
    </Contexte.Provider>
  );
}

export function usePresentation(): ApiPresentation {
  const api = useContext(Contexte);
  if (!api) throw new Error("usePresentation doit être utilisé sous <FournisseurPresentation>");
  return api;
}

/** À appeler dans une page à étapes : en mode présentation, les flèches passent d'abord par elle. */
export function useEtapesPresentation(gestion: GestionEtapes): void {
  const { enregistrerEtapes } = usePresentation();
  useEffect(() => {
    enregistrerEtapes(gestion);
    return () => enregistrerEtapes(null);
  }, [enregistrerEtapes, gestion]);
}
