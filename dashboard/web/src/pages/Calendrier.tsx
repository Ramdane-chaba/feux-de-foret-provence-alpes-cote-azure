/** Heatmap calendrier : un carré par jour de saison, coloré par niveau de danger, un point quand un feu est parti. */

import { useMemo, useState } from "react";
import { CalendrierSaison, correspond, type Filtre } from "../charts/CalendrierSaison";
import { ChartCard, Donnees, KpiCard, Legende, SectionTitle, type EntreeLegende } from "../components/Briques";
import { Terme } from "../components/Glossaire";
import { COULEURS, LISTE_NIVEAUX, NIVEAUX } from "../constantes";
import { useDonnees } from "../lib/donnees";
import { nombre, periode, pluriel, pourcent } from "../lib/format";
import { somme } from "../lib/stats";
import type { Jours, Seuil } from "../types/donnees";

const LEGENDE: EntreeLegende[] = [
  ...LISTE_NIVEAUX.map((n) => ({ libelle: `${n} · ${NIVEAUX[n].nom}`, couleur: NIVEAUX[n].couleur })),
  { libelle: "Au moins un feu (point plus gros : plus de feux)", couleur: COULEURS.fond, forme: "point" as const },
];

function Tableau({ donnees }: { donnees: Jours }): JSX.Element {
  const [seuil, setSeuil] = useState<Seuil>(donnees.seuil_reference);
  const [filtre, setFiltre] = useState<Filtre>("tous");
  const { jours, saisons } = donnees;

  const faits = useMemo(() => {
    const feux = (liste: typeof jours): number => somme(liste.map((j) => j.nb_feux));
    const verts = jours.filter((j) => j.niveau === 1);
    const vertsAvecFeu = verts.filter((j) => j.nb_feux > 0);
    const manques = jours.filter((j) => correspond(j, seuil, "manques"));
    const sansFeu = jours.filter((j) => correspond(j, seuil, "sans-feu"));
    const renfort = jours.filter((j) => j.niveau >= seuil);
    return {
      total: feux(jours),
      joursVerts: verts.length,
      joursVertsAvecFeu: vertsAvecFeu.length,
      feuxVerts: feux(vertsAvecFeu),
      joursManques: manques.length,
      feuxManques: feux(manques),
      joursSansFeu: sansFeu.length,
      joursRenfort: renfort.length,
    };
  }, [jours, seuil]);

  const filtres: { cle: Filtre; libelle: string }[] = [
    { cle: "tous", libelle: "Tous les jours" },
    { cle: "manques", libelle: `Feux partis sous le seuil (${nombre(faits.joursManques)} jours)` },
    { cle: "sans-feu", libelle: `Renfort sans feu (${nombre(faits.joursSansFeu)} jours)` },
  ];

  return (
    <>
      <SectionTitle
        surtitre="Calendrier des saisons"
        titre="Les feux partis les jours « verts »"
        chapeau={
          <>
            Un carré par jour de bulletin des saisons {periode(saisons)}, coloré selon le <Terme id="niveau-j-1">niveau prévu la veille</Terme>. Un point noir
            signale un jour où au moins un feu est parti.
          </>
        }
      />

      <div className="grille-kpi grille-kpi--3">
        <KpiCard
          ton="accent"
          libelle="Feux partis un jour « vert »"
          valeur={nombre(faits.feuxVerts)}
          detail={`sur ${pluriel(faits.joursVertsAvecFeu, "jour")} parmi les ${nombre(faits.joursVerts)} jours de niveau 1 (${pourcent(faits.joursVertsAvecFeu, faits.joursVerts, 0)} de ces jours ont connu un feu)`}
        />
        <KpiCard
          libelle={<Terme id="feu-manque">Feux manqués au niveau {seuil}</Terme>}
          valeur={nombre(faits.feuxManques)}
          detail={`${pourcent(faits.feuxManques, faits.total)} des ${nombre(faits.total)} feux de la période, partis sur ${pluriel(faits.joursManques, "jour")} sans renfort`}
        />
        <KpiCard
          libelle={<Terme id="fausse-alerte">Jours de renfort sans feu</Terme>}
          valeur={nombre(faits.joursSansFeu)}
          detail={faits.joursRenfort === 0 ? "aucun jour de renfort à ce seuil" : `sur ${pluriel(faits.joursRenfort, "jour")} de renfort au niveau ${seuil} (${pourcent(faits.joursSansFeu, faits.joursRenfort)})`}
        />
      </div>

      <div className="barre-filtres sans-impression">
        <div className="segments" role="group" aria-label="Seuil de déclenchement">
          <span className="segments__titre">Seuil</span>
          {donnees.seuils.map((s) => (
            <label key={s} className={seuil === s ? "segments__actif" : ""}>
              <input type="radio" name="seuil-calendrier" checked={seuil === s} onChange={() => setSeuil(s)} />
              Niveau {s}
            </label>
          ))}
        </div>
        <div className="segments" role="group" aria-label="Mettre en évidence">
          <span className="segments__titre">Mettre en évidence</span>
          {filtres.map((f) => (
            <label key={f.cle} className={filtre === f.cle ? "segments__actif" : ""}>
              <input type="radio" name="filtre-calendrier" checked={filtre === f.cle} onChange={() => setFiltre(f.cle)} />
              {f.libelle}
            </label>
          ))}
        </div>
      </div>

      <div className="calendriers">
        {saisons.map((annee) => {
          const saison = jours.filter((j) => j.annee === annee);
          const feux = somme(saison.map((j) => j.nb_feux));
          const sousSeuil = somme(saison.filter((j) => j.niveau < seuil).map((j) => j.nb_feux));
          const renfort = saison.filter((j) => j.niveau >= seuil).length;
          return (
            <ChartCard
              key={annee}
              titre={`Saison ${annee} : ${nombre(sousSeuil)} feux sur ${nombre(feux)} sont partis un jour sans renfort`}
              sousTitre={`${pluriel(renfort, "jour")} de renfort sur ${nombre(saison.length)} avec un seuil au niveau ${seuil}. Une colonne par semaine, du lundi au dimanche`}
              source="Sources : BDIFF et archives de la Météo des forêts (Météo-France), Bouches-du-Rhône."
              nomFichier={`sdis13-calendrier-${annee}-seuil-${seuil}`}
              entete={<Legende entrees={LEGENDE} />}
            >
              <CalendrierSaison annee={annee} jours={saison} seuil={seuil} filtre={filtre} moyenneFeuxParJour={saison.length === 0 ? 0 : feux / saison.length} />
            </ChartCard>
          );
        })}
      </div>
      <p className="note">
        Le niveau est celui que le bulletin de la veille annonçait pour le jour (décision D016), et il vaut pour tout le département. Les feux partis avant ou
        après la période de publication de l'indice n'ont pas de niveau : ils n'apparaissent pas dans ce calendrier.
      </p>
    </>
  );
}

export default function Calendrier(): JSX.Element {
  const etat = useDonnees("jours");
  return (
    <div className="contenu contenu--large">
      <Donnees etat={etat} blocs={3}>
        {(donnees) => <Tableau donnees={donnees} />}
      </Donnees>
    </div>
  );
}
