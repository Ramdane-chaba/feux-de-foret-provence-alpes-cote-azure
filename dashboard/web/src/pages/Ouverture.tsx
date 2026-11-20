import { Link } from "react-router-dom";
import { Terme } from "../components/Glossaire";
import { Braises, Compteur } from "../components/Ouverture";
import { tous, useDonnees } from "../lib/donnees";
import { jourCourt, nombre, nombre1, periode } from "../lib/format";

export default function Ouverture(): JSX.Element {
  const etat = tous(useDonnees("accueil"), useDonnees("meta"));

  return (
    <section className="ouverture">
      <Braises />
      <div className="ouverture__voile" aria-hidden="true" />
      <div className="ouverture__contenu">
        <p className="surtitre">SDIS 13 · Bouches-du-Rhône · préparer la saison feux 2027</p>
        <h1>
          Quels jours renforcer,
          <br />
          <em>et où ?</em>
        </h1>
        <p className="chapeau">
          La direction du SDIS 13 doit choisir le niveau de la Météo des forêts qui déclenche le dispositif renforcé, avec un budget qui ne couvre ni tout le
          département ni tout l'été.
          {etat.etat === "pret" &&
            ` Voici ce que disent les feux de ${etat.donnees[0].annee_debut} à ${etat.donnees[0].annee_fin} et les ${etat.donnees[0].saisons.length} saisons de bulletins qui se croisent avec eux.`}
        </p>

        {etat.etat === "erreur" && (
          <p className="ouverture__erreur" role="alert">
            Les chiffres ne sont pas disponibles : lancer <code>uv run python -m pipeline.exporter_web</code> à la racine du dépôt, puis recharger la page.
          </p>
        )}

        <div className="ouverture__chiffres" aria-busy={etat.etat === "chargement"}>
          {etat.etat !== "pret" ? (
            etat.etat === "chargement" && [0, 1, 2].map((i) => <div key={i} className="squelette squelette--chiffre" />)
          ) : (
            (() => {
              const [a] = etat.donnees;
              const saisons = periode(a.saisons);
              return (
                <>
                  <div className="chiffre">
                    <p className="chiffre__valeur">
                      <Compteur valeur={a.feux} format={(v) => nombre(Math.round(v))} />
                    </p>
                    <p className="chiffre__libelle">feux de forêt en {saisons}</p>
                    <p className="chiffre__detail">dans les Bouches-du-Rhône, dont {nombre(a.feux_periode)} pendant la période de publication de l'indice</p>
                  </div>
                  <div className="chiffre chiffre--accent">
                    <p className="chiffre__valeur">
                      <Compteur valeur={(a.feux_couverts / a.feux_periode) * 100} format={(v) => `${nombre1(v)}\u00a0%`} delai={180} />
                    </p>
                    <p className="chiffre__libelle">
                      des feux couverts avec un <Terme id="seuil-de-declenchement">seuil</Terme> au niveau {a.seuil_reference}
                    </p>
                    <p className="chiffre__detail">
                      {nombre(a.feux_couverts)} feux sur {nombre(a.feux_periode)} : les {nombre(a.feux_periode - a.feux_couverts)} autres sont partis un jour sans renfort
                    </p>
                  </div>
                  <div className="chiffre">
                    <p className="chiffre__valeur">
                      <Compteur valeur={a.jours_renfort} format={(v) => nombre(Math.round(v))} delai={360} />
                    </p>
                    <p className="chiffre__libelle">
                      <Terme id="jour-de-renfort">jours de renfort</Terme> à ce seuil
                    </p>
                    <p className="chiffre__detail">
                      sur les {nombre(a.jours_bulletin)} jours de bulletin des saisons {saisons}
                    </p>
                  </div>
                </>
              );
            })()
          )}
        </div>

        <div className="ouverture__actions">
          <Link to="/recit" className="bouton bouton--principal">
            Commencer
            <span aria-hidden="true">→</span>
          </Link>
          <Link to="/simulateur" className="bouton bouton--contour">
            Aller au simulateur
          </Link>
        </div>

        <p className="ouverture__sources">
          {etat.etat === "pret" && (
            <>
              Sources : {etat.donnees[1].sources.slice(0, 3).map((s) => `${s.nom} (${s.detail})`).join(" ; ")}. Données exportées le{" "}
              {jourCourt(etat.donnees[1].date_export)}. Le seuil actuel du SDIS 13 ne nous a pas été communiqué : le niveau {etat.donnees[0].seuil_reference} sert
              d'exemple.
            </>
          )}
        </p>
      </div>
    </section>
  );
}
