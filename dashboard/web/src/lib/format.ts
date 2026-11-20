/** Mise en forme française des nombres et des dates. */

const entier = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const decimal1 = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const dateLongue = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const dateCourte = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** Espace insécable : un nombre n'est jamais séparé de son unité en fin de ligne. */
const INSECABLE = "\u00a0";

export const nombre = (valeur: number): string => entier.format(valeur);
export const nombre1 = (valeur: number): string => decimal1.format(valeur);

/** 177 / 355 → « 49,9 % ». Renvoie « – » si le dénominateur est nul. */
export function pourcent(numerateur: number, denominateur: number, decimales: 0 | 1 = 1): string {
  if (denominateur === 0) return "–";
  const valeur = (numerateur / denominateur) * 100;
  return `${decimales === 0 ? entier.format(valeur) : decimal1.format(valeur)}${INSECABLE}%`;
}

export function hectares(valeur: number): string {
  return `${valeur >= 100 ? entier.format(valeur) : decimal1.format(valeur)} ha`;
}

export function pluriel(n: number, singulier: string, plurielForme = `${singulier}s`): string {
  return `${nombre(n)} ${n > 1 ? plurielForme : singulier}`;
}

/** « 2025-07-08 » → date UTC (les jours du pipeline n'ont pas de fuseau). */
export function versDate(jour: string): Date {
  return new Date(`${jour}T00:00:00Z`);
}

export const jourLong = (jour: string): string => dateLongue.format(versDate(jour));
export const jourCourt = (jour: string): string => dateCourte.format(versDate(jour));

/** Écart signé à une référence : « +12 % » ou « −8 % ». */
export function ecart(valeur: number, reference: number): string {
  if (reference === 0) return "–";
  const e = ((valeur - reference) / reference) * 100;
  const signe = e > 0 ? "+" : e < 0 ? "−" : "";
  return `${signe}${entier.format(Math.abs(e))}${INSECABLE}%`;
}

/** « au-dessus de la moyenne (+12 %) », pour les infobulles. */
export function comparaison(valeur: number, reference: number, nomReference = "la moyenne"): string {
  if (reference === 0) return "–";
  if (Math.abs(valeur - reference) / reference < 0.005) return `égal à ${nomReference}`;
  return `${ecart(valeur, reference)} par rapport à ${nomReference}`;
}

export const plageHeures = (debut: number, fin: number): string => `${debut} h - ${fin} h`;

/** « 2024 et 2025 » */
export function listeEt(valeurs: readonly (string | number)[]): string {
  if (valeurs.length <= 1) return valeurs.join("");
  return `${valeurs.slice(0, -1).join(", ")} et ${valeurs[valeurs.length - 1]}`;
}

/** « 2024-2025 » */
export function periode(annees: readonly number[]): string {
  return annees.length === 0 ? "" : `${Math.min(...annees)}-${Math.max(...annees)}`;
}
