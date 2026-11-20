/** Briques réutilisables de mise en page : SectionTitle, KpiCard, ChartCard, états de chargement et d'erreur. */

import { useRef, useState, type ReactNode } from "react";
import type { Etat } from "../lib/donnees";
import { exporterPng } from "../lib/exportPng";

// --- SectionTitle ---

interface PropsSectionTitle {
  surtitre?: string;
  titre: ReactNode;
  chapeau?: ReactNode;
  niveau?: 1 | 2;
}

export function SectionTitle({ surtitre, titre, chapeau, niveau = 1 }: PropsSectionTitle): JSX.Element {
  const Balise = niveau === 1 ? "h1" : "h2";
  return (
    <header className={`titre-section titre-section--${niveau}`}>
      {surtitre && <p className="surtitre">{surtitre}</p>}
      <Balise>{titre}</Balise>
      {chapeau && <p className="chapeau">{chapeau}</p>}
    </header>
  );
}

// --- KpiCard ---

interface PropsKpiCard {
  libelle: ReactNode;
  valeur: ReactNode;
  /** Ce que mesure le chiffre : numérateur, dénominateur, période. */
  detail?: ReactNode;
  ton?: "accent" | "neutre" | "bon" | "alerte";
}

export function KpiCard({ libelle, valeur, detail, ton = "neutre" }: PropsKpiCard): JSX.Element {
  return (
    <article className={`kpi kpi--${ton} carte-survol`}>
      <p className="kpi__libelle">{libelle}</p>
      <p className="kpi__valeur">{valeur}</p>
      {detail && <p className="kpi__detail">{detail}</p>}
    </article>
  );
}

// --- ChartCard ---

interface PropsChartCard {
  /** Le titre dit ce que montre le graphique (une phrase), pas son type. */
  titre: string;
  sousTitre?: string;
  source?: string;
  /** Nom du fichier PNG téléchargé, sans extension. */
  nomFichier: string;
  /** Légende ou filtres, affichés entre le titre et le graphique. */
  entete?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ titre, sousTitre, source, nomFichier, entete, children, className = "" }: PropsChartCard): JSX.Element {
  const corps = useRef<HTMLDivElement>(null);
  const [etat, setEtat] = useState<"repos" | "export" | "erreur">("repos");

  const telecharger = async (): Promise<void> => {
    const svg = corps.current?.querySelector<SVGSVGElement>("svg[data-export]");
    if (!svg) return;
    setEtat("export");
    try {
      await exporterPng(svg, { titre, sousTitre, source, nomFichier });
      setEtat("repos");
    } catch {
      setEtat("erreur");
    }
  };

  return (
    <figure className={`graphique carte-survol ${className}`}>
      <figcaption className="graphique__entete">
        <div>
          <h3 className="graphique__titre">{titre}</h3>
          {sousTitre && <p className="graphique__sous-titre">{sousTitre}</p>}
        </div>
        <button type="button" className="bouton bouton--discret sans-impression" onClick={telecharger} disabled={etat === "export"} title="Télécharger ce graphique en PNG">
          <IconeTelecharger />
          {etat === "export" ? "Export…" : etat === "erreur" ? "Échec, réessayer" : "PNG"}
        </button>
      </figcaption>
      {entete && <div className="graphique__outils">{entete}</div>}
      <div className="graphique__corps" ref={corps}>
        {children}
      </div>
      {source && <p className="graphique__source">{source}</p>}
    </figure>
  );
}

export function IconeTelecharger(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 2v8m0 0L4.5 6.5M8 10l3.5-3.5M3 13h10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// --- Légende ---

export interface EntreeLegende {
  libelle: string;
  couleur: string;
  /** « contour » : repère vide (cercle ou contour), « point » : petit point plein. */
  forme?: "plein" | "contour" | "point";
}

export function Legende({ entrees }: { entrees: EntreeLegende[] }): JSX.Element {
  return (
    <ul className="legende">
      {entrees.map((e) => (
        <li key={e.libelle}>
          <span
            className={`legende__repere legende__repere--${e.forme ?? "plein"}`}
            style={e.forme === "contour" ? { borderColor: e.couleur } : { background: e.couleur }}
          />
          {e.libelle}
        </li>
      ))}
    </ul>
  );
}

// --- États ---

/** État « chargement » : des blocs à la forme de la page, avec un reflet qui passe. */
export function Chargement({ blocs = 3 }: { blocs?: number }): JSX.Element {
  return (
    <div className="chargement" role="status" aria-live="polite">
      <span className="visuellement-cache">Chargement des données…</span>
      <div className="squelette squelette--titre" />
      <div className="squelette squelette--ligne" />
      <div className="chargement__blocs">
        {Array.from({ length: blocs }, (_, i) => (
          <div key={i} className="squelette squelette--bloc" style={{ animationDelay: `${i * 120}ms` }} />
        ))}
      </div>
      <div className="squelette squelette--grand" />
    </div>
  );
}

export function ErreurDonnees({ message }: { message: string }): JSX.Element {
  return (
    <div className="erreur" role="alert">
      <h2>Les données ne sont pas disponibles</h2>
      <p>
        L'application lit des fichiers JSON produits par le pipeline. Ils sont absents ou illisibles (<code>{message}</code>).
      </p>
      <p>
        Pour les reconstruire : <code>uv run python -m pipeline.exporter_web</code> à la racine du dépôt, puis recharger la page.
      </p>
    </div>
  );
}

/** Affiche le chargement, l'erreur, ou le contenu une fois les données prêtes. */
export function Donnees<T>({ etat, blocs, children }: { etat: Etat<T>; blocs?: number; children: (donnees: T) => ReactNode }): JSX.Element {
  if (etat.etat === "chargement") return <Chargement {...(blocs === undefined ? {} : { blocs })} />;
  if (etat.etat === "erreur") return <ErreurDonnees message={etat.message} />;
  return <>{children(etat.donnees)}</>;
}
