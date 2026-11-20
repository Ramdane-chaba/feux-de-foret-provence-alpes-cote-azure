/**
 * Infobulle riche, partagée par tous les graphiques : une seule bulle dans la page, qui suit le pointeur.
 * Un repère la reçoit avec `{...infobulle.sur(() => <ContenuInfobulle … />)}` (souris et clavier).
 */

import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState, type FocusEvent, type PointerEvent, type ReactNode } from "react";

interface Position {
  x: number;
  y: number;
}

interface Poignees {
  onPointerEnter: (e: PointerEvent) => void;
  onPointerMove: (e: PointerEvent) => void;
  onPointerLeave: () => void;
  onFocus: (e: FocusEvent) => void;
  onBlur: () => void;
}

interface ApiInfobulle {
  sur: (contenu: () => ReactNode) => Poignees;
  cacher: () => void;
}

const Contexte = createContext<ApiInfobulle | null>(null);

export function FournisseurInfobulle({ children }: { children: ReactNode }): JSX.Element {
  const [contenu, setContenu] = useState<ReactNode>(null);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const [decalage, setDecalage] = useState<Position>({ x: 14, y: 14 });

  // La bulle reste dans la fenêtre : elle passe à gauche ou au-dessus du pointeur si besoin.
  useLayoutEffect(() => {
    const bulle = ref.current;
    if (!bulle || contenu === null) return;
    const { width, height } = bulle.getBoundingClientRect();
    setDecalage({
      x: position.x + 14 + width > window.innerWidth - 8 ? -width - 14 : 14,
      y: position.y + 14 + height > window.innerHeight - 8 ? -height - 14 : 14,
    });
  }, [contenu, position]);

  const cacher = useCallback(() => setContenu(null), []);
  const api = useMemo<ApiInfobulle>(
    () => ({
      cacher,
      sur: (fabrique) => ({
        onPointerEnter: (e) => {
          setPosition({ x: e.clientX, y: e.clientY });
          setContenu(fabrique());
        },
        onPointerMove: (e) => setPosition({ x: e.clientX, y: e.clientY }),
        onPointerLeave: cacher,
        onFocus: (e) => {
          const boite = (e.target as Element).getBoundingClientRect();
          setPosition({ x: boite.left + boite.width / 2, y: boite.top + boite.height / 2 });
          setContenu(fabrique());
        },
        onBlur: cacher,
      }),
    }),
    [cacher],
  );

  return (
    <Contexte.Provider value={api}>
      {children}
      <div
        ref={ref}
        className={`infobulle${contenu === null ? "" : " infobulle--visible"}`}
        style={{ transform: `translate(${Math.max(8, position.x + decalage.x)}px, ${Math.max(8, position.y + decalage.y)}px)` }}
        role="tooltip"
        aria-hidden={contenu === null}
      >
        {contenu}
      </div>
    </Contexte.Provider>
  );
}

export function useInfobulle(): ApiInfobulle {
  const api = useContext(Contexte);
  if (!api) throw new Error("useInfobulle doit être utilisé sous <FournisseurInfobulle>");
  return api;
}

export interface LigneInfobulle {
  libelle: string;
  valeur: string;
  /** Pastille de couleur devant le libellé (identité de la série). */
  couleur?: string;
}

interface PropsContenu {
  titre: string;
  surtitre?: string;
  /** La valeur principale, en grand. */
  valeur?: string;
  lignes?: LigneInfobulle[];
  note?: string;
}

/** Mise en page commune : titre, valeur, puis part du total, comparaison à la moyenne, etc. */
export function ContenuInfobulle({ titre, surtitre, valeur, lignes = [], note }: PropsContenu): JSX.Element {
  return (
    <>
      {surtitre && <div className="infobulle__surtitre">{surtitre}</div>}
      <div className="infobulle__titre">{titre}</div>
      {valeur && <div className="infobulle__valeur">{valeur}</div>}
      {lignes.length > 0 && (
        <dl className="infobulle__lignes">
          {lignes.map((l) => (
            <div key={l.libelle}>
              <dt>
                {l.couleur && <span className="pastille" style={{ background: l.couleur }} />}
                {l.libelle}
              </dt>
              <dd>{l.valeur}</dd>
            </div>
          ))}
        </dl>
      )}
      {note && <div className="infobulle__note">{note}</div>}
    </>
  );
}
