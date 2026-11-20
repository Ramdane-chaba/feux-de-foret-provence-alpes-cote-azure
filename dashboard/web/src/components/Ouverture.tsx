/** Éléments de l'écran d'ouverture : fond de braises et chiffres qui comptent. */

import { useEffect, useRef, useState } from "react";
import { DUREE_COMPTEUR_MS } from "../constantes";
import { useMouvementReduit } from "../lib/hooks";

interface Braise {
  x: number;
  y: number;
  rayon: number;
  vitesse: number;
  derive: number;
  phase: number;
  vie: number;
}

const DENSITE = 1 / 26000; // braises par pixel carré : fond discret, peu coûteux
const MAX_BRAISES = 90;

/** Fond de braises qui montent. Canvas léger ; rien n'est dessiné si prefers-reduced-motion est actif. */
export function Braises(): JSX.Element | null {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduit = useMouvementReduit();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (reduit || !canvas || !ctx) return;
    let largeur = 0;
    let hauteur = 0;
    let braises: Braise[] = [];
    let image = 0;
    let precedent = performance.now();

    const naitre = (enBas: boolean): Braise => ({
      x: Math.random() * largeur,
      y: enBas ? hauteur + Math.random() * 40 : Math.random() * hauteur,
      rayon: 0.6 + Math.random() * 1.9,
      vitesse: 12 + Math.random() * 30,
      derive: (Math.random() - 0.5) * 16,
      phase: Math.random() * Math.PI * 2,
      vie: 0.35 + Math.random() * 0.65,
    });

    const dimensionner = (): void => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      largeur = canvas.clientWidth;
      hauteur = canvas.clientHeight;
      canvas.width = largeur * ratio;
      canvas.height = hauteur * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      braises = Array.from({ length: Math.min(MAX_BRAISES, Math.round(largeur * hauteur * DENSITE)) }, () => naitre(false));
    };

    const dessiner = (maintenant: number): void => {
      const dt = Math.min(0.05, (maintenant - precedent) / 1000);
      precedent = maintenant;
      ctx.clearRect(0, 0, largeur, hauteur);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < braises.length; i += 1) {
        const b = braises[i]!;
        b.y -= b.vitesse * dt;
        b.phase += dt * 1.4;
        b.x += (b.derive + Math.sin(b.phase) * 9) * dt;
        if (b.y < -10) braises[i] = naitre(true);
        // Plus la braise monte, plus elle s'éteint ; elle scintille légèrement.
        const hauteurRelative = Math.max(0, Math.min(1, b.y / hauteur));
        const alpha = b.vie * hauteurRelative * (0.55 + 0.45 * Math.sin(b.phase * 2.3));
        if (alpha <= 0.01) continue;
        const halo = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.rayon * 5);
        halo.addColorStop(0, `rgba(255, 196, 120, ${alpha})`);
        halo.addColorStop(0.3, `rgba(255, 138, 61, ${alpha * 0.5})`);
        halo.addColorStop(1, "rgba(255, 138, 61, 0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.rayon * 5, 0, Math.PI * 2);
        ctx.fill();
      }
      image = requestAnimationFrame(dessiner);
    };

    const visibilite = (): void => {
      cancelAnimationFrame(image);
      if (!document.hidden) {
        precedent = performance.now();
        image = requestAnimationFrame(dessiner);
      }
    };

    dimensionner();
    image = requestAnimationFrame(dessiner);
    window.addEventListener("resize", dimensionner);
    document.addEventListener("visibilitychange", visibilite);
    return () => {
      cancelAnimationFrame(image);
      window.removeEventListener("resize", dimensionner);
      document.removeEventListener("visibilitychange", visibilite);
    };
  }, [reduit]);

  if (reduit) return null;
  return <canvas ref={ref} className="braises" aria-hidden="true" />;
}

interface PropsCompteur {
  valeur: number;
  /** Met en forme la valeur en cours de comptage (par exemple en pourcentage). */
  format: (valeur: number) => string;
  /** Retard avant le départ, pour faire partir les chiffres l'un après l'autre. */
  delai?: number;
}

/** Compte de 0 à la valeur. Avec prefers-reduced-motion, la valeur finale s'affiche tout de suite. */
export function Compteur({ valeur, format, delai = 0 }: PropsCompteur): JSX.Element {
  const reduit = useMouvementReduit();
  const [courant, setCourant] = useState(reduit ? valeur : 0);

  useEffect(() => {
    if (reduit) {
      setCourant(valeur);
      return;
    }
    let image = 0;
    const depart = performance.now() + delai;
    const avancer = (maintenant: number): void => {
      const t = Math.max(0, Math.min(1, (maintenant - depart) / DUREE_COMPTEUR_MS));
      setCourant(valeur * (1 - (1 - t) ** 3));
      if (t < 1) image = requestAnimationFrame(avancer);
    };
    image = requestAnimationFrame(avancer);
    return () => cancelAnimationFrame(image);
  }, [valeur, delai, reduit]);

  // La valeur finale est toujours lue par les lecteurs d'écran, sans le défilement.
  return (
    <span className="compteur">
      <span aria-hidden="true">{format(courant)}</span>
      <span className="visuellement-cache">{format(valeur)}</span>
    </span>
  );
}
