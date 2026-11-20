/** Simulateur de décision : un seuil, un budget en jours de renfort, et le verdict en direct. */

import { useId, useMemo, useState } from "react";
import { BarresBudget, COULEURS_SAISONS } from "../charts/BarresBudget";
import { GrilleFeux } from "../charts/GrilleFeux";
import { ChartCard, Donnees, KpiCard, Legende, SectionTitle } from "../components/Briques";
import { Terme } from "../components/Glossaire";
import { NIVEAUX, PART_BUDGET_INITIAL } from "../constantes";
import { tous, useDonnees } from "../lib/donnees";
import { nombre, periode, pluriel, pourcent } from "../lib/format";
import { bilanSeuil, meilleurSeuil, verdict } from "../lib/simulateur";
import { somme } from "../lib/stats";
import type { Jours, Niveau, Perimetre, Seuil, Seuils } from "../types/donnees";

const PERIMETRES: { cle: Perimetre; libelle: string }[] = [
  { cle: "departement", libelle: "Département entier" },
  { cle: "hors_marseille", libelle: "Hors Marseille" },
];

function Tableau({ seuils, jours }: { seuils: Seuils; jours: Jours }): JSX.Element {
  const joursParSaison = Math.max(...seuils.lignes.map((l) => l.jours_bulletin));
  const [seuil, setSeuil] = useState<Seuil>(seuils.seuil_reference);
  const [budget, setBudget] = useState(Math.round(joursParSaison * PART_BUDGET_INITIAL));
  const [perimetre, setPerimetre] = useState<Perimetre>("departement");
  const idSeuil = useId();
  const idBudget = useId();

  const bilans = useMemo(() => seuils.seuils.map((s) => bilanSeuil(seuils.lignes, perimetre, s, budget)), [seuils, perimetre, budget]);
  const bilan = bilans.find((b) => b.seuil === seuil) ?? bilans[0]!;
  const meilleur = meilleurSeuil(bilans);
  const v = verdict(bilan, budget);
  const saisons = periode(seuils.saisons);
  const seuilMin = Math.min(...seuils.seuils);
  const seuilMax = Math.max(...seuils.seuils);

  const { feuxParNiveau, joursParNiveau } = useMemo(() => {
    const compter = (valeur: (n: Niveau) => number): Record<Niveau, number> => ({ 1: valeur(1), 2: valeur(2), 3: valeur(3), 4: valeur(4) });
    return {
      feuxParNiveau: compter((n) => somme(jours.jours.filter((j) => j.niveau === n).map((j) => (perimetre === "departement" ? j.nb_feux : j.nb_feux_hors_marseille)))),
      joursParNiveau: compter((n) => jours.jours.filter((j) => j.niveau === n).length),
    };
  }, [jours, perimetre]);

  return (
    <>
      <SectionTitle
        surtitre="Simulateur de décision"
        titre="Quel seuil tient dans votre budget ?"
        chapeau={
          <>
            Choisissez un <Terme id="seuil-de-declenchement">seuil de déclenchement</Terme> et un budget en <Terme id="jour-de-renfort">jours de renfort</Terme>{" "}
            par saison. Les résultats rejouent les saisons {saisons} : ce qui se serait passé si la règle avait été appliquée.
          </>
        }
      />

      <div className="simulateur">
        <aside className="simulateur__reglages carte-survol" aria-label="Réglages">
          <div className="reglage">
            <label htmlFor={idSeuil}>
              Seuil de déclenchement
              <output htmlFor={idSeuil}>
                <span className="pastille" style={{ background: NIVEAUX[seuil].couleur }} />
                Niveau {seuil} · {NIVEAUX[seuil].nom}
              </output>
            </label>
            <input
              id={idSeuil}
              type="range"
              min={seuilMin}
              max={seuilMax}
              step={1}
              value={seuil}
              onChange={(e) => setSeuil(Number(e.target.value) as Seuil)}
              aria-valuetext={`Niveau ${seuil}, ${NIVEAUX[seuil].nom}`}
            />
            <div className="reglage__graduations" aria-hidden="true">
              {seuils.seuils.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
            <p className="reglage__aide">Le renfort est déclenché les jours où le niveau prévu la veille atteint ce seuil.</p>
          </div>

          <div className="reglage">
            <label htmlFor={idBudget}>
              Budget par saison
              <output htmlFor={idBudget}>{pluriel(budget, "jour de renfort", "jours de renfort")}</output>
            </label>
            <input
              id={idBudget}
              type="range"
              min={0}
              max={joursParSaison}
              step={1}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              aria-valuetext={`${budget} jours sur ${joursParSaison}`}
            />
            <div className="reglage__graduations" aria-hidden="true">
              <span>0</span>
              <span>{Math.round(joursParSaison / 2)}</span>
              <span>{joursParSaison}</span>
            </div>
            <p className="reglage__aide">
              Une saison compte {nombre(joursParSaison)} jours de bulletin. Le budget réel du SDIS 13 ne nous est pas connu : le curseur part de la moitié de
              la saison.
            </p>
          </div>

          <fieldset className="reglage">
            <legend>
              Périmètre des feux <Terme id="bmpm">(BMPM)</Terme>
            </legend>
            <div className="segments">
              {PERIMETRES.map((p) => (
                <label key={p.cle} className={perimetre === p.cle ? "segments__actif" : ""}>
                  <input type="radio" name="perimetre" value={p.cle} checked={perimetre === p.cle} onChange={() => setPerimetre(p.cle)} />
                  {p.libelle}
                </label>
              ))}
            </div>
            <p className="reglage__aide">Le niveau de danger reste celui de tout le département : seuls les feux comptés changent.</p>
          </fieldset>
        </aside>

        <div className="simulateur__resultats">
          <div className={`verdict verdict--${v.tient ? "bon" : "alerte"}`} role="status" aria-live="polite">
            <span className="verdict__icone" aria-hidden="true">
              {v.tient ? "✓" : "!"}
            </span>
            <div>
              <p className="verdict__phrase">{v.phrase}</p>
              <p className="verdict__detail">
                {v.detail}{" "}
                {meilleur === null
                  ? `Aucun seuil ne tient dans ce budget sur les ${seuils.saisons.length} saisons.`
                  : meilleur === seuil
                    ? "C'est le seuil qui couvre le plus de feux parmi ceux qui tiennent dans ce budget."
                    : `Le meilleur seuil compatible avec ce budget est le niveau ${meilleur}.`}
              </p>
            </div>
            {meilleur !== null && meilleur !== seuil && (
              <button type="button" className="bouton bouton--contour" onClick={() => setSeuil(meilleur)}>
                Passer au niveau {meilleur}
              </button>
            )}
          </div>

          <div className="grille-kpi">
            <KpiCard
              ton="accent"
              libelle="Part des feux couverts"
              valeur={pourcent(bilan.feuxCouverts, bilan.feuxPeriode)}
              detail={`${nombre(bilan.feuxCouverts)} feux sur ${nombre(bilan.feuxPeriode)} partis un jour de renfort`}
            />
            <KpiCard
              libelle={<Terme id="feu-manque">Feux manqués</Terme>}
              valeur={nombre(bilan.feuxManques)}
              detail={`partis un jour sous le seuil, soit ${pourcent(bilan.feuxManques, bilan.feuxPeriode)} des feux`}
            />
            <KpiCard
              libelle={<Terme id="fausse-alerte">Jours de renfort sans feu</Terme>}
              valeur={nombre(bilan.joursSansFeu)}
              detail={bilan.joursRenfort === 0 ? "aucun jour de renfort à ce seuil" : `sur ${pluriel(bilan.joursRenfort, "jour")} de renfort (${pourcent(bilan.joursSansFeu, bilan.joursRenfort)})`}
            />
            <KpiCard
              ton={v.tient ? "bon" : "alerte"}
              libelle="Jours de renfort par saison"
              valeur={bilan.saisons.map((s) => s.joursRenfort).join(" · ")}
              detail={`${bilan.saisons.map((s) => s.annee).join(" · ")}, pour un budget de ${pluriel(budget, "jour")}`}
            />
          </div>

          <div className="choix-seuils" role="group" aria-label="Comparer les seuils">
            {bilans.map((b) => (
              <button
                key={b.seuil}
                type="button"
                className={`choix-seuil carte-survol${b.seuil === seuil ? " choix-seuil--choisi" : ""}${b.seuil === meilleur ? " choix-seuil--meilleur" : ""}`}
                onClick={() => setSeuil(b.seuil)}
                aria-pressed={b.seuil === seuil}
              >
                <span className="choix-seuil__entete">
                  <span>
                    <span className="pastille" style={{ background: NIVEAUX[b.seuil].couleur }} />
                    Seuil au niveau {b.seuil}
                  </span>
                  {b.seuil === meilleur && <span className="badge badge--bon">Meilleur seuil dans ce budget</span>}
                  {b.seuil !== meilleur && !b.tientDansLeBudget && <span className="badge badge--alerte">Dépasse de {pluriel(b.depassementMax, "jour")}</span>}
                  {b.seuil !== meilleur && b.tientDansLeBudget && <span className="badge">Tient, mais couvre moins</span>}
                </span>
                <span className="choix-seuil__valeur">{pourcent(b.feuxCouverts, b.feuxPeriode)}</span>
                <span className="choix-seuil__detail">
                  des feux couverts · {b.saisons.map((s) => `${s.joursRenfort} j en ${s.annee}`).join(", ")}
                </span>
              </button>
            ))}
          </div>

          <div className="grille-2">
            <ChartCard
              titre={
                bilan.tientDansLeBudget
                  ? `Au niveau ${seuil}, aucune saison ne dépasse ${pluriel(budget, "jour")} de renfort`
                  : `Au niveau ${seuil}, le renfort dépasse le budget de ${pluriel(bilan.depassementMax, "jour")}`
              }
              sousTitre={`Jours de renfort par saison selon le seuil, face au budget. Saisons ${saisons}`}
              source="Source : archives de la Météo des forêts (Météo-France), Bouches-du-Rhône."
              nomFichier={`sdis13-simulateur-budget-seuil-${seuil}`}
              entete={<Legende entrees={seuils.saisons.map((a, i) => ({ libelle: `Saison ${a}`, couleur: COULEURS_SAISONS[i % COULEURS_SAISONS.length]! }))} />}
            >
              <BarresBudget bilans={bilans} budget={budget} seuilChoisi={seuil} hauteur={340} />
            </ChartCard>
            <ChartCard
              titre={`Au niveau ${seuil}, ${nombre(bilan.feuxManques)} feux sur ${nombre(bilan.feuxPeriode)} partent un jour sans renfort`}
              sousTitre={`Un point par feu, selon le niveau prévu la veille. Plein : jour de renfort. Creux : jour sans renfort. Saisons ${saisons}`}
              source="Sources : BDIFF et archives de la Météo des forêts (Météo-France)."
              nomFichier={`sdis13-simulateur-feux-seuil-${seuil}`}
            >
              <GrilleFeux feux={feuxParNiveau} jours={joursParNiveau} seuil={seuil} />
            </ChartCard>
          </div>

          <p className="note">
            Lecture : un seuil « tient dans le budget » s'il ne le dépasse dans aucune des saisons mesurées. Une moyenne masquerait la saison la plus chargée, et
            le nombre de jours de renfort d'un même seuil varie beaucoup d'une saison à l'autre. Seules {seuils.saisons.length} saisons se croisent avec les feux :
            ces résultats décrivent le passé, ils ne prédisent pas la saison à venir.
          </p>
        </div>
      </div>
    </>
  );
}

export default function Simulateur(): JSX.Element {
  const etat = tous(useDonnees("seuils"), useDonnees("jours"));
  return (
    <div className="contenu contenu--large">
      <Donnees etat={etat} blocs={4}>
        {([seuils, jours]) => <Tableau seuils={seuils} jours={jours} />}
      </Donnees>
    </div>
  );
}
