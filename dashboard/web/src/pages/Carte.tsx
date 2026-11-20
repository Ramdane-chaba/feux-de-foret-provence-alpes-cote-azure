/** Carte animée des communes du département, année par année, avec la fiche de la commune choisie. */

import { useEffect, useMemo, useState } from "react";
import { Barres, type Barre } from "../charts/Barres";
import { CarteCommunes, echelleCarte } from "../charts/CarteCommunes";
import { ChartCard, Donnees, SectionTitle } from "../components/Briques";
import { Terme } from "../components/Glossaire";
import { ContenuInfobulle } from "../components/Infobulle";
import { COULEURS, DUREE_ANNEE_MS, MOIS, MOIS_LONGS, NB_HEURES_A_RISQUE, NB_MOIS_A_RISQUE } from "../constantes";
import { tous, useContours, useDonnees } from "../lib/donnees";
import { comparaison, hectares, listeEt, nombre, pluriel, pourcent } from "../lib/format";
import { indicesDesPlusGrands, moyenne, somme } from "../lib/stats";
import type { Carte as DonneesCarte, CommuneCarte, Meta } from "../types/donnees";

/** Barres miniatures de la fiche : les valeurs à risque sont en orange. */
function barresMini(valeurs: readonly number[], etiquettes: readonly string[], noms: readonly string[], enEvidence: ReadonlySet<number>, libelleMoyenne: string): Barre[] {
  const total = somme(valeurs);
  const moy = moyenne(valeurs);
  return valeurs.map((v, i) => ({
    cle: String(i),
    etiquette: etiquettes[i] ?? "",
    valeur: v,
    couleur: enEvidence.has(i) ? COULEURS.accent : COULEURS.neutre,
    infobulle: () => (
      <ContenuInfobulle
        titre={noms[i] ?? ""}
        valeur={pluriel(v, "feu", "feux")}
        lignes={[
          { libelle: "Part des feux de la commune", valeur: pourcent(v, total) },
          { libelle: libelleMoyenne, valeur: comparaison(v, moy) },
        ]}
      />
    ),
  }));
}

function Fiche({ commune, annees, indiceAnnee, onFermer }: { commune: CommuneCarte; annees: number[]; indiceAnnee: number; onFermer: () => void }): JSX.Element {
  const moisRisque = indicesDesPlusGrands(commune.feux_par_mois, NB_MOIS_A_RISQUE);
  const heuresRisque = indicesDesPlusGrands(commune.feux_par_heure, NB_HEURES_A_RISQUE);
  const feuxMois = somme(moisRisque.map((i) => commune.feux_par_mois[i] ?? 0));
  const feuxHeures = somme(heuresRisque.map((i) => commune.feux_par_heure[i] ?? 0));
  const heures = Array.from({ length: 24 }, (_, h) => h);
  const annee = annees[indiceAnnee];

  return (
    <article className="fiche" aria-live="polite">
      <header className="fiche__entete">
        <div>
          <p className="surtitre">Fiche commune · {commune.code}</p>
          <h2>{commune.nom}</h2>
        </div>
        <button type="button" className="bouton bouton--discret" onClick={onFermer} aria-label="Fermer la fiche">
          ✕
        </button>
      </header>
      <p className="fiche__badges">
        {commune.prioritaire && <span className="badge badge--accent">Commune prioritaire</span>}
        {commune.est_marseille && (
          <span className="badge">
            <Terme id="bmpm">Défendue par le BMPM</Terme>
          </span>
        )}
        {!commune.prioritaire && !commune.est_marseille && <span className="badge">Hors liste prioritaire</span>}
      </p>

      <dl className="fiche__chiffres">
        <div>
          <dt>Feux, {annees[0]}-{annees[annees.length - 1]}</dt>
          <dd>{nombre(commune.nb_feux)}</dd>
        </div>
        <div>
          <dt>Surface parcourue</dt>
          <dd>{hectares(commune.surface_ha)}</dd>
        </div>
        <div>
          <dt>Feux en {annee}</dt>
          <dd>{nombre(commune.feux_par_annee[indiceAnnee] ?? 0)}</dd>
        </div>
      </dl>

      <section>
        <h3>Feux par année</h3>
        <Barres
          compact
          hauteur={86}
          largeurEtiquette={38}
          description={`Feux par année à ${commune.nom}.`}
          barres={barresMini(commune.feux_par_annee, annees.map(String), annees.map(String), new Set([indiceAnnee]), "Face à une année moyenne")}
        />
      </section>
      <section>
        <h3>Mois à risque</h3>
        <p className="fiche__phrase">
          {moisRisque.length === 0 ? "Aucun feu recensé." : (
            <>
              <strong>{listeEt([...moisRisque].sort((a, b) => a - b).map((i) => MOIS_LONGS[i] ?? ""))}</strong> : {pourcent(feuxMois, commune.nb_feux, 0)} des feux
            </>
          )}
        </p>
        <Barres compact hauteur={76} largeurEtiquette={30} description={`Feux par mois à ${commune.nom}.`} barres={barresMini(commune.feux_par_mois, MOIS.map((m) => m.charAt(0).toUpperCase()), MOIS_LONGS, new Set(moisRisque), "Face à un mois moyen")} />
      </section>
      <section>
        <h3>Heures à risque</h3>
        <p className="fiche__phrase">
          {heuresRisque.length === 0 ? "Aucun feu recensé." : (
            <>
              <strong>{listeEt([...heuresRisque].sort((a, b) => a - b).map((h) => `${h} h`))}</strong> : {pourcent(feuxHeures, commune.nb_feux, 0)} des alertes
            </>
          )}
        </p>
        <Barres compact hauteur={76} largeurEtiquette={34} description={`Feux par heure de première alerte à ${commune.nom}.`} barres={barresMini(commune.feux_par_heure, heures.map((h) => `${h} h`), heures.map((h) => `De ${h} h à ${h + 1} h`), new Set(heuresRisque), "Face à une heure moyenne")} />
        <p className="note">
          Heure de la <Terme id="date-de-premiere-alerte">première alerte</Terme>, qui arrive après le départ réel du feu.
        </p>
      </section>
    </article>
  );
}

