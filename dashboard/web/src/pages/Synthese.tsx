/** Synthèse d'une page, pensée pour l'impression : « Télécharger en PDF » ouvre l'impression du navigateur. */

import { Barres, type Barre } from "../charts/Barres";
import { ChartCard, Donnees, IconeTelecharger, KpiCard, Legende, SectionTitle } from "../components/Briques";
import { Terme } from "../components/Glossaire";
import { ContenuInfobulle } from "../components/Infobulle";
import { COULEURS, NIVEAUX } from "../constantes";
import { tous, useDonnees } from "../lib/donnees";
import { comparaison, jourCourt, nombre, periode, plageHeures, pluriel, pourcent } from "../lib/format";
import { bilanSeuil } from "../lib/simulateur";
import { moyenne, somme } from "../lib/stats";
import type { Meta, Recit, Seuils, Synthese as DonneesSynthese } from "../types/donnees";

function Page({ s, seuils, recit, meta }: { s: DonneesSynthese; seuils: Seuils; recit: Recit; meta: Meta }): JSX.Element {
  const saisons = periode(s.saisons);
  const ref = s.seuil_reference;
  const bilans = seuils.seuils.map((seuil) => bilanSeuil(seuils.lignes, "departement", seuil, 0));
  const bilanRef = bilans.find((b) => b.seuil === ref) ?? bilans[0]!;
  const [debut, fin] = s.plage_patrouille;
  const h = s.historique;
  const prioritaires = recit.communes_hors_marseille.filter((c) => c.prioritaire);

  const totalCouverts = somme(s.feux_par_heure.map((x) => x.nb_feux_couverts));
  const moyenneHeure = moyenne(s.feux_par_heure.map((x) => x.nb_feux_couverts));
  const barresHeures: Barre[] = s.feux_par_heure.map((x) => ({
    cle: String(x.heure),
    etiquette: `${x.heure} h`,
    valeur: x.nb_feux_couverts,
    couleur: x.heure >= debut && x.heure < fin ? COULEURS.accent : COULEURS.neutre,
    infobulle: () => (
      <ContenuInfobulle
        surtitre={x.heure >= debut && x.heure < fin ? "Dans la plage de patrouille" : "Hors plage de patrouille"}
        titre={`De ${x.heure} h à ${x.heure + 1} h`}
        valeur={pluriel(x.nb_feux_couverts, "alerte")}
        lignes={[
          { libelle: `Part des alertes des jours de niveau ${ref} ou plus`, valeur: pourcent(x.nb_feux_couverts, totalCouverts) },
          { libelle: "Face à une heure moyenne", valeur: comparaison(x.nb_feux_couverts, moyenneHeure) },
          { libelle: "Tous jours confondus", valeur: pluriel(x.nb_feux, "alerte") },
        ]}
      />
    ),
  }));

  return (
    <article className="synthese">
      <div className="synthese__entete">
        <SectionTitle
          surtitre={`Synthèse · SDIS 13 · saison feux 2027`}
          titre="Quel seuil de déclenchement, et où concentrer les moyens ?"
          chapeau={`Ce que montrent les feux de ${h.annee_debut} à ${h.annee_fin} et les saisons ${saisons} de la Météo des forêts, en une page.`}
        />
        <button type="button" className="bouton bouton--principal sans-impression" onClick={() => window.print()}>
          <IconeTelecharger />
          Télécharger en PDF
        </button>
      </div>

      <section className="synthese__bloc">
        <h2>L'essentiel</h2>
        <ol className="synthese__messages">
          <li>
            <strong>
              Avec un seuil au niveau {ref}, {pourcent(bilanRef.feuxManques, bilanRef.feuxPeriode)} des feux partent un jour sans renfort
            </strong>{" "}
            ({nombre(bilanRef.feuxManques)} sur {nombre(bilanRef.feuxPeriode)} en {saisons}). Les jours de renfort sans feu sont rares :{" "}
            {nombre(bilanRef.joursSansFeu)} sur {nombre(bilanRef.joursRenfort)}.
          </li>
          <li>
            <strong>
              {h.communes_prioritaires} communes sur {h.communes_avec_feu} regroupent {pourcent(h.feux_prioritaires, h.feux_hors_marseille, 0)} des feux
            </strong>{" "}
            depuis {h.annee_debut}, hors Marseille : c'est là que concentrer patrouilles et guet.
          </li>
          <li>
            <strong>Un seuil fixe ne garantit pas un budget fixe</strong> : au niveau {ref}, {bilanRef.saisons.map((x) => `${x.joursRenfort} jours de renfort en ${x.annee}`).join(" et ")}.
          </li>
        </ol>
      </section>

      <section className="synthese__bloc">
        <h2>Les trois indicateurs, saisons {saisons}</h2>
        <div className="grille-kpi grille-kpi--3">
          <KpiCard
            ton="accent"
            libelle={<>I3 · Feux couverts par le <Terme id="seuil-de-declenchement">seuil</Terme> (niveau {ref})</>}
            valeur={pourcent(bilanRef.feuxCouverts, bilanRef.feuxPeriode)}
            detail={`${nombre(bilanRef.feuxCouverts)} feux sur ${nombre(bilanRef.feuxPeriode)} partis un jour de niveau ${ref} ou plus, pour ${nombre(bilanRef.joursRenfort)} jours de renfort`}
          />
          <KpiCard
            libelle={`I2 · Alertes entre ${plageHeures(debut, fin)}, jours de niveau ${ref} ou plus`}
            valeur={pourcent(s.i2.numerateur, s.i2.denominateur)}
            detail={`${nombre(s.i2.numerateur)} alertes sur ${nombre(s.i2.denominateur)}. Plage donnée en exemple : les plages réelles de patrouille restent à collecter`}
          />
          <KpiCard
            libelle={<>I1 · <Terme id="grand-feu">Grands feux</Terme> dans les communes prioritaires</>}
            valeur={pourcent(s.i1.numerateur, s.i1.denominateur)}
            detail={`${nombre(s.i1.numerateur)} feux de plus de ${nombre(s.grand_feu_ha)} ha sur ${nombre(s.i1.denominateur)}. Autres communes : ${pourcent(s.i1_autres.numerateur, s.i1_autres.denominateur)} (${nombre(s.i1_autres.numerateur)} sur ${nombre(s.i1_autres.denominateur)})`}
          />
        </div>
      </section>

      <section className="synthese__bloc">
        <h2>Ce que coûte et ce que couvre chaque seuil</h2>
        <table className="tableau tableau--large">
          <thead>
            <tr>
              <th scope="col">Seuil</th>
              <th scope="col">Feux couverts</th>
              <th scope="col">Feux manqués</th>
              {s.saisons.map((a) => (
                <th key={a} scope="col">
                  Jours de renfort {a}
                </th>
              ))}
              <th scope="col">Dont jours sans feu</th>
            </tr>
          </thead>
          <tbody>
            {bilans.map((b) => (
              <tr key={b.seuil} className={b.seuil === ref ? "tableau__ligne--accent" : ""}>
                <th scope="row">
                  <span className="pastille" style={{ background: NIVEAUX[b.seuil].couleur }} />
                  Niveau {b.seuil} ou plus ({NIVEAUX[b.seuil].nom.toLowerCase()})
                </th>
                <td>
                  <strong>{pourcent(b.feuxCouverts, b.feuxPeriode)}</strong> ({nombre(b.feuxCouverts)})
                </td>
                <td>{nombre(b.feuxManques)}</td>
                {b.saisons.map((x) => (
                  <td key={x.annee}>
                    {x.joursRenfort} sur {x.joursBulletin}
                  </td>
                ))}
                <td>
                  {nombre(b.joursSansFeu)} sur {nombre(b.joursRenfort)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="note">
          Dénominateur : les {nombre(s.feux_periode)} feux partis pendant la période de publication de l'indice. {nombre(s.feux_hors_periode)} autres feux (
          {pourcent(s.feux_hors_periode, s.feux)}) sont partis hors de cette période : aucun seuil ne peut les couvrir.
        </p>
      </section>

      <div className="synthese__duo">
        <ChartCard
          titre={`${pourcent(s.i2.numerateur, s.i2.denominateur, 0)} des alertes des jours de renfort tombent entre ${plageHeures(debut, fin)}`}
          sousTitre={`Feux par heure de première alerte, jours de niveau ${ref} ou plus, saisons ${saisons}`}
          source="Sources : BDIFF et Météo des forêts. Le fuseau horaire de l'heure d'alerte n'est pas vérifié."
          nomFichier="sdis13-synthese-heures"
          entete={
            <Legende
              entrees={[
                { libelle: `Entre ${plageHeures(debut, fin)}`, couleur: COULEURS.accent },
                { libelle: "Autres heures", couleur: COULEURS.neutre },
              ]}
            />
          }
        >
          <Barres barres={barresHeures} hauteur={250} largeurEtiquette={42} description={`Alertes par heure les jours de niveau ${ref} ou plus.`} />
        </ChartCard>

        <section className="synthese__bloc synthese__communes">
          <h2>Les {prioritaires.length} communes prioritaires</h2>
          <ol>
            {prioritaires.map((c) => (
              <li key={c.code_insee}>
                <span>{c.nom}</span>
                <span>{nombre(c.nb_feux)}</span>
              </li>
            ))}
          </ol>
          <p className="note">
            Nombre de feux de {h.annee_debut} à {h.annee_fin}. Marseille, défendue par le <Terme id="bmpm">BMPM</Terme>, est hors liste.
          </p>
        </section>
      </div>

      <section className="synthese__bloc">
        <h2>Ce que ces chiffres ne disent pas</h2>
        <ul className="synthese__limites">
          <li>
            <strong>Le seuil actuel, le budget et le coût d'une journée de renfort ne nous ont pas été communiqués.</strong> Le niveau {ref} sert d'exemple, et
            les coûts sont exprimés en jours, pas en euros.
          </li>
          <li>
            <strong>{s.saisons.length} saisons seulement se croisent</strong> entre la Météo des forêts et la BDIFF ({nombre(bilanRef.joursBulletin)} jours) : un
            écart peut tenir à une année particulière.
          </li>
          <li>
            <strong>On mesure une règle, pas le dispositif réel</strong> : aucune source n'enregistre les jours où le SDIS a effectivement renforcé.
          </li>
          <li>
            <strong>L'heure est celle de la première alerte</strong>, qui arrive après le départ du feu ; le lieu est la commune, pas le massif.
          </li>
        </ul>
      </section>

      <footer className="synthese__pied">
        <p>
          Sources : {meta.sources.map((x) => `${x.nom} (${x.detail})`).join(" ; ")}. Données exportées le {jourCourt(meta.date_export)}. Projet HETIC, UE01 :
          Ramdane Chaba, Ghiles Mekdam, Ouissem Aouimeur.
        </p>
      </footer>
    </article>
  );
}

export default function Synthese(): JSX.Element {
  const etat = tous(useDonnees("synthese"), useDonnees("seuils"), useDonnees("recit"), useDonnees("meta"));
  return (
    <div className="contenu">
      <Donnees etat={etat} blocs={3}>
        {([s, seuils, recit, meta]) => <Page s={s} seuils={seuils} recit={recit} meta={meta} />}
      </Donnees>
    </div>
  );
}
