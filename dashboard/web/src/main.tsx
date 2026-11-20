import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/base.css";
import "./styles/composants.css";
import "./styles/pages.css";
import "./styles/impression.css";

const racine = document.getElementById("racine");
if (!racine) throw new Error("élément #racine absent de index.html");
createRoot(racine).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
