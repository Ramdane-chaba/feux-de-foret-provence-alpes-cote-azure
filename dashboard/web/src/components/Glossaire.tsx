/**
 * Glossaire intégré : <Terme id="feu-manque">feux manqués</Terme> affiche le texte suivi d'un « ? »
 * qui ouvre la définition de docs/glossaire.md (exportée dans glossaire.json).
 */

import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { charger } from "../lib/donnees";
import { useFermeture } from "../lib/hooks";
import type { TermeGlossaire } from "../types/donnees";

/** Identifiants des entrées de docs/glossaire.md utilisées dans l'application. */
export type IdTerme =
  | "seuil-de-declenchement"
  | "jour-de-renfort"
  | "feu-manque"
  | "grand-feu"
  | "bmpm"
  | "niveau-j-1"
  | "fausse-alerte"
  | "dispositif-renforce"
  | "meteo-des-forets"
  | "date-de-premiere-alerte"
  | "depart-de-feu";

type Etat = { etat: "chargement" } | { etat: "pret"; termes: Map<string, TermeGlossaire> } | { etat: "erreur" };

const Contexte = createContext<Etat>({ etat: "chargement" });

export function FournisseurGlossaire({ children }: { children: ReactNode }): JSX.Element {
  const [etat, setEtat] = useState<Etat>({ etat: "chargement" });
  useEffect(() => {
    charger("glossaire").then(
      (g) => setEtat({ etat: "pret", termes: new Map(g.termes.map((t) => [t.id, t])) }),
      () => setEtat({ etat: "erreur" }),
    );
  }, []);
  return <Contexte.Provider value={etat}>{children}</Contexte.Provider>;
}

const LARGEUR_BULLE = 340;

export function Terme({ id, children }: { id: IdTerme; children: ReactNode }): JSX.Element {
  const glossaire = useContext(Contexte);
  const [ouvert, setOuvert] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({});
  const bouton = useRef<HTMLButtonElement>(null);
  const bulle = useRef<HTMLDivElement>(null);
  const idBulle = useId();
  const fermer = useCallback(() => setOuvert(false), []);
  useFermeture(ouvert, fermer, bouton, bulle);

  useLayoutEffect(() => {
    if (!ouvert || !bouton.current) return;
    const placer = (): void => {
      const b = bouton.current?.getBoundingClientRect();
      if (!b) return;
      const hauteur = bulle.current?.offsetHeight ?? 0;
      const gauche = Math.min(Math.max(12, b.left + b.width / 2 - LARGEUR_BULLE / 2), window.innerWidth - LARGEUR_BULLE - 12);
      const dessous = b.bottom + 8 + hauteur < window.innerHeight - 8;
      setStyle({ left: gauche, top: dessous ? b.bottom + 8 : Math.max(8, b.top - 8 - hauteur), width: LARGEUR_BULLE });
    };
    placer();
    window.addEventListener("scroll", fermer, { passive: true, once: true });
    window.addEventListener("resize", placer);
    return () => {
      window.removeEventListener("scroll", fermer);
      window.removeEventListener("resize", placer);
    };
  }, [ouvert, fermer, glossaire.etat]);

  const terme = glossaire.etat === "pret" ? glossaire.termes.get(id) : undefined;

  return (
    <span className="terme">
      {children}
      <button
        ref={bouton}
        type="button"
        className="terme__bouton"
        aria-label={`Définition : ${terme?.terme ?? id}`}
        aria-expanded={ouvert}
        aria-controls={idBulle}
        onClick={() => setOuvert((o) => !o)}
      >
        ?
      </button>
      {/* Portail : la bulle ne dépend pas des transformations CSS de la carte qui contient le terme. */}
      {ouvert && createPortal(
        <span ref={bulle} id={idBulle} className="terme__bulle" style={style} role="dialog" aria-label={terme?.terme ?? "Définition"}>
          {terme ? (
            <>
              <strong className="terme__titre">{terme.terme}</strong>
              <span className="terme__definition">{terme.definition.charAt(0).toUpperCase() + terme.definition.slice(1)}</span>
              {terme.exemple && !terme.exemple.startsWith("à compléter") && (
                <span className="terme__exemple">
                  <em>Exemple.</em> {terme.exemple}
                </span>
              )}
              <span className="terme__source">Glossaire du projet · docs/glossaire.md{terme.statut ? ` · statut : ${terme.statut.split("(")[0]?.trim().replace(/\.$/, "")}` : ""}</span>
            </>
          ) : (
            <span className="terme__definition">
              {glossaire.etat === "chargement" ? "Chargement de la définition…" : "Définition introuvable dans glossaire.json (relancer l'export)."}
            </span>
          )}
        </span>,
        document.body,
      )}
    </span>
  );
}
