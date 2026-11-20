/** Jours de renfort par saison pour chaque seuil, face à la ligne du budget. */

import { scaleBand, scaleLinear } from "d3-scale";
import { ContenuInfobulle, useInfobulle } from "../components/Infobulle";
import { NIVEAUX } from "../constantes";
import { comparaison, nombre, pluriel, pourcent } from "../lib/format";
import { useLargeur } from "../lib/hooks";
import type { BilanSeuil } from "../lib/simulateur";
import { moyenne } from "../lib/stats";
import type { Seuil } from "../types/donnees";
import { cheminBarre } from "./Barres";

/** Couleurs des saisons (identité de la série, la même partout dans l'application). */
export const COULEURS_SAISONS = ["#38BDF8", "#FF8A3D", "#A78BFA"] as const;

interface Props {
  bilans: BilanSeuil[];
  budget: number;
  seuilChoisi: Seuil;
  hauteur: number;
}

export function BarresBudget({ bilans, budget, seuilChoisi, hauteur }: Props): JSX.Element {
  const [ref, largeur] = useLargeur<HTMLDivElement>();
  const infobulle = useInfobulle();
  const marge = { haut: 26, droite: 84, bas: 44, gauche: 40 };
  const l = Math.max(10, largeur - marge.gauche - marge.droite);
  const h = hauteur - marge.haut - marge.bas;

  const saisons = bilans[0]?.saisons.map((s) => s.annee) ?? [];
  const joursSaison = bilans[0]?.saisons[0]?.joursBulletin ?? 0;
  const max = Math.max(joursSaison, budget, ...bilans.flatMap((b) => b.saisons.map((s) => s.joursRenfort)));
  const x0 = scaleBand<Seuil>().domain(bilans.map((b) => b.seuil)).range([0, l]).paddingInner(0.3).paddingOuter(0.15);
  const x1 = scaleBand<number>().domain(saisons).range([0, x0.bandwidth()]).paddingInner(0.08);
  const y = scaleLinear().domain([0, max]).range([h, 0]);
  const yBudget = y(budget);
  const moyenneJours = moyenne(bilans.flatMap((b) => b.saisons.map((s) => s.joursRenfort)));

  return (
    <div ref={ref} className="graphique__zone">
      <svg
        data-export
        viewBox={`0 0 ${largeur} ${hauteur}`}
        width={largeur}
        height={hauteur}
        role="img"
        aria-label={`Jours de renfort par saison pour chaque seuil, comparés à un budget de ${budget} jours. ${bilans
          .map((b) => `Seuil ${b.seuil} : ${b.saisons.map((s) => `${s.joursRenfort} jours en ${s.annee}`).join(", ")}`)
          .join(". ")}.`}
      >
        <g transform={`translate(${marge.gauche},${marge.haut})`}>
          {y.ticks(4).map((t) => (
            <g key={t} transform={`translate(0,${y(t)})`}>
              <line className={t === 0 ? "axe__base" : "axe__grille"} x2={l} />
              <text className="axe__texte" x={-8} dy="0.32em" textAnchor="end">
                {t}
              </text>
            </g>
          ))}
          <text className="axe__titre" x={-marge.gauche + 2} y={-12}>
            Jours de renfort par saison
          </text>

          {bilans.map((b) => {
            const gx = x0(b.seuil) ?? 0;
            const choisi = b.seuil === seuilChoisi;
            return (
              <g key={b.seuil} transform={`translate(${gx},0)`}>
                {choisi && <rect className="budget__selection" x={-10} y={-8} width={x0.bandwidth() + 20} height={h + 44} rx={8} />}
                {b.saisons.map((s, i) => {
                  const bx = x1(s.annee) ?? 0;
                  const by = y(s.joursRenfort);
                  const couleur = COULEURS_SAISONS[i % COULEURS_SAISONS.length]!;
                  return (
                    <g key={s.annee}>
                      <path className="barre barre--transition" d={cheminBarre(bx, by, x1.bandwidth(), h - by, 4)} fill={couleur} />
                      <text className="marque__valeur" x={bx + x1.bandwidth() / 2} y={by - 6} textAnchor="middle">
                        {s.joursRenfort}
                      </text>
                      <rect
                        className="zone-survol"
                        x={bx}
                        y={0}
                        width={x1.bandwidth()}
                        height={h}
                        tabIndex={0}
                        {...infobulle.sur(() => (
                          <ContenuInfobulle
                            surtitre={`Saison ${s.annee}`}
                            titre={`Seuil au niveau ${b.seuil} · ${NIVEAUX[b.seuil].nom}`}
                            valeur={pluriel(s.joursRenfort, "jour de renfort", "jours de renfort")}
                            lignes={[
                              { libelle: "Part de la saison", valeur: pourcent(s.joursRenfort, s.joursBulletin, 0) },
                              { libelle: "Face au budget", valeur: s.depassement > 0 ? `dépasse de ${pluriel(s.depassement, "jour")}` : `marge de ${pluriel(budget - s.joursRenfort, "jour")}` },
                              { libelle: "Tous seuils et saisons", valeur: comparaison(s.joursRenfort, moyenneJours) },
                              { libelle: "Dont jours sans feu", valeur: nombre(s.joursSansFeu) },
                              { libelle: "Feux couverts", valeur: `${nombre(s.feuxCouverts)} sur ${nombre(s.feuxPeriode)} (${pourcent(s.feuxCouverts, s.feuxPeriode)})` },
                            ]}
                          />
                        ))}
                      />
                    </g>
                  );
                })}
                <text className={`budget__seuil${choisi ? " budget__seuil--choisi" : ""}`} x={x0.bandwidth() / 2} y={h + 20} textAnchor="middle">
                  Seuil {b.seuil}
                </text>
                <text className="axe__texte" x={x0.bandwidth() / 2} y={h + 36} textAnchor="middle">
                  {x0.step() > 200 ? `niveau « ${NIVEAUX[b.seuil].nom.toLowerCase()} » ou plus` : NIVEAUX[b.seuil].nom.toLowerCase()}
                </text>
              </g>
            );
          })}

          <g className="budget__ligne" style={{ transform: `translateY(${yBudget}px)` }} pointerEvents="none">
            <line className="budget__trait" x1={-6} x2={l + 4} />
            <text className="annotation" x={l + 8} y={-3}>
              <tspan x={l + 8}>Budget</tspan>
              <tspan x={l + 8} dy={15}>
                {pluriel(budget, "jour")}
              </tspan>
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
