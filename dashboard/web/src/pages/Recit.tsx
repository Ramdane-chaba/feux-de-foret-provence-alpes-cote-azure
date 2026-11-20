/**
 * L'histoire en 5 étapes (scrollytelling) : le texte défile à gauche, le graphique reste fixe à droite
 * et change à chaque étape. Tous les chiffres des textes sont calculés ici à partir des JSON.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Barres, type Barre } from "../charts/Barres";
import { GrilleFeux } from "../charts/GrilleFeux";
import { moyennesMeteo, NuageMeteo, type JourMeteo } from "../charts/NuageMeteo";
import { ChartCard, Donnees, Legende, SectionTitle, type EntreeLegende } from "../components/Briques";
import { Terme } from "../components/Glossaire";
import { ContenuInfobulle } from "../components/Infobulle";
import { useEtapesPresentation } from "../components/Presentation";
import { COULEURS, DEFINITION_ANNEE_SECHE, NIVEAUX } from "../constantes";
import { tous, useDonnees } from "../lib/donnees";
import { useHauteurDisponible } from "../lib/hooks";
import { comparaison, ecart, hectares, nombre, nombre1, periode, plageHeures, pluriel, pourcent } from "../lib/format";
import { bilanSeuil } from "../lib/simulateur";
import { correlation, mediane, moyenne, somme } from "../lib/stats";
import type { Jours, Niveau, Recit as DonneesRecit, Seuils, Synthese } from "../types/donnees";

interface Etape {
  id: string;
  titre: string;
  texte: ReactNode;
  /** Titre du graphique : la phrase que le graphique démontre. */
  titreGraphique: string;
  sousTitre: string;
  source: string;
  legende?: EntreeLegende[];
  graphique: ReactNode;
}

/** Hauteur prise autour du graphique dans la scène fixe : navigation, titre, légende, source, marges. */
const RESERVE_CARTE = 370;
const SOURCE_FEUX = "Source : BDIFF, feux de forêt des Bouches-du-Rhône.";