function Tableau({ carte, meta }: { carte: DonneesCarte; meta: Meta }): JSX.Element {
  const contours = useContours(meta.fond_de_carte ? meta.departement : null);
  const { annees } = carte;
  const dernier = annees.length - 1;
  const [indice, setIndice] = useState(dernier);
  const [lecture, setLecture] = useState(false);
  const [selection, setSelection] = useState<string | null>(null);

  const communes = useMemo(() => new Map(carte.communes.map((c) => [c.code, c])), [carte]);
  const totaux = useMemo(() => annees.map((_, i) => somme(carte.communes.map((c) => c.feux_par_annee[i] ?? 0))), [carte, annees]);
  const maximum = useMemo(() => Math.max(1, ...carte.communes.flatMap((c) => c.feux_par_annee)), [carte]);
  const prioritaires = useMemo(() => carte.communes.filter((c) => c.prioritaire).sort((a, b) => b.nb_feux - a.nb_feux), [carte]);

  // Lecture animée : une année à la fois, arrêt sur la dernière.
  useEffect(() => {
    if (!lecture) return;
    const minuteur = window.setInterval(() => {
      setIndice((i) => {
        if (i >= dernier) {
          setLecture(false);
          return i;
        }
        return i + 1;
      });
    }, DUREE_ANNEE_MS);
    return () => window.clearInterval(minuteur);
  }, [lecture, dernier]);

  const lire = (): void => {
    if (!lecture && indice >= dernier) setIndice(0);
    setLecture((l) => !l);
  };

  const annee = annees[indice]!;
  const total = totaux[indice] ?? 0;
  const feuxPrioritaires = somme(prioritaires.map((c) => c.feux_par_annee[indice] ?? 0));
  const maxTotal = Math.max(1, ...totaux);
  const moyenneTotal = moyenne(totaux);
  const couleur = echelleCarte(maximum);
  const commune = selection ? communes.get(selection) : undefined;
  const paliers = [0, 1, Math.round(maximum / 8), Math.round(maximum / 3), maximum].filter((v, i, t) => t.indexOf(v) === i);

  return (
    <>
      <SectionTitle
        surtitre="Carte des communes"
        titre="Où partent les feux, année après année"
        chapeau={`Lancez la lecture de ${annees[0]} à ${annees[dernier]} : les mêmes communes s'allument presque chaque année. Cliquez sur une commune pour ouvrir sa fiche.`}
      />
      <div className="carte">
        <ChartCard
          titre={`${annee} : ${pluriel(total, "feu", "feux")}, dont ${pourcent(feuxPrioritaires, total, 0)} dans les ${prioritaires.length} communes prioritaires`}
          sousTitre="Nombre de feux de forêt par commune des Bouches-du-Rhône, l'année choisie"
          source="Sources : BDIFF ; contours des communes : API Découpage administratif (geo.api.gouv.fr)."
          nomFichier={`sdis13-carte-${annee}`}
          entete={
            <div className="carte__legende">
              <span className="carte__paliers" aria-label={`Échelle : de 0 à ${maximum} feux par commune et par an`}>
                {paliers.map((p) => (
                  <span key={p}>
                    <i style={{ background: couleur(p) }} />
                    {p}
                  </span>
                ))}
                <em>feux par commune et par an</em>
              </span>
              <span className="carte__cle">
                <i className="carte__cle-prioritaire" />
                Commune prioritaire
              </span>
            </div>
          }
        >
          {contours.etat === "pret" ? (
            <CarteCommunes contours={contours.donnees} communes={communes} annee={annee} indiceAnnee={indice} maximum={maximum} totalAnnee={total} selection={selection} onSelection={setSelection} />
          ) : contours.etat === "chargement" ? (
            <div className="squelette squelette--carte" role="status" aria-label="Chargement du fond de carte" />
          ) : (
            <p className="erreur erreur--legere">
              Le fond de carte n'est pas disponible (il se télécharge avec <code>uv run python -m pipeline.exporter_web</code>). Les fiches restent accessibles par la
              liste des communes prioritaires.
            </p>
          )}

          <div className="frise sans-impression">
            <button type="button" className="bouton bouton--principal frise__lecture" onClick={lire} aria-label={lecture ? "Mettre en pause" : "Lancer la lecture année par année"}>
              <span aria-hidden="true">{lecture ? "❚❚" : "▶"}</span>
              {lecture ? "Pause" : "Lecture"}
            </button>
            <ol className="frise__annees" aria-label="Choisir une année">
              {annees.map((a, i) => (
                <li key={a}>
                  <button
                    type="button"
                    className={i === indice ? "actif" : ""}
                    onClick={() => {
                      setLecture(false);
                      setIndice(i);
                    }}
                    aria-current={i === indice}
                    aria-label={`${a} : ${pluriel(totaux[i] ?? 0, "feu", "feux")}`}
                    title={`${a} : ${pluriel(totaux[i] ?? 0, "feu", "feux")} (${comparaison(totaux[i] ?? 0, moyenneTotal)})`}
                  >
                    <i style={{ height: `${Math.max(4, ((totaux[i] ?? 0) / maxTotal) * 100)}%` }} />
                    <span>{i % 2 === 0 || i === dernier ? (i === 0 || i === dernier ? a : `’${String(a).slice(2)}`) : ""}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </ChartCard>

        <aside className="carte__panneau carte-survol">
          {commune ? (
            <Fiche commune={commune} annees={annees} indiceAnnee={indice} onFermer={() => setSelection(null)} />
          ) : (
            <div className="fiche fiche--vide">
              <p className="surtitre">Fiche commune</p>
              <h2>Choisissez une commune</h2>
              <p>
                Cliquez sur la carte, ou sur l'une des {prioritaires.length} communes prioritaires ci-dessous, pour voir ses feux, ses hectares, ses mois et ses
                heures à risque.
              </p>
              <ol className="fiche__liste">
                {prioritaires.map((c) => (
                  <li key={c.code}>
                    <button type="button" onClick={() => setSelection(c.code)}>
                      <span>{c.nom}</span>
                      <span>{pluriel(c.nb_feux, "feu", "feux")}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

export default function Carte(): JSX.Element {
  const etat = tous(useDonnees("carte"), useDonnees("meta"));
  return (
    <div className="contenu contenu--large">
      <Donnees etat={etat} blocs={2}>
        {([carte, meta]) => <Tableau carte={carte} meta={meta} />}
      </Donnees>
    </div>
  );
}
