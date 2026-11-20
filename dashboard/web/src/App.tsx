import { lazy, Suspense, useEffect } from "react";
import { HashRouter, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { Chargement } from "./components/Briques";
import { FournisseurGlossaire } from "./components/Glossaire";
import { FournisseurInfobulle } from "./components/Infobulle";
import { FournisseurPresentation, usePresentation } from "./components/Presentation";
import { PAGES } from "./constantes";
import Ouverture from "./pages/Ouverture";

// Une page = un morceau de code chargé à la demande : le premier affichage ne charge que l'ouverture.
const Recit = lazy(() => import("./pages/Recit"));
const Simulateur = lazy(() => import("./pages/Simulateur"));
const Carte = lazy(() => import("./pages/Carte"));
const Calendrier = lazy(() => import("./pages/Calendrier"));
const Synthese = lazy(() => import("./pages/Synthese"));
const Introuvable = lazy(() => import("./pages/Introuvable"));

function Navigation(): JSX.Element {
  const presentation = usePresentation();
  return (
    <header className="navigation sans-impression">
      <NavLink to="/" className="navigation__marque" aria-label="SDIS 13, saison feux 2027 : ouverture">
        <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16 3c1.2 6 8 8.500 8 16.500a8 8 0 0 1-16 0c0-3.500 2.300-5.800 3.500-8.200 1 2.400 2.200 3.500 3.400 3.500C16.200 11 14.800 7.700 16 3z" fill="currentColor" />
        </svg>
        <span>
          SDIS 13 <em>Saison feux 2027</em>
        </span>
      </NavLink>
      <nav aria-label="Pages">
        {PAGES.slice(1).map((page) => (
          <NavLink key={page.chemin} to={page.chemin} className={({ isActive }) => `navigation__lien${isActive ? " navigation__lien--actif" : ""}`}>
            {page.court}
          </NavLink>
        ))}
      </nav>
      <button type="button" className="bouton bouton--contour" onClick={presentation.basculer} title="Plein écran, navigation cachée, flèches du clavier">
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Mode présentation
      </button>
    </header>
  );
}

function Pages(): JSX.Element {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const page = PAGES.find((p) => p.chemin === pathname);
    document.title = `${page ? page.titre : "Page introuvable"} · SDIS 13, saison feux 2027`;
  }, [pathname]);

  return (
    // La clé relance l'animation d'entrée à chaque changement de page.
    <main key={pathname} className="page">
      <Suspense fallback={<div className="contenu"><Chargement /></div>}>
        <Routes>
          <Route path="/" element={<Ouverture />} />
          <Route path="/recit" element={<Recit />} />
          <Route path="/simulateur" element={<Simulateur />} />
          <Route path="/carte" element={<Carte />} />
          <Route path="/calendrier" element={<Calendrier />} />
          <Route path="/synthese" element={<Synthese />} />
          <Route path="*" element={<Introuvable />} />
        </Routes>
      </Suspense>
    </main>
  );
}

export default function App(): JSX.Element {
  return (
    <HashRouter>
      <FournisseurGlossaire>
        <FournisseurInfobulle>
          <FournisseurPresentation>
            <Navigation />
            <Pages />
          </FournisseurPresentation>
        </FournisseurInfobulle>
      </FournisseurGlossaire>
    </HashRouter>
  );
}
