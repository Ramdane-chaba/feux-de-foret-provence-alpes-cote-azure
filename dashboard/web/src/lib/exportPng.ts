/**
 * Export d'un graphique SVG en PNG, sans bibliothèque : le SVG est cloné, ses styles calculés sont
 * recopiés en attributs (un SVG dessiné dans une image ne voit pas la feuille de style de la page),
 * puis il est dessiné sur un canvas avec le titre, le sous-titre et la source.
 */

import { COULEURS } from "../constantes";

const PROPRIETES = [
  "fill", "fill-opacity", "stroke", "stroke-width", "stroke-opacity", "stroke-dasharray", "stroke-linecap",
  "stroke-linejoin", "opacity", "font-family", "font-size", "font-weight", "font-style", "letter-spacing",
  "text-anchor", "dominant-baseline", "paint-order", "visibility", "display",
] as const;

const POLICE = '"Segoe UI", system-ui, -apple-system, sans-serif';
const POLICE_TITRE = 'Georgia, "Times New Roman", serif';
const ECHELLE = 2;
const MARGE = 28;

function figerStyles(source: Element, copie: Element): void {
  const style = getComputedStyle(source);
  for (const propriete of PROPRIETES) {
    const valeur = style.getPropertyValue(propriete);
    if (valeur) (copie as SVGElement).style.setProperty(propriete, valeur);
  }
  // Les animations d'entrée ne doivent pas figer un graphique à moitié apparu.
  (copie as SVGElement).style.setProperty("animation", "none");
  (copie as SVGElement).style.setProperty("transition", "none");
  (copie as SVGElement).style.setProperty("transform", style.getPropertyValue("transform") === "none" ? "none" : style.getPropertyValue("transform"));
  const enfantsSource = source.children;
  const enfantsCopie = copie.children;
  for (let i = 0; i < enfantsSource.length; i += 1) {
    const s = enfantsSource[i];
    const c = enfantsCopie[i];
    if (s && c) figerStyles(s, c);
  }
}

function couperTexte(ctx: CanvasRenderingContext2D, texte: string, largeurMax: number): string[] {
  const lignes: string[] = [];
  let ligne = "";
  for (const mot of texte.split(" ")) {
    const essai = ligne ? `${ligne} ${mot}` : mot;
    if (ctx.measureText(essai).width > largeurMax && ligne) {
      lignes.push(ligne);
      ligne = mot;
    } else {
      ligne = essai;
    }
  }
  if (ligne) lignes.push(ligne);
  return lignes;
}

export interface OptionsExport {
  titre: string;
  sousTitre?: string | undefined;
  source?: string | undefined;
  nomFichier: string;
}

export async function exporterPng(svg: SVGSVGElement, options: OptionsExport): Promise<void> {
  const boite = svg.getBoundingClientRect();
  const largeur = Math.round(boite.width);
  const hauteur = Math.round(boite.height);
  const copie = svg.cloneNode(true) as SVGSVGElement;
  figerStyles(svg, copie);
  copie.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  copie.setAttribute("width", String(largeur));
  copie.setAttribute("height", String(hauteur));
  if (!copie.getAttribute("viewBox")) copie.setAttribute("viewBox", `0 0 ${largeur} ${hauteur}`);

  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copie)], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("le graphique n'a pas pu être dessiné"));
      image.src = url;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas indisponible");
    const largeurTotale = largeur + MARGE * 2;
    const largeurTexte = largeurTotale - MARGE * 2;

    ctx.font = `600 22px ${POLICE_TITRE}`;
    const lignesTitre = couperTexte(ctx, options.titre, largeurTexte);
    ctx.font = `400 14px ${POLICE}`;
    const lignesSousTitre = options.sousTitre ? couperTexte(ctx, options.sousTitre, largeurTexte) : [];
    const hautEnTete = MARGE + lignesTitre.length * 28 + lignesSousTitre.length * 20 + 14;
    const hautPied = options.source ? 40 : MARGE;

    canvas.width = largeurTotale * ECHELLE;
    canvas.height = (hautEnTete + hauteur + hautPied) * ECHELLE;
    ctx.scale(ECHELLE, ECHELLE);
    ctx.fillStyle = COULEURS.surface;
    ctx.fillRect(0, 0, largeurTotale, hautEnTete + hauteur + hautPied);
    ctx.textBaseline = "top";

    let y = MARGE;
    ctx.fillStyle = COULEURS.encre;
    ctx.font = `600 22px ${POLICE_TITRE}`;
    for (const ligne of lignesTitre) {
      ctx.fillText(ligne, MARGE, y);
      y += 28;
    }
    ctx.fillStyle = COULEURS.encreSecondaire;
    ctx.font = `400 14px ${POLICE}`;
    for (const ligne of lignesSousTitre) {
      ctx.fillText(ligne, MARGE, y + 2);
      y += 20;
    }
    ctx.drawImage(image, MARGE, hautEnTete, largeur, hauteur);
    if (options.source) {
      ctx.fillStyle = COULEURS.encreDiscrete;
      ctx.font = `400 12px ${POLICE}`;
      ctx.fillText(options.source, MARGE, hautEnTete + hauteur + 14);
    }

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("image vide");
    const lien = document.createElement("a");
    lien.href = URL.createObjectURL(blob);
    lien.download = `${options.nomFichier}.png`;
    lien.click();
    setTimeout(() => URL.revokeObjectURL(lien.href), 2000);
  } finally {
    URL.revokeObjectURL(url);
  }
}
