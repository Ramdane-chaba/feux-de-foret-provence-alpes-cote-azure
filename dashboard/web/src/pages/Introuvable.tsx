import { Link, useLocation } from "react-router-dom";
import { Terme } from "../components/Glossaire";
import { PAGES } from "../constantes";

/** Page 404, dans le vocabulaire du projet : une alerte déclenchée pour rien. */
export default function Introuvable(): JSX.Element {
  const { pathname } = useLocation();
  return (
    <section className="introuvable">
      <svg className="introuvable__dessin" viewBox="0 0 240 150" aria-hidden="true">
        <path className="introuvable__colline" d="M0 150 L0 112 Q40 84 78 104 T150 92 T240 108 L240 150Z" />
        <g className="introuvable__tour">
          <path d="M112 104 L118 52 H130 L136 104 M114 86 H134 M116 68 H132" />
          <rect x="108" y="34" width="32" height="18" rx="2" />
          <path d="M104 34 L124 22 L144 34Z" />
        </g>
        <circle className="introuvable__fumee" cx="186" cy="80" r="5" />
        <circle className="introuvable__fumee introuvable__fumee--2" cx="192" cy="64" r="7" />
        <circle className="introuvable__fumee introuvable__fumee--3" cx="200" cy="44" r="10" />
      </svg>
      <p className="surtitre">Erreur 404 · fausse alerte</p>
      <h1>Le guet a signalé une fumée, mais rien ne brûle ici.</h1>
      <p className="chapeau">
        La page <code>{pathname}</code> n'existe pas. Dans le projet, on appelle cela une <Terme id="fausse-alerte">fausse alerte</Terme> : le dispositif est
        déclenché et aucun feu ne se déclare.
      </p>
      <nav className="introuvable__liens" aria-label="Pages existantes">
        {PAGES.map((p) => (
          <Link key={p.chemin} to={p.chemin} className="bouton bouton--contour">
            {p.titre}
          </Link>
        ))}
      </nav>
    </section>
  );
}
