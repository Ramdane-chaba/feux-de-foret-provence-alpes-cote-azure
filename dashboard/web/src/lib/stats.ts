/** Petites statistiques, calculées dans le navigateur à partir des JSON. */

export const somme = (valeurs: readonly number[]): number => valeurs.reduce((a, b) => a + b, 0);

export function moyenne(valeurs: readonly number[]): number {
  return valeurs.length === 0 ? 0 : somme(valeurs) / valeurs.length;
}

export function mediane(valeurs: readonly number[]): number {
  if (valeurs.length === 0) return 0;
  const tri = [...valeurs].sort((a, b) => a - b);
  const milieu = Math.floor(tri.length / 2);
  return tri.length % 2 === 1 ? tri[milieu]! : (tri[milieu - 1]! + tri[milieu]!) / 2;
}

/** Coefficient de corrélation de Pearson. */
export function correlation(x: readonly number[], y: readonly number[]): number {
  const mx = moyenne(x);
  const my = moyenne(y);
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < x.length; i += 1) {
    const a = x[i]! - mx;
    const b = y[i]! - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  return dx === 0 || dy === 0 ? 0 : num / Math.sqrt(dx * dy);
}

/** Indices des `n` plus grandes valeurs, dans l'ordre décroissant (les valeurs nulles sont ignorées). */
export function indicesDesPlusGrands(valeurs: readonly number[], n: number): number[] {
  return valeurs
    .map((valeur, indice) => ({ valeur, indice }))
    .filter((v) => v.valeur > 0)
    .sort((a, b) => b.valeur - a.valeur)
    .slice(0, n)
    .map((v) => v.indice);
}

export const nonNul = <T>(valeur: T | null | undefined): valeur is T => valeur !== null && valeur !== undefined;
