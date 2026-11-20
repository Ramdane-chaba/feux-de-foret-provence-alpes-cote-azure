/** Carte des communes du département : teinte selon les feux de l'année, communes prioritaires cerclées d'orange. */

import { interpolateRgbBasis } from "d3-interpolate";
import { scaleSqrt } from "d3-scale";
import { useMemo } from "react";
import { ContenuInfobulle, useInfobulle } from "../components/Infobulle";
import { RAMPE_CARTE } from "../constantes";
import type { ContoursCommunes } from "../lib/donnees";
import { comparaison, hectares, pluriel, pourcent } from "../lib/format";
import { useLargeur } from "../lib/hooks";
import type { CommuneCarte } from "../types/donnees";

interface Props {
  contours: ContoursCommunes;
  communes: Map<string, CommuneCarte>;
  annee: number;
  /** Indice de l'année dans les tableaux `feux_par_annee`. */
  indiceAnnee: number;
  /** Plus grand nombre de feux d'une commune sur une année : l'échelle ne change pas d'une année à l'autre. */
  maximum: number;
  /** Total des feux du département cette année-là, et moyenne par commune touchée. */
  totalAnnee: number;
  selection: string | null;
  onSelection: (code: string | null) => void;
}

const rampe = interpolateRgbBasis([...RAMPE_CARTE]);
const BORD = 6;
const HAUTEUR_MAX = 660;

interface Emprise {
  xMin: number;
  yMax: number;
  largeur: number;
  hauteur: number;
  rapport: number;
  /** Facteur appliqué aux longitudes : à cette latitude, un degré de longitude est plus court qu'un degré de latitude. */
  kx: number;
}

/**
 * Projection plane locale (équirectangulaire centrée sur le département) : à l'échelle d'un département,
 * elle se confond avec Mercator, et elle évite la dépendance à l'ordre des sommets du GeoJSON.
 */
function empriseDe(contours: ContoursCommunes): Emprise {
  let lonMin = Infinity;
  let lonMax = -Infinity;
  let latMin = Infinity;
  let latMax = -Infinity;
  for (const f of contours.features)
    for (const polygone of f.geometry.coordinates)
      for (const [lon, lat] of polygone[0] ?? []) {
        lonMin = Math.min(lonMin, lon!);
        lonMax = Math.max(lonMax, lon!);
        latMin = Math.min(latMin, lat!);
        latMax = Math.max(latMax, lat!);
      }
  const kx = Math.cos((((latMin + latMax) / 2) * Math.PI) / 180);
  const largeur = (lonMax - lonMin) * kx;
  const hauteur = latMax - latMin;
  return { xMin: lonMin * kx, yMax: latMax, largeur, hauteur, rapport: largeur / hauteur, kx };
}

/** Couleur d'une commune : racine carrée, pour distinguer 1 feu de 0 sans écraser les grandes valeurs. */
export function echelleCarte(maximum: number): (valeur: number) => string {
  const t = scaleSqrt().domain([0, Math.max(1, maximum)]).range([0, 1]).clamp(true);
  return (valeur) => rampe(t(valeur));
}

export function CarteCommunes({ contours, communes, annee, indiceAnnee, maximum, totalAnnee, selection, onSelection }: Props): JSX.Element {
  const [ref, largeur] = useLargeur<HTMLDivElement>(720);
  const infobulle = useInfobulle();
  const emprise = useMemo(() => empriseDe(contours), [contours]);
  const hauteur = Math.round(Math.min(largeur / emprise.rapport, HAUTEUR_MAX));

  // Les tracés ne sont recalculés que si la taille change, pas à chaque année.
  const traces = useMemo(() => {
    const echelle = Math.min((largeur - 2 * BORD) / emprise.largeur, (hauteur - 2 * BORD) / emprise.hauteur);
    const dx = (largeur - emprise.largeur * echelle) / 2;
    const dy = (hauteur - emprise.hauteur * echelle) / 2;
    const point = ([lon, lat]: number[]): string =>
      `${(dx + (lon! * emprise.kx - emprise.xMin) * echelle).toFixed(1)},${(dy + (emprise.yMax - lat!) * echelle).toFixed(1)}`;
    return contours.features.map((f) => ({
      code: f.properties.code,
      nom: f.properties.nom,
      d: f.geometry.coordinates.map((polygone) => polygone.map((anneau) => `M${anneau.map(point).join("L")}Z`).join("")).join(""),
    }));
  }, [contours, emprise, largeur, hauteur]);

  const couleur = echelleCarte(maximum);
  const touchees = [...communes.values()].filter((c) => (c.feux_par_annee[indiceAnnee] ?? 0) > 0).length;
  const moyenne = touchees === 0 ? 0 : totalAnnee / touchees;

  const dessiner = (t: (typeof traces)[number], calque: "fond" | "prioritaire" | "selection"): JSX.Element | null => {
    const commune = communes.get(t.code);
    const feux = commune?.feux_par_annee[indiceAnnee] ?? 0;
    if (calque === "prioritaire") return commune?.prioritaire ? <path key={t.code} className="carte__prioritaire" d={t.d} /> : null;
    if (calque === "selection") return t.code === selection ? <path key={t.code} className="carte__selection" d={t.d} /> : null;
    return (
      <path
        key={t.code}
        className="carte__commune"
        d={t.d}
        fill={couleur(feux)}
        tabIndex={0}
        role="button"
        aria-label={`${t.nom} : ${pluriel(feux, "feu", "feux")} en ${annee}`}
        aria-pressed={t.code === selection}
        onClick={() => onSelection(t.code === selection ? null : t.code)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelection(t.code === selection ? null : t.code);
          }
        }}
        {...infobulle.sur(() => (
          <ContenuInfobulle
            surtitre={`${annee}${commune?.prioritaire ? " · commune prioritaire" : ""}${commune?.est_marseille ? " · défendue par le BMPM" : ""}`}
            titre={t.nom}
            valeur={feux === 0 ? "Aucun feu" : pluriel(feux, "feu", "feux")}
            lignes={
              feux === 0
                ? [{ libelle: "Sur toute la période", valeur: commune ? pluriel(commune.nb_feux, "feu", "feux") : "aucun feu recensé" }]
                : [
                    { libelle: "Part des feux du département", valeur: pourcent(feux, totalAnnee) },
                    { libelle: "Face aux communes touchées", valeur: comparaison(feux, moyenne) },
                    { libelle: "Surface parcourue", valeur: hectares(commune?.ha_par_annee[indiceAnnee] ?? 0) },
                  ]
            }
            note="Cliquer pour ouvrir la fiche de la commune"
          />
        ))}
      />
    );
  };

  return (
    <div ref={ref} className="graphique__zone">
      <svg data-export viewBox={`0 0 ${largeur} ${hauteur}`} width={largeur} height={hauteur} role="group" aria-label={`Carte des communes des Bouches-du-Rhône : feux de l'année ${annee}.`}>
        <g>{traces.map((t) => dessiner(t, "fond"))}</g>
        {/* Calques au-dessus : un contour ne passe jamais sous la commune voisine. */}
        <g pointerEvents="none">{traces.map((t) => dessiner(t, "prioritaire"))}</g>
        <g pointerEvents="none">{traces.map((t) => dessiner(t, "selection"))}</g>
      </svg>
    </div>
  );
}
