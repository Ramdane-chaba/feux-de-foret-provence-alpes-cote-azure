/** Diagramme en barres générique : années, communes, heures, mois. Un seul axe, grille discrète. */

import { scaleBand, scaleLinear } from "d3-scale";
import type { ReactNode } from "react";
import { useInfobulle } from "../components/Infobulle";
import { nombre } from "../lib/format";
import { useLargeur } from "../lib/hooks";

export interface Barre {
  cle: string;
  /** Étiquette sous la barre (l'axe n'en affiche qu'une partie si la place manque). */
  etiquette: string;
  valeur: number;
  couleur: string;
  infobulle: () => ReactNode;
  /** Valeur écrite au-dessus de la barre (à réserver à quelques barres). */
  etiquetteValeur?: string;
}

interface Props {
  barres: Barre[];
  hauteur: number;
  /** Description lue par les lecteurs d'écran. */
  description: string;
  /** Ligne horizontale de référence (une moyenne, par exemple). Le libellé (une ligne par élément) s'écrit dans la marge de droite. */
  repere?: { valeur: number; libelle: string[] };
  /** Trait vertical après la barre d'indice `apres`, avec un libellé de chaque côté. */
  separateur?: { apres: number; avant: string; ensuite: string };
  /** Version miniature : pas d'axe vertical ni de grille. */
  compact?: boolean;
  /** Largeur approximative d'une étiquette de l'axe horizontal, pour éviter les chevauchements. */
  largeurEtiquette?: number;
  titreY?: string;
}

/** Rectangle aux coins supérieurs arrondis, posé sur la ligne de base. */
export function cheminBarre(x: number, y: number, largeur: number, hauteur: number, rayon = 4): string {
  const r = Math.max(0, Math.min(rayon, largeur / 2, hauteur));
  return `M${x},${y + hauteur}V${y + r}Q${x},${y} ${x + r},${y}H${x + largeur - r}Q${x + largeur},${y} ${x + largeur},${y + r}V${y + hauteur}Z`;
}

export function Barres({ barres, hauteur, description, repere, separateur, compact = false, largeurEtiquette = 40, titreY }: Props): JSX.Element {
  const [ref, largeur] = useLargeur<HTMLDivElement>();
  const infobulle = useInfobulle();
  const marge = compact ? { haut: 6, droite: 2, bas: 18, gauche: 2 } : { haut: titreY ? 30 : 18, droite: repere ? 74 : 12, bas: 26, gauche: 40 };
  const l = Math.max(10, largeur - marge.gauche - marge.droite);
  const h = hauteur - marge.haut - marge.bas;

  const max = Math.max(1, ...barres.map((b) => b.valeur), repere?.valeur ?? 0);
  const x = scaleBand<string>().domain(barres.map((b) => b.cle)).range([0, l]).paddingInner(barres.length > 60 ? 0.25 : 0.18).paddingOuter(0.05);
  const y = scaleLinear().domain([0, max]).nice(compact ? 2 : 4).range([h, 0]);
  const graduations = y.ticks(4).filter((t) => Number.isInteger(t));
  const pas = Math.max(1, Math.ceil((barres.length * largeurEtiquette) / l));
  const bande = x.bandwidth();
  const xSeparateur = separateur ? (x(barres[separateur.apres]?.cle ?? "") ?? 0) + bande + (x.step() - bande) / 2 : 0;

  return (
    <div ref={ref} className="graphique__zone">
      <svg data-export viewBox={`0 0 ${largeur} ${hauteur}`} width={largeur} height={hauteur} role="img" aria-label={description}>
        <g transform={`translate(${marge.gauche},${marge.haut})`}>
          {titreY && (
            <text className="axe__titre" x={-marge.gauche + 2} y={-16}>
              {titreY}
            </text>
          )}
          {!compact &&
            graduations.map((t) => (
              <g key={t} transform={`translate(0,${y(t)})`}>
                <line className={t === 0 ? "axe__base" : "axe__grille"} x2={l} />
                <text className="axe__texte" x={-8} dy="0.32em" textAnchor="end">
                  {nombre(t)}
                </text>
              </g>
            ))}
          {compact && <line className="axe__base" y1={h} y2={h} x2={l} />}

          {barres.map((b, i) => {
            const bx = x(b.cle) ?? 0;
            const by = y(b.valeur);
            return (
              <g key={b.cle}>
                <path
                  className="barre"
                  d={cheminBarre(bx, by, bande, h - by, compact ? 2 : 4)}
                  fill={b.couleur}
                  style={{ animationDelay: `${Math.min(i * (compact ? 8 : 18), 500)}ms` }}
                />
                {b.etiquetteValeur && (
                  <text className="marque__valeur" x={bx + bande / 2} y={by - 6} textAnchor="middle">
                    {b.etiquetteValeur}
                  </text>
                )}
                {i % pas === 0 && (
                  <text className="axe__texte" x={bx + bande / 2} y={h + (compact ? 13 : 17)} textAnchor="middle">
                    {b.etiquette}
                  </text>
                )}
                {/* Zone de survol plus grande que la barre : toute la colonne. */}
                <rect
                  className="zone-survol"
                  x={bx - (x.step() - bande) / 2}
                  y={0}
                  width={x.step()}
                  height={h}
                  tabIndex={compact ? -1 : 0}
                  {...infobulle.sur(b.infobulle)}
                />
              </g>
            );
          })}

          {repere && (
            <g transform={`translate(0,${y(repere.valeur)})`} pointerEvents="none">
              <line className="repere__ligne" x2={l} />
              <text className="repere__texte" x={l + 8} y={repere.libelle.length > 1 ? -3 : 4}>
                {repere.libelle.map((ligne, i) => (
                  <tspan key={ligne} x={l + 8} dy={i === 0 ? 0 : 15}>
                    {ligne}
                  </tspan>
                ))}
              </text>
            </g>
          )}

          {separateur && (
            <g pointerEvents="none">
              <line className="repere__ligne" x1={xSeparateur} x2={xSeparateur} y1={-4} y2={h} />
              <text className="annotation annotation--accent" x={xSeparateur - 8} y={8} textAnchor="end">
                {separateur.avant}
              </text>
              <text className="annotation" x={xSeparateur + 8} y={8}>
                {separateur.ensuite}
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
