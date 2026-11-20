/**
 * Un point par jour sous le seuil : température maximale en abscisse, humidité minimale en ordonnée.
 * Les jours où un feu est parti (feux manqués) sont pleins, les jours sans feu sont en creux.
 */

import { scaleLinear } from "d3-scale";
import { ContenuInfobulle, useInfobulle } from "../components/Infobulle";
import { COULEURS, NIVEAUX } from "../constantes";
import { jourLong, nombre, nombre1, pluriel } from "../lib/format";
import { useLargeur } from "../lib/hooks";
import { moyenne } from "../lib/stats";
import type { Jour } from "../types/donnees";

export interface JourMeteo extends Jour {
  tx_max_c: number;
  un_min_pct: number;
}

interface Props {
  /** Jours sous le seuil, avec une température et une humidité mesurées. */
  jours: JourMeteo[];
  hauteur: number;
}

export interface MoyennesMeteo {
  n: number;
  temperature: number;
  humidite: number;
  pluieVeille: number;
}

export function moyennesMeteo(jours: readonly JourMeteo[]): MoyennesMeteo {
  return {
    n: jours.length,
    temperature: moyenne(jours.map((j) => j.tx_max_c)),
    humidite: moyenne(jours.map((j) => j.un_min_pct)),
    pluieVeille: moyenne(jours.map((j) => j.rr_veille_mm ?? 0)),
  };
}

export function NuageMeteo({ jours, hauteur }: Props): JSX.Element {
  const [ref, largeur] = useLargeur<HTMLDivElement>();
  const infobulle = useInfobulle();
  const marge = { haut: 20, droite: 20, bas: 46, gauche: 52 };
  const l = Math.max(10, largeur - marge.gauche - marge.droite);
  const h = hauteur - marge.haut - marge.bas;

  const tx = jours.map((j) => j.tx_max_c);
  const un = jours.map((j) => j.un_min_pct);
  const x = scaleLinear().domain([Math.min(...tx), Math.max(...tx)]).nice().range([0, l]);
  const y = scaleLinear().domain([0, Math.max(...un)]).nice().range([h, 0]);

  const avecFeu = jours.filter((j) => j.nb_feux > 0);
  const sansFeu = jours.filter((j) => j.nb_feux === 0);
  const mAvec = moyennesMeteo(avecFeu);
  const mSans = moyennesMeteo(sansFeu);
  // L'étiquette de chaque moyenne s'écarte de l'autre : à droite pour la plus chaude, à gauche pour l'autre.
  const avecADroite = mAvec.temperature >= mSans.temperature;

  const point = (j: JourMeteo, plein: boolean): JSX.Element => (
    <circle
      key={j.jour}
      className={`nuage__point${plein ? " nuage__point--feu" : ""}`}
      cx={x(j.tx_max_c)}
      cy={y(j.un_min_pct)}
      r={plein ? 4 + Math.min(3, Math.sqrt(j.nb_feux) - 1) : 4}
      tabIndex={0}
      {...infobulle.sur(() => (
        <ContenuInfobulle
          surtitre={jourLong(j.jour)}
          titre={j.nb_feux > 0 ? `${pluriel(j.nb_feux, "feu parti", "feux partis")} sans renfort` : "Aucun feu ce jour-là"}
          lignes={[
            { libelle: "Niveau prévu la veille", valeur: `${j.niveau} · ${NIVEAUX[j.niveau].nom}`, couleur: NIVEAUX[j.niveau].couleur },
            { libelle: "Température maximale", valeur: `${nombre1(j.tx_max_c)} °C (moy. des jours sans feu : ${nombre1(mSans.temperature)} °C)` },
            { libelle: "Humidité minimale", valeur: `${nombre(j.un_min_pct)} % (moy. des jours sans feu : ${nombre(mSans.humidite)} %)` },
            ...(j.rr_veille_mm === null ? [] : [{ libelle: "Pluie de la veille", valeur: `${nombre1(j.rr_veille_mm)} mm` }]),
          ]}
        />
      ))}
    />
  );

  const repereMoyenne = (m: MoyennesMeteo, libelle: string, plein: boolean, aDroite: boolean): JSX.Element => (
    <g transform={`translate(${x(m.temperature)},${y(m.humidite)})`} pointerEvents="none">
      <path className={`nuage__moyenne${plein ? " nuage__moyenne--feu" : ""}`} d="M0,-9L9,0L0,9L-9,0Z" />
      <text className="annotation annotation--fond" x={aDroite ? 15 : -15} y={plein ? 18 : -12} textAnchor={aDroite ? "start" : "end"}>
        {libelle} : {nombre1(m.temperature)} °C · {nombre(m.humidite)} %
      </text>
    </g>
  );

  return (
    <div ref={ref} className="graphique__zone">
      <svg
        data-export
        viewBox={`0 0 ${largeur} ${hauteur}`}
        width={largeur}
        height={hauteur}
        role="img"
        aria-label={`Jours sous le seuil. Avec feu : ${nombre1(mAvec.temperature)} °C et ${nombre(mAvec.humidite)} % d'humidité en moyenne. Sans feu : ${nombre1(mSans.temperature)} °C et ${nombre(mSans.humidite)} %.`}
      >
        <g transform={`translate(${marge.gauche},${marge.haut})`}>
          {y.ticks(5).map((t) => (
            <g key={t} transform={`translate(0,${y(t)})`}>
              <line className={t === 0 ? "axe__base" : "axe__grille"} x2={l} />
              <text className="axe__texte" x={-8} dy="0.32em" textAnchor="end">
                {t} %
              </text>
            </g>
          ))}
          {x.ticks(Math.max(3, Math.floor(l / 90))).map((t) => (
            <text key={t} className="axe__texte" x={x(t)} y={h + 18} textAnchor="middle">
              {t} °C
            </text>
          ))}
          <text className="axe__titre" x={l} y={h + 38} textAnchor="end">
            Température maximale du jour →
          </text>
          <text className="axe__titre" x={-marge.gauche + 2} y={-8}>
            ↑ Humidité minimale
          </text>
          <text className="annotation annotation--discret" x={l} y={h - 8} textAnchor="end" fill={COULEURS.encreDiscrete}>
            chaud et sec ↘
          </text>

          {sansFeu.map((j) => point(j, false))}
          {avecFeu.map((j) => point(j, true))}
          {sansFeu.length > 0 && repereMoyenne(mSans, "Moyenne sans feu", false, !avecADroite)}
          {avecFeu.length > 0 && repereMoyenne(mAvec, "Moyenne avec feu", true, avecADroite)}
        </g>
      </svg>
    </div>
  );
}