function useEtapes(recit: DonneesRecit, jours: Jours, seuils: Seuils, synthese: Synthese, hauteur: number): Etape[] {
  return useMemo(() => {
    const ref = seuils.seuil_reference;
    const saisons = periode(seuils.saisons);

    // --- Étape 1 : feux et pluie par année ---
    const annees = recit.annees;
    const historique = `${annees[0]?.annee ?? ""}-${annees[annees.length - 1]?.annee ?? ""}`;
    const medianePluie = mediane(annees.map((a) => a.pluie_mm));
    const seches = annees.filter((a) => a.pluie_mm < medianePluie);
    const arrosees = annees.filter((a) => a.pluie_mm >= medianePluie);
    const feuxSeches = moyenne(seches.map((a) => a.nb_feux));
    const feuxArrosees = moyenne(arrosees.map((a) => a.nb_feux));
    const moyenneFeux = moyenne(annees.map((a) => a.nb_feux));
    const totalFeux = somme(annees.map((a) => a.nb_feux));
    const r = correlation(annees.map((a) => a.pluie_mm), annees.map((a) => a.nb_feux));
    const record = annees.reduce((a, b) => (b.nb_feux > a.nb_feux ? b : a), annees[0]!);
    const barresAnnees: Barre[] = annees.map((a) => ({
      cle: String(a.annee),
      etiquette: String(a.annee),
      valeur: a.nb_feux,
      couleur: a.pluie_mm < medianePluie ? COULEURS.accent : COULEURS.neutre,
      infobulle: () => (
        <ContenuInfobulle
          surtitre={a.pluie_mm < medianePluie ? "Année sèche" : "Année plus arrosée"}
          titre={String(a.annee)}
          valeur={pluriel(a.nb_feux, "feu", "feux")}
          lignes={[
            { libelle: `Part des feux ${historique}`, valeur: pourcent(a.nb_feux, totalFeux) },
            { libelle: "Face à une année moyenne", valeur: comparaison(a.nb_feux, moyenneFeux) },
            { libelle: "Pluie de l'année", valeur: `${nombre(a.pluie_mm)} mm (médiane : ${nombre(medianePluie)} mm)` },
            { libelle: "Surface parcourue", valeur: hectares(a.surface_ha) },
          ]}
        />
      ),
    }));

    // --- Étape 2 : concentration par commune ---
    const communes = recit.communes_hors_marseille;
    const prioritaires = communes.filter((c) => c.prioritaire);
    const feuxHorsMarseille = somme(communes.map((c) => c.nb_feux));
    const feuxPrioritaires = somme(prioritaires.map((c) => c.nb_feux));
    const moyenneCommune = feuxHorsMarseille / communes.length;
    // Le trait de séparation n'est tracé que si les communes prioritaires sont bien les premières du classement.
    const contigues = communes.slice(0, prioritaires.length).every((c) => c.prioritaire);
    const barresCommunes: Barre[] = communes.map((c, i) => ({
      cle: c.code_insee,
      etiquette: "",
      valeur: c.nb_feux,
      couleur: c.prioritaire ? COULEURS.accent : COULEURS.neutre,
      infobulle: () => (
        <ContenuInfobulle
          surtitre={`${i + 1}ᵉ commune sur ${communes.length}${c.prioritaire ? " · prioritaire" : ""}`}
          titre={c.nom}
          valeur={pluriel(c.nb_feux, "feu", "feux")}
          lignes={[
            { libelle: "Part des feux hors Marseille", valeur: pourcent(c.nb_feux, feuxHorsMarseille) },
            { libelle: "Face à une commune moyenne", valeur: comparaison(c.nb_feux, moyenneCommune) },
            { libelle: "Surface parcourue", valeur: hectares(c.surface_ha) },
          ]}
        />
      ),
    }));
    const premiere = communes[0];

    // --- Étape 3 : ce que couvre le seuil de référence ---
    const compter = (valeur: (n: Niveau) => number): Record<Niveau, number> => ({ 1: valeur(1), 2: valeur(2), 3: valeur(3), 4: valeur(4) });
    const feuxParNiveau = compter((n) => somme(jours.jours.filter((j) => j.niveau === n).map((j) => j.nb_feux)));
    const joursParNiveau = compter((n) => jours.jours.filter((j) => j.niveau === n).length);
    const bilan = bilanSeuil(seuils.lignes, "departement", ref, 0);

    // --- Étape 4 : la météo des jours sous le seuil ---
    const sousSeuil = jours.jours.filter((j): j is JourMeteo => j.niveau < ref && j.tx_max_c !== null && j.un_min_pct !== null);
    const avecFeu = moyennesMeteo(sousSeuil.filter((j) => j.nb_feux > 0));
    const sansFeu = moyennesMeteo(sousSeuil.filter((j) => j.nb_feux === 0));

    // --- Étape 5 : recommandation ---
    const bilans = seuils.seuils.map((s) => bilanSeuil(seuils.lignes, "departement", s, 0));
    const [debutPlage, finPlage] = synthese.plage_patrouille;

    return [
      {
        id: "annees",
        titre: "Les feux augmentent les années sèches",
        texte: (
          <>
            <p>
              De {annees[0]?.annee} à {annees[annees.length - 1]?.annee}, la BDIFF recense {nombre(totalFeux)} feux de forêt dans les Bouches-du-Rhône, soit{" "}
              {nombre(moyenneFeux)} par an en moyenne. Mais d'une année à l'autre, le nombre de feux varie beaucoup : {nombre(record.nb_feux)} en {record.annee},
              l'année la plus chargée.
            </p>
            <p>
              La pluie explique une bonne part de ces écarts. Les {seches.length} années les plus sèches comptent en moyenne{" "}
              <strong>{nombre(feuxSeches)} feux</strong>, contre <strong>{nombre(feuxArrosees)}</strong> pour les {arrosees.length} années plus arrosées (
              {ecart(feuxSeches, feuxArrosees)}).
            </p>
            <p className="note">
              Corrélation entre la pluie de l'année et le nombre de feux : {nombre1(r).replace("-", "−")} sur {annees.length} années. Année sèche :{" "}
              {DEFINITION_ANNEE_SECHE} ({nombre(medianePluie)} mm, moyenne des stations Météo-France du département).
            </p>
          </>
        ),
        titreGraphique: `Les années sèches comptent ${nombre(feuxSeches)} feux en moyenne, les autres ${nombre(feuxArrosees)}`,
        sousTitre: `Nombre de feux de forêt par année, Bouches-du-Rhône, ${historique}`,
        source: `${SOURCE_FEUX} Pluie : données climatologiques quotidiennes de Météo-France.`,
        legende: [
          { libelle: `Année sèche (moins de ${nombre(medianePluie)} mm de pluie)`, couleur: COULEURS.accent },
          { libelle: "Année plus arrosée", couleur: COULEURS.neutre },
        ],
        graphique: (
          <Barres
            barres={barresAnnees}
            hauteur={hauteur}
            description={`Feux par année de ${historique}. Années sèches : ${nombre(feuxSeches)} feux en moyenne ; années plus arrosées : ${nombre(feuxArrosees)}.`}
            repere={{ valeur: moyenneFeux, libelle: ["moyenne", `${nombre(moyenneFeux)} feux`] }}
            largeurEtiquette={44}
          />
        ),
      },
      {
        id: "communes",
        titre: `${prioritaires.length} communes font la moitié des feux`,
        texte: (
          <>
            <p>
              Les départs de feu ne se répartissent pas au hasard. Hors Marseille, défendue par le <Terme id="bmpm">BMPM</Terme>, {communes.length} communes ont
              connu au moins un feu depuis {annees[0]?.annee}.
            </p>
            <p>
              <strong>
                {prioritaires.length} d'entre elles regroupent {pourcent(feuxPrioritaires, feuxHorsMarseille, 0)} des feux
              </strong>{" "}
              ({nombre(feuxPrioritaires)} sur {nombre(feuxHorsMarseille)}).{" "}
              {premiere && (
                <>
                  En tête, {premiere.nom} : {nombre(premiere.nb_feux)} feux à elle seule.
                </>
              )}
            </p>
            <p>C'est là que des patrouilles et du guet supplémentaires ont le plus de chances de se trouver près d'un départ de feu.</p>
            <p className="note">
              La liste des communes prioritaires est figée : l'indicateur porte sur les mêmes communes d'une saison à l'autre. La BDIFF localise un feu à la
              commune, pas au massif.
            </p>
          </>
        ),
        titreGraphique: `${prioritaires.length} communes sur ${communes.length} regroupent ${pourcent(feuxPrioritaires, feuxHorsMarseille, 0)} des feux`,
        sousTitre: `Nombre de feux par commune, de la plus touchée à la moins touchée, ${historique}, hors Marseille`,
        source: SOURCE_FEUX,
        legende: [
          { libelle: `Les ${prioritaires.length} communes prioritaires`, couleur: COULEURS.accent },
          { libelle: `Les ${communes.length - prioritaires.length} autres communes`, couleur: COULEURS.neutre },
        ],
        graphique: (
          <Barres
            barres={barresCommunes}
            hauteur={hauteur}
            description={`Feux par commune. ${prioritaires.length} communes prioritaires : ${pourcent(feuxPrioritaires, feuxHorsMarseille, 0)} des feux.`}
            titreY="Feux par commune"
            {...(contigues
              ? {
                  separateur: {
                    apres: prioritaires.length - 1,
                    avant: "",
                    ensuite: `${prioritaires.length} communes : ${pourcent(feuxPrioritaires, feuxHorsMarseille, 0)} des feux · les ${communes.length - prioritaires.length} suivantes : ${pourcent(feuxHorsMarseille - feuxPrioritaires, feuxHorsMarseille, 0)}`,
                  },
                }
              : {})}
          />
        ),
      },
      {
        id: "seuil",
        titre: `Au niveau ${ref}, le seuil laisse partir la moitié des feux`,
        texte: (
          <>
            <p>
              Le dispositif renforcé se déclenche quand le <Terme id="niveau-j-1">niveau prévu la veille</Terme> par la Météo des forêts atteint le{" "}
              <Terme id="seuil-de-declenchement">seuil</Terme>. Avec un seuil au niveau {ref}, il aurait été en place {nombre(bilan.joursRenfort)} jours sur{" "}
              {nombre(bilan.joursBulletin)} en {saisons}.
            </p>
            <p>
              Ces jours-là, {nombre(bilan.feuxCouverts)} feux sont partis. Mais{" "}
              <strong>
                {nombre(bilan.feuxManques)} autres ({pourcent(bilan.feuxManques, bilan.feuxPeriode)}) sont partis un jour sans renfort
              </strong>
              , dont {nombre(feuxParNiveau[1])} un jour « vert », au niveau le plus bas : ce sont les <Terme id="feu-manque">feux manqués</Terme>.
            </p>
            <p>
              À l'inverse, les jours de renfort sans aucun feu sont rares : {nombre(bilan.joursSansFeu)} sur {nombre(bilan.joursRenfort)}. Le premier défaut du
              seuil n'est pas de déclencher pour rien, c'est de laisser passer des feux.
            </p>
            <p className="note">
              Le seuil actuel du SDIS 13 ne nous a pas été communiqué : le niveau {ref} est une hypothèse de travail. {nombre(synthese.feux_hors_periode)} feux
              sur {nombre(synthese.feux)} sont partis hors de la période de publication de l'indice et n'apparaissent pas ici.
            </p>
          </>
        ),
        titreGraphique: `Seuil au niveau ${ref} : ${nombre(bilan.feuxManques)} feux sur ${nombre(bilan.feuxPeriode)} partent un jour sans renfort`,
        sousTitre: `Un point par feu, selon le niveau de danger prévu la veille. Plein : jour de renfort. Creux : jour sans renfort. Saisons ${saisons}`,
        source: "Sources : BDIFF et archives de la Météo des forêts (Météo-France), Bouches-du-Rhône.",
        graphique: <GrilleFeux feux={feuxParNiveau} jours={joursParNiveau} seuil={ref} />,
      },
      {
        id: "meteo",
        titre: "Les feux manqués partent par temps chaud et sec",
        texte: (
          <>
            <p>
              Que s'est-il passé les {nombre(sousSeuil.length)} jours restés sous le seuil ? Un feu est parti {nombre(avecFeu.n)} fois, et ces jours ne
              ressemblent pas aux autres.
            </p>
            <p>
              Les jours de feu manqué, il fait en moyenne <strong>{nombre1(avecFeu.temperature)} °C</strong> au plus chaud de la journée, contre{" "}
              {nombre1(sansFeu.temperature)} °C les jours sans feu. L'air y est plus sec ({nombre(avecFeu.humidite)} % d'humidité minimale contre{" "}
              {nombre(sansFeu.humidite)} %), et il a moins plu la veille ({nombre1(avecFeu.pluieVeille)} mm contre {nombre1(sansFeu.pluieVeille)} mm).
            </p>
            <p>Autrement dit : sous le seuil, la météo du jour dit encore quelque chose que le niveau de danger ne dit pas.</p>
            <p className="note">
              Température maximale et humidité minimale relevées sur les stations du département. Deux saisons seulement : l'écart est net en moyenne, mais les
              deux nuages se recouvrent largement.
            </p>
          </>
        ),
        titreGraphique: `Sous le seuil, les jours avec feu sont plus chauds (${nombre1(avecFeu.temperature)} °C contre ${nombre1(sansFeu.temperature)} °C) et plus secs`,
        sousTitre: `Un point par jour de niveau inférieur à ${ref}, saisons ${saisons}. Les losanges marquent les moyennes`,
        source: "Sources : BDIFF, Météo des forêts et données climatologiques quotidiennes (Météo-France).",
        legende: [
          { libelle: `Jour avec au moins un feu (${nombre(avecFeu.n)})`, couleur: COULEURS.accent },
          { libelle: `Jour sans feu (${nombre(sansFeu.n)})`, couleur: COULEURS.neutreClair, forme: "contour" },
        ],
        graphique: <NuageMeteo jours={sousSeuil} hauteur={hauteur + 20} />,
      },
      {
        id: "recommandation",
        titre: "Notre recommandation",
        texte: (
          <>
            <p>
              <strong>Ne pas monter le seuil au-dessus du niveau {ref}.</strong> Chaque niveau de plus économise des jours de renfort, mais laisse partir
              beaucoup plus de feux. Entre les seuils, c'est le budget qui tranche, et il se compte en{" "}
              <Terme id="jour-de-renfort">jours de renfort</Terme> par saison.
            </p>
            <p>
              <strong>Concentrer les moyens sur les {prioritaires.length} communes prioritaires</strong>, et sur l'après-midi : c'est là et à ces heures que
              part la majorité des feux.
            </p>
            <p>
              <strong>Regarder la météo les jours sous le seuil.</strong> Un jour chaud et sec de niveau inférieur à {ref} mérite une vigilance que le seul
              niveau de danger ne déclenche pas. Cette piste reste à chiffrer.
            </p>
            <p className="note">
              Trois informations manquent pour conclure, et seule la direction les détient : le seuil actuel, le budget de la saison et le coût d'une journée
              de renfort.
            </p>
          </>
        ),
        titreGraphique: "",
        sousTitre: "",
        source: "",
        graphique: (
          <div className="recommandation">
            <section>
              <p className="surtitre">Quels jours · le seuil</p>
              <table className="tableau">
                <thead>
                  <tr>
                    <th scope="col">Seuil</th>
                    <th scope="col">Feux couverts</th>
                    <th scope="col">Jours de renfort par saison</th>
                  </tr>
                </thead>
                <tbody>
                  {bilans.map((b) => (
                    <tr key={b.seuil} className={b.seuil === ref ? "tableau__ligne--accent" : ""}>
                      <th scope="row">
                        <span className="pastille" style={{ background: NIVEAUX[b.seuil].couleur }} />
                        Niveau {b.seuil} ou plus
                      </th>
                      <td>
                        <strong>{pourcent(b.feuxCouverts, b.feuxPeriode)}</strong>
                      </td>
                      <td>{b.saisons.map((s) => `${s.joursRenfort} en ${s.annee}`).join(" · ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            <div className="recommandation__duo">
              <section>
                <p className="surtitre">Où</p>
                <p className="recommandation__chiffre">{pourcent(feuxPrioritaires, feuxHorsMarseille, 0)}</p>
                <p>
                  des feux dans {prioritaires.length} communes sur {communes.length}
                </p>
              </section>
              <section>
                <p className="surtitre">À quelle heure</p>
                <p className="recommandation__chiffre">{pourcent(synthese.i2.numerateur, synthese.i2.denominateur, 0)}</p>
                <p>
                  des alertes des jours de niveau {ref} ou plus tombent entre {plageHeures(debutPlage, finPlage)}
                </p>
              </section>
            </div>
            <div className="recommandation__actions">
              <Link to="/simulateur" className="bouton bouton--principal">
                Tester un seuil et un budget <span aria-hidden="true">→</span>
              </Link>
              <Link to="/synthese" className="bouton bouton--contour">
                Lire la synthèse
              </Link>
            </div>
          </div>
        ),
      },
    ];
  }, [recit, jours, seuils, synthese, hauteur]);
}

function Histoire({ recit, jours, seuils, synthese }: { recit: DonneesRecit; jours: Jours; seuils: Seuils; synthese: Synthese }): JSX.Element {
  // Le graphique occupe la hauteur laissée par la fenêtre : il tient à l'écran à 720 px comme à 1080 px.
  const hauteur = useHauteurDisponible(RESERVE_CARTE, 240, 460);
  const etapes = useEtapes(recit, jours, seuils, synthese, hauteur);
  const [active, setActive] = useState(0);
  const sections = useRef<(HTMLElement | null)[]>([]);

  // L'étape active est celle dont le texte traverse le milieu de l'écran.
  useEffect(() => {
    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const entree of entrees) {
          if (entree.isIntersecting) setActive(Number((entree.target as HTMLElement).dataset.indice));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const section of sections.current) if (section) observateur.observe(section);
    return () => observateur.disconnect();
  }, [etapes.length]);

  const allerA = useCallback((indice: number) => {
    sections.current[indice]?.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, []);

  // Mode présentation : les flèches passent d'une étape à l'autre avant de changer de page.
  useEtapesPresentation(
    useCallback(
      (direction) => {
        const suivante = active + direction;
        if (suivante < 0 || suivante >= etapes.length) return false;
        allerA(suivante);
        return true;
      },
      [active, etapes.length, allerA],
    ),
  );

  const etape = etapes[active]!;

  return (
    <div className="recit">
      <div className="recit__texte">
        <SectionTitle
          surtitre="L'histoire en 5 étapes"
          titre="Pourquoi la moitié des feux échappe au dispositif"
          chapeau="Faites défiler : le graphique de droite change à chaque étape."
        />
        {etapes.map((e, i) => (
          <section
            key={e.id}
            ref={(el) => {
              sections.current[i] = el;
            }}
            data-indice={i}
            className={`recit__etape${i === active ? " recit__etape--active" : ""}`}
            aria-current={i === active ? "step" : undefined}
          >
            <p className="recit__numero">
              Étape {i + 1} sur {etapes.length}
            </p>
            <h2>{e.titre}</h2>
            {e.texte}
            {/* Sur petit écran, le graphique n'est plus fixe : il suit le texte de son étape. */}
            <div className="recit__graphique-mobile">{i === active && <Graphique etape={e} />}</div>
          </section>
        ))}
      </div>

      <div className="recit__scene">
        <div className="recit__fixe">
          <div key={etape.id} className="recit__apparition">
            <Graphique etape={etape} />
          </div>
          <ol className="recit__progression sans-impression" aria-label="Étapes du récit">
            {etapes.map((e, i) => (
              <li key={e.id}>
                <button type="button" className={i === active ? "actif" : ""} onClick={() => allerA(i)} aria-label={`Étape ${i + 1} : ${e.titre}`} aria-current={i === active ? "step" : undefined}>
                  <span>{i + 1}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function Graphique({ etape }: { etape: Etape }): JSX.Element {
  if (!etape.titreGraphique) return <div className="graphique graphique--libre">{etape.graphique}</div>;
  return (
    <ChartCard
      titre={etape.titreGraphique}
      sousTitre={etape.sousTitre}
      source={etape.source}
      nomFichier={`sdis13-recit-${etape.id}`}
      {...(etape.legende ? { entete: <Legende entrees={etape.legende} /> } : {})}
    >
      {etape.graphique}
    </ChartCard>
  );
}

export default function Recit(): JSX.Element {
  const etat = tous(useDonnees("recit"), useDonnees("jours"), useDonnees("seuils"), useDonnees("synthese"));
  return (
    <div className="contenu contenu--large">
      <Donnees etat={etat} blocs={2}>
        {([recit, jours, seuils, synthese]) => <Histoire recit={recit} jours={jours} seuils={seuils} synthese={synthese} />}
      </Donnees>
    </div>
  );
}
