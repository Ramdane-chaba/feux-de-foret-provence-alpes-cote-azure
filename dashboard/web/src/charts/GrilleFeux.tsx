/**
 * Un point par feu, rangé par niveau de danger du jour. Les feux partis sous le seuil (sans renfort)
 * sont dessinés en creux, les feux couverts en plein : déplacer le seuil vide ou remplit des blocs entiers.
 */

import { useInfobulle, ContenuInfobulle } from "../components/Infobulle";
import { LISTE_NIVEAUX, NIVEAUX } from "../constantes";
import { nombre, nombre1, pluriel, pourcent } from "../lib/format";
import { useLargeur } from "../lib/hooks";
import { somme } from "../lib/stats";
import type { Niveau, Seuil } from "../types/donnees";

interface Props {
  /** Nombre de feux par niveau de danger du jour. */
  feux: Record<Niveau, number>;
  /** Nombre de jours de bulletin par niveau. */
  jours: Record<Niveau, number>;
  seuil: Seuil;
}

const ESPACE_BLOCS = 22;
/** En dessous de ces largeurs, les libellés passent sur une ligne de plus pour ne pas se chevaucher. */
const LARGEUR_BLOC_ETROIT = 185;
const LARGEUR_ACCOLADES_EMPILEES = 600;

export function GrilleFeux({ feux, jours, seuil }: Props): JSX.Element {
  const [ref, largeur] = useLargeur<HTMLDivElement>();
  const infobulle = useInfobulle();
  const total = somme(LISTE_NIVEAUX.map((n) => feux[n]));
  const totalJours = somme(LISTE_NIVEAUX.map((n) => jours[n]));
  const largeurBloc = (largeur - ESPACE_BLOCS * (LISTE_NIVEAUX.length - 1)) / LISTE_NIVEAUX.length;
  const pas = Math.max(8, Math.min(15, largeurBloc / 13));
  const colonnes = Math.max(1, Math.floor(largeurBloc / pas));
  const rayon = pas * 0.36;
  const lignesMax = Math.max(1, ...LISTE_NIVEAUX.map((n) => Math.ceil(feux[n] / colonnes)));
  const etroit = largeurBloc < LARGEUR_BLOC_ETROIT;
  const empile = largeur < LARGEUR_ACCOLADES_EMPILEES;
  const yAccolade = empile ? 38 : 20;
  const yNiveau = yAccolade + 22;
  const haut = yNiveau + (etroit ? 46 : 28);
  const hauteur = haut + lignesMax * pas + 12;

  const xBloc = (n: Niveau): number => (n - 1) * (largeurBloc + ESPACE_BLOCS);
  const manques = somme(LISTE_NIVEAUX.filter((n) => n < seuil).map((n) => feux[n]));
  const couverts = total - manques;
  // Limite entre « sans renfort » et « couverts » : au milieu de l'espace entre deux blocs.
  const xSeuil = xBloc(seuil) - ESPACE_BLOCS / 2;

  return (
    <div ref={ref} className="graphique__zone">
      <svg
        data-export
        viewBox={`0 0 ${largeur} ${hauteur}`}
        width={largeur}
        height={hauteur}
        role="img"
        aria-label={`${nombre(total)} feux rangés par niveau de danger. Seuil au niveau ${seuil} : ${nombre(manques)} feux sans renfort, ${nombre(couverts)} feux couverts.`}
      >
        {/* Accolades : sans renfort / couverts */}
        <g className="grille-feux__accolades">
          <line className="accolade accolade--manque" x1={0} x2={Math.max(0, xSeuil - 8)} y1={yAccolade} y2={yAccolade} />
          <text className="annotation" x={0} y={12}>
            Sans renfort : {pluriel(manques, "feu", "feux")} ({pourcent(manques, total)})
          </text>
          <line className="accolade accolade--couvert" x1={xSeuil + 8} x2={largeur} y1={yAccolade} y2={yAccolade} />
          <text className="annotation annotation--accent" x={largeur} y={empile ? 30 : 12} textAnchor="end">
            Couverts : {pluriel(couverts, "feu", "feux")} ({pourcent(couverts, total)})
          </text>
          <line className="repere__ligne grille-feux__seuil" x1={xSeuil} x2={xSeuil} y1={yAccolade - 14} y2={hauteur} />
        </g>

        {LISTE_NIVEAUX.map((n) => {
          const couvert = n >= seuil;
          const info = NIVEAUX[n];
          const moyenneParJour = totalJours === 0 ? 0 : total / totalJours;
          const parJour = jours[n] === 0 ? 0 : feux[n] / jours[n];
          return (
            <g key={n} transform={`translate(${xBloc(n)},0)`}>
              <text className="grille-feux__niveau" y={yNiveau}>
                <tspan className="pastille-texte" fill={info.couleur}>
                  ●{" "}
                </tspan>
                Niveau {n}
                {etroit ? "" : ` · ${info.nom}`}
              </text>
              <text className="grille-feux__compte" y={yNiveau + 16}>
                {etroit ? info.nom : `${pluriel(feux[n], "feu", "feux")} · ${pluriel(jours[n], "jour")}`}
              </text>
              {etroit && (
                <text className="grille-feux__compte" y={yNiveau + 32}>
                  {pluriel(feux[n], "feu", "feux")} · {nombre(jours[n])} j
                </text>
              )}
              <g transform={`translate(0,${haut})`}>
                {Array.from({ length: feux[n] }, (_, i) => (
                  <circle
                    key={i}
                    className={`grille-feux__point${couvert ? " grille-feux__point--couvert" : ""}`}
                    cx={(i % colonnes) * pas + pas / 2}
                    cy={Math.floor(i / colonnes) * pas + pas / 2}
                    r={rayon}
                    fill={info.couleur}
                    stroke={info.couleur}
                  />
                ))}
              </g>
              <rect
                className="zone-survol"
                x={-6}
                y={yNiveau - 14}
                width={largeurBloc + 12}
                height={hauteur - yNiveau + 14}
                tabIndex={0}
                {...infobulle.sur(() => (
                  <ContenuInfobulle
                    surtitre={couvert ? "Jours de renfort à ce seuil" : "Jours sans renfort à ce seuil"}
                    titre={`Niveau ${n} · ${info.nom}`}
                    valeur={pluriel(feux[n], "feu", "feux")}
                    lignes={[
                      { libelle: "Part des feux de la période", valeur: pourcent(feux[n], total) },
                      { libelle: "Jours à ce niveau", valeur: `${nombre(jours[n])} (${pourcent(jours[n], totalJours, 0)} de la saison)` },
                      { libelle: "Feux par jour", valeur: `${nombre1(parJour)} (moyenne de la saison : ${nombre1(moyenneParJour)})` },
                    ]}
                  />
                ))}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
