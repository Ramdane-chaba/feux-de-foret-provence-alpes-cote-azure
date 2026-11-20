/**
 * Calendrier d'une saison, façon « contributions » : une colonne par semaine, une ligne par jour de la
 * semaine, un carré par jour coloré selon le niveau de danger, et un point quand un feu est parti.
 */

import { ContenuInfobulle, useInfobulle } from "../components/Infobulle";
import { JOURS_SEMAINE, MOIS, NIVEAUX } from "../constantes";
import { comparaison, hectares, jourLong, nombre, nombre1, pluriel, versDate } from "../lib/format";
import { useLargeur } from "../lib/hooks";
import type { Jour, Seuil } from "../types/donnees";

export type Filtre = "tous" | "manques" | "sans-feu";

interface Props {
  annee: number;
  jours: Jour[];
  seuil: Seuil;
  filtre: Filtre;
  /** Moyenne de feux par jour de la saison, pour la comparaison de l'infobulle. */
  moyenneFeuxParJour: number;
}

const UN_JOUR = 86_400_000;
const GAUCHE = 34;
const HAUT = 22;

/** Lundi = 0 … dimanche = 6. */
const rangJour = (date: Date): number => (date.getUTCDay() + 6) % 7;

/** Un jour répond-il au filtre ? */
export function correspond(jour: Jour, seuil: Seuil, filtre: Filtre): boolean {
  if (filtre === "manques") return jour.niveau < seuil && jour.nb_feux > 0;
  if (filtre === "sans-feu") return jour.niveau >= seuil && jour.nb_feux === 0;
  return true;
}

export function CalendrierSaison({ annee, jours, seuil, filtre, moyenneFeuxParJour }: Props): JSX.Element {
  const [ref, largeur] = useLargeur<HTMLDivElement>();
  const infobulle = useInfobulle();
  const premier = jours[0];
  if (!premier) return <div ref={ref} />;

  const debut = versDate(premier.jour);
  const lundi = debut.getTime() - rangJour(debut) * UN_JOUR;
  const semaineDe = (j: Jour): number => Math.floor((versDate(j.jour).getTime() - lundi) / (7 * UN_JOUR));
  const nbSemaines = semaineDe(jours[jours.length - 1]!) + 1;
  const pas = Math.max(14, Math.min(40, Math.floor((largeur - GAUCHE) / nbSemaines)));
  const cote = pas - 3;
  const hauteur = HAUT + 7 * pas + 4;

  // Étiquette du mois au-dessus de la première semaine qui contient le 1er (ou du début de la saison).
  const mois = new Map<number, string>();
  mois.set(0, MOIS[debut.getUTCMonth()]!);
  for (const j of jours) {
    const d = versDate(j.jour);
    if (d.getUTCDate() === 1 && semaineDe(j) > 1) mois.set(semaineDe(j), MOIS[d.getUTCMonth()]!);
  }

  return (
    <div ref={ref} className="graphique__zone">
      <svg data-export viewBox={`0 0 ${largeur} ${hauteur}`} width={largeur} height={hauteur} role="img" aria-label={`Calendrier de la saison ${annee} : niveau de danger de chaque jour et jours avec feu.`}>
        {[...mois].map(([semaine, nom]) => (
          <text key={semaine} className="axe__texte" x={GAUCHE + semaine * pas} y={12}>
            {nom}
          </text>
        ))}
        {JOURS_SEMAINE.map((nom, i) =>
          i % 2 === 0 ? (
            <text key={nom} className="axe__texte" x={GAUCHE - 8} y={HAUT + i * pas + cote / 2} dy="0.32em" textAnchor="end">
              {nom}
            </text>
          ) : null,
        )}
        {jours.map((j) => {
          const x = GAUCHE + semaineDe(j) * pas;
          const y = HAUT + rangJour(versDate(j.jour)) * pas;
          const niveau = NIVEAUX[j.niveau];
          const retenu = correspond(j, seuil, filtre);
          const renfort = j.niveau >= seuil;
          return (
            <g key={j.jour} className={`calendrier__jour${retenu ? "" : " calendrier__jour--attenue"}`} transform={`translate(${x},${y})`}>
              <rect className="calendrier__case" width={cote} height={cote} rx={Math.min(5, cote / 5)} fill={niveau.couleur} />
              {j.nb_feux > 0 && (
                // Le point grossit avec le nombre de feux (aire proportionnelle), dans la limite de la case.
                <circle className="calendrier__feu" cx={cote / 2} cy={cote / 2} r={Math.min(cote / 2 - 2, cote * 0.14 * Math.sqrt(j.nb_feux) + 1)} />
              )}
              <rect
                className="zone-survol calendrier__survol"
                x={-1.5}
                y={-1.5}
                width={pas}
                height={pas}
                rx={5}
                tabIndex={0}
                {...infobulle.sur(() => (
                  <ContenuInfobulle
                    surtitre={jourLong(j.jour)}
                    titre={`Niveau ${j.niveau} · ${niveau.nom}`}
                    valeur={j.nb_feux === 0 ? "Aucun feu" : pluriel(j.nb_feux, "feu", "feux")}
                    lignes={[
                      { libelle: `Seuil au niveau ${seuil}`, valeur: renfort ? (j.nb_feux > 0 ? "renfort, feux couverts" : "renfort sans feu") : j.nb_feux > 0 ? "pas de renfort : feux manqués" : "pas de renfort" },
                      ...(j.nb_feux > 0
                        ? [
                            { libelle: "Face à un jour moyen", valeur: comparaison(j.nb_feux, moyenneFeuxParJour, "la moyenne de la saison") },
                            { libelle: "Surface parcourue", valeur: hectares(j.surface_ha) },
                          ]
                        : []),
                      ...(j.tx_max_c === null ? [] : [{ libelle: "Température maximale", valeur: `${nombre1(j.tx_max_c)} °C` }]),
                      ...(j.un_min_pct === null ? [] : [{ libelle: "Humidité minimale", valeur: `${nombre(j.un_min_pct)} %` }]),
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
