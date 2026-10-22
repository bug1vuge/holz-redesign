import { useId, type ReactNode } from "react";
import { EDGES, finishById, type DoorKind, type Edge, type Finish, type Product } from "../data/catalog";

/* ---------- цветовые утилиты ---------- */
function hexToRgb(h: string) {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function shade(hex: string, amt: number) {
  const [r, g, b] = hexToRgb(hex);
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  const c = (v: number) => Math.round((t - v) * p + v);
  return `rgb(${c(r)},${c(g)},${c(b)})`;
}
export const isLight = (hex: string) => {
  const [r, g, b] = hexToRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
};

/** Глобальные фильтры текстур: подключаются один раз в App. */
export function TextureDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <defs>
        <filter id="tx-wood" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.32 0.007" numOctaves="3" seed="7" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.35" />
        </filter>
        <filter id="tx-wood-light" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.012" numOctaves="2" seed="3" />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -2.6 1.45" />
        </filter>
        <filter id="tx-stone" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="5" seed="11" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.8 1.1" />
        </filter>
        <filter id="tx-vein" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="turbulence" baseFrequency="0.012 0.02" numOctaves="3" seed="4" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -9 1.25" />
        </filter>
        <linearGradient id="g-light" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity=".16" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".22" />
        </linearGradient>
        <linearGradient id="g-vert" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".06" />
          <stop offset=".7" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".18" />
        </linearGradient>
        <linearGradient id="g-gloss" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".18" stopColor="#fff" stopOpacity=".22" />
          <stop offset=".26" stopColor="#fff" stopOpacity="0" />
          <stop offset=".7" stopColor="#fff" stopOpacity="0" />
          <stop offset=".76" stopColor="#fff" stopOpacity=".08" />
          <stop offset=".8" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="g-metal-black" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#4a4a4a" /><stop offset=".5" stopColor="#141414" /><stop offset="1" stopColor="#2a2a2a" />
        </linearGradient>
        <linearGradient id="g-metal-champagne" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f3e3c3" /><stop offset=".5" stopColor="#c8ad7c" /><stop offset="1" stopColor="#e6d0a6" />
        </linearGradient>
        <linearGradient id="g-metal-gold" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e2c27e" /><stop offset=".5" stopColor="#9c7a37" /><stop offset="1" stopColor="#c9a35c" />
        </linearGradient>
        <linearGradient id="g-mirror" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#d9dee0" /><stop offset=".45" stopColor="#8d979c" /><stop offset=".5" stopColor="#e9eef0" />
          <stop offset=".58" stopColor="#7d878c" /><stop offset="1" stopColor="#b7c0c4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const GLASS_FILL: Record<string, [string, string]> = {
  satin: ["#f2f4f2", "#d7dcd9"],
  bronze: ["#8a6a4a", "#4c3a29"],
  clear: ["#dbe8ea", "#a9bfc3"],
  black: ["#2b2b2d", "#0c0c0d"],
};

const metal = (edge: Edge) => `url(#g-metal-${edge === "none" ? "black" : edge})`;

interface Box { x: number; y: number; w: number; h: number }

function Groove({ x1, y1, x2, y2, strong = 1 }: { x1: number; y1: number; x2: number; y2: number; strong?: number }) {
  const horiz = y1 === y2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000" strokeOpacity={0.38 * strong} strokeWidth={0.7} />
      <line x1={x1 + (horiz ? 0 : 0.6)} y1={y1 + (horiz ? 0.6 : 0)} x2={x2 + (horiz ? 0 : 0.6)} y2={y2 + (horiz ? 0.6 : 0)} stroke="#fff" strokeOpacity={0.22 * strong} strokeWidth={0.45} />
    </g>
  );
}

function Molding({ b, color, r = 0 }: { b: Box; color: string; r?: number }) {
  return (
    <g>
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={r} fill={shade(color, -0.04)} />
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={r} fill="none" stroke="#000" strokeOpacity=".32" strokeWidth="1.1" />
      <rect x={b.x + 1.4} y={b.y + 1.4} width={b.w - 2.8} height={b.h - 2.8} rx={Math.max(0, r - 1)} fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth=".6" />
      <rect x={b.x + 2.6} y={b.y + 2.6} width={b.w - 5.2} height={b.h - 5.2} rx={Math.max(0, r - 2)} fill="none" stroke="#000" strokeOpacity=".16" strokeWidth=".5" />
    </g>
  );
}

function GlassPane({ b, glass = "satin", id, r = 0 }: { b: Box; glass?: string; id: string; r?: number }) {
  const [a, c] = GLASS_FILL[glass] ?? GLASS_FILL.satin;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-gl`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={a} /><stop offset="1" stopColor={c} />
        </linearGradient>
      </defs>
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={r} fill={`url(#${id}-gl)`} />
      <path d={`M${b.x + b.w * 0.15} ${b.y} L${b.x + b.w * 0.55} ${b.y} L${b.x + b.w * 0.05} ${b.y + b.h * 0.55} L${b.x} ${b.y + b.h * 0.45} Z`} fill="#fff" opacity={glass === "black" ? 0.08 : 0.2} />
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={r} fill="none" stroke="#000" strokeOpacity=".35" strokeWidth=".8" />
    </g>
  );
}

function Handle({ x, y, edge, side = "right" }: { x: number; y: number; edge: Edge; side?: "right" | "left" }) {
  const dir = side === "right" ? -1 : 1;
  return (
    <g>
      <ellipse cx={x + 0.4} cy={y + 1.2} rx="2.4" ry="2.4" fill="#000" opacity=".18" />
      <circle cx={x} cy={y} r="2.2" fill={metal(edge)} />
      <rect x={side === "right" ? x - 10 : x} y={y - 0.9} width="10" height="1.8" rx=".9" fill={metal(edge)} />
      <rect x={side === "right" ? x - 10 : x} y={y + 1.1} width="10" height=".8" rx=".4" fill="#000" opacity=".18" transform={`translate(${dir * 0} 0)`} />
    </g>
  );
}

/** Поверхность: цвет + текстура + свет */
function Surface({ b, finish, id, r = 0 }: { b: Box; finish: Finish; id: string; r?: number }) {
  return (
    <g>
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={r} fill={finish.color} />
      {finish.texture === "wood" && (
        <g clipPath={`url(#${id}-leaf)`}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} filter="url(#tx-wood)" opacity=".42" />
          <rect x={b.x} y={b.y} width={b.w} height={b.h} filter="url(#tx-wood-light)" opacity=".18" />
        </g>
      )}
      {finish.texture === "stone" && (
        <g clipPath={`url(#${id}-leaf)`}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} filter="url(#tx-stone)" opacity=".38" />
          <rect x={b.x} y={b.y} width={b.w} height={b.h} filter="url(#tx-vein)" opacity=".28" />
        </g>
      )}
      {finish.texture === "enamel" && <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={r} fill="url(#g-gloss)" />}
    </g>
  );
}

function decorate(kind: DoorKind, v: number, L: Box, f: Finish, edge: Edge, glass: string | undefined, id: string): ReactNode {
  const { x, y, w, h } = L;
  const ink = shade(f.color, -0.08);
  switch (kind) {
    case "grooves": {
      const sets = [[0.25, 0.5, 0.75], [0.18, 0.36, 0.54, 0.72, 0.9], [0.12, 0.2, 0.28], [0.46, 0.5], [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]];
      return sets[v % sets.length].map((t, i) => <Groove key={i} x1={x} y1={y + h * t} x2={x + w} y2={y + h * t} />);
    }
    case "vgrooves": {
      const sets = [[0.33, 0.66], [0.2, 0.4, 0.6, 0.8], [0.15], [0.5], [0.12, 0.24, 0.36]];
      return sets[v % sets.length].map((t, i) => <Groove key={i} x1={x + w * t} y1={y} x2={x + w * t} y2={y + h} />);
    }
    case "panels": {
      const m = 8;
      const layouts: Box[][] = [
        [{ x: x + m, y: y + m, w: w - 2 * m, h: h * 0.58 }, { x: x + m, y: y + h * 0.58 + 2 * m, w: w - 2 * m, h: h * 0.42 - 3 * m }],
        [0, 1, 2].map(i => ({ x: x + m, y: y + m + i * (h - m) / 3, w: w - 2 * m, h: (h - m) / 3 - m })),
        [{ x: x + m, y: y + m, w: w - 2 * m, h: h - 2 * m }],
        [{ x: x + m, y: y + m, w: (w - 3 * m) / 2, h: h * 0.62 }, { x: x + m * 2 + (w - 3 * m) / 2, y: y + m, w: (w - 3 * m) / 2, h: h * 0.62 }, { x: x + m, y: y + h * 0.62 + 2 * m, w: w - 2 * m, h: h * 0.38 - 3 * m }],
      ];
      return layouts[v % layouts.length].map((b, i) => <Molding key={i} b={b} color={f.color} />);
    }
    case "classic": {
      const m = 9, topH = h * 0.5;
      const arch = `M${x + m} ${y + m + 16} Q${x + w / 2} ${y + m - 6} ${x + w - m} ${y + m + 16} L${x + w - m} ${y + m + topH} L${x + m} ${y + m + topH} Z`;
      return (
        <g>
          {glass ? (
            <g>
              <clipPath id={`${id}-arch`}><path d={arch} /></clipPath>
              <g clipPath={`url(#${id}-arch)`}><GlassPane b={{ x: x + m, y: y + m - 8, w: w - 2 * m, h: topH + 10 }} glass={glass} id={id} /></g>
            </g>
          ) : (
            <path d={arch} fill={shade(f.color, -0.04)} />
          )}
          <path d={arch} fill="none" stroke="#000" strokeOpacity=".32" strokeWidth="1.1" />
          <path d={arch} fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth=".5" transform="translate(.8 .8)" />
          <Molding b={{ x: x + m, y: y + m * 2 + topH, w: w - 2 * m, h: h - topH - m * 3 }} color={f.color} />
          {v % 2 === 1 && <line x1={x + w / 2} y1={y + m * 2 + topH} x2={x + w / 2} y2={y + h - m} stroke={ink} strokeOpacity=".4" />}
        </g>
      );
    }
    case "asym": {
      const m = 8;
      const side = v % 2 ? x + m : x + w * 0.45;
      return (
        <g>
          <Molding b={{ x: side, y: y + m, w: w * 0.55 - m * 1.5, h: h - 2 * m }} color={f.color} />
          {v % 3 === 0 && <Groove x1={x} y1={y + h * 0.3} x2={side - 2} y2={y + h * 0.3} />}
          {edge !== "none" && <rect x={side - 3} y={y} width="1" height={h} fill={metal(edge)} />}
        </g>
      );
    }
    case "glass": {
      const m = 10;
      const layouts: Box[][] = [
        [{ x: x + m, y: y + m, w: w - 2 * m, h: h * 0.72 }],
        [0, 1, 2].map(i => ({ x: x + m, y: y + m + i * (h * 0.26), w: w - 2 * m, h: h * 0.22 })),
        [{ x: x + w * 0.62, y: y + m, w: w * 0.18, h: h - 2 * m }],
        [{ x: x + m, y: y + m, w: w - 2 * m, h: h * 0.42 }],
        [{ x: x + m, y: y + m, w: (w - 2 * m) * 0.42, h: h - 2 * m }, { x: x + w - m - (w - 2 * m) * 0.42, y: y + m, w: (w - 2 * m) * 0.42, h: h - 2 * m }],
      ];
      return layouts[v % layouts.length].map((b, i) => <GlassPane key={i} b={b} glass={glass} id={`${id}-${i}`} />);
    }
    case "inlay": {
      const c = metal(edge === "none" ? "gold" : edge);
      const pats: ReactNode[] = [
        <rect key="a" x={x + w * 0.7} y={y} width="1.1" height={h} fill={c} />,
        <g key="b">{[0.25, 0.5, 0.75].map(t => <rect key={t} x={x} y={y + h * t} width={w} height=".9" fill={c} />)}</g>,
        <rect key="c" x={x + 9} y={y + 9} width={w - 18} height={h - 18} fill="none" stroke={c} strokeWidth=".9" />,
        <g key="d"><rect x={x + w * 0.3} y={y} width=".9" height={h} fill={c} /><rect x={x} y={y + h * 0.62} width={w} height=".9" fill={c} /></g>,
      ];
      return pats[v % pats.length];
    }
    case "transom": {
      const ty = y + h * 0.78;
      return (
        <g>
          <line x1={x} y1={ty} x2={x + w} y2={ty} stroke="#000" strokeOpacity=".5" strokeWidth=".9" />
          <line x1={x} y1={ty + .7} x2={x + w} y2={ty + .7} stroke="#fff" strokeOpacity=".2" strokeWidth=".5" />
          {decorate("grooves", v + 1, { x, y: ty, w, h: h - (ty - y) }, f, edge, glass, id)}
        </g>
      );
    }
    case "flat": {
      if (v % 4 === 1) return <Groove x1={x} y1={y + h * 0.33} x2={x + w} y2={y + h * 0.33} />;
      if (v % 4 === 2) return <Groove x1={x + w * 0.82} y1={y} x2={x + w * 0.82} y2={y + h} />;
      if (v % 4 === 3) return <rect x={x + 7} y={y + 7} width={w - 14} height={h - 14} fill="none" stroke="#000" strokeOpacity=".2" strokeWidth=".7" />;
      return null;
    }
    default:
      return null;
  }
}

export interface DoorProps {
  kind: DoorKind;
  finish: Finish | string;
  edge?: Edge;
  glass?: string;
  variant?: number;
  heightMm?: number;
  frame?: boolean;
  handle?: boolean;
  className?: string;
  title?: string;
  /** обрезать viewBox по полотну (для анимаций, где рамку рисует CSS) */
  crop?: boolean;
}

export function Door({ kind, finish: fin, edge = "none", glass, variant = 0, heightMm = 2070, frame = true, handle = true, className, title, crop = false }: DoorProps) {
  const rid = useId().replace(/:/g, "");
  const f = typeof fin === "string" ? finishById(fin) : fin;
  const frameColor = shade(f.color, -0.14);

  // ----- особые типы с собственной геометрией -----
  if (kind === "cabinet") return <Cabinet f={f} edge={edge} v={variant} id={rid} className={className} title={title} />;
  if (kind === "wall") return <WallPanels f={f} v={variant} id={rid} className={className} title={title} />;
  if (kind === "slats") return <Slats f={f} v={variant} id={rid} className={className} title={title} />;
  if (kind === "mirror") return <Mirror f={f} edge={edge} v={variant} id={rid} className={className} title={title} />;
  if (kind === "aluframe" || kind === "pivot") return <AluFrame f={f} edge={edge} glass={glass ?? "clear"} v={variant} pivot={kind === "pivot"} id={rid} className={className} title={title} />;

  const leafH = 207 * Math.min(1.5, Math.max(0.85, heightMm / 2070));
  const VBH = leafH + 13;
  const L: Box = { x: 10, y: 9, w: 80, h: leafH };
  const isEntrance = kind === "entrance";
  const isHidden = kind === "hidden";
  const isSliding = kind === "sliding";
  const shift = isSliding ? 14 : 0;

  return (
    <svg viewBox={crop ? `${L.x} ${L.y} ${L.w} ${L.h}` : `0 0 ${isSliding ? 128 : 100} ${VBH}`} className={className} role="img" aria-label={title ?? "Дверь"} preserveAspectRatio={crop ? "none" : "xMidYMax meet"}>
      <defs><clipPath id={`${rid}-leaf`}><rect x={L.x} y={L.y} width={L.w} height={L.h} /></clipPath></defs>
      {isHidden && (
        <g>
          <rect x="0" y="0" width="100" height={VBH} fill={shade(f.color, 0.03)} />
          <rect x="0" y="0" width="100" height={VBH} fill="url(#g-vert)" />
        </g>
      )}
      {isSliding && (
        <g>
          <rect x="10" y="9" width="80" height={leafH} fill="#0d0c0b" opacity=".85" />
          <rect x="6" y="3" width="118" height="4" rx="1" fill={metal("black")} />
        </g>
      )}
      {frame && !isHidden && !isSliding && (
        <g>
          <rect x="4" y="3" width="92" height={VBH - 3} fill={isEntrance ? "#1d1d1e" : frameColor} />
          <rect x="4" y="3" width="92" height={VBH - 3} fill="url(#g-light)" />
          <rect x="9" y="8" width="82" height={VBH - 8} fill="#000" opacity=".35" />
        </g>
      )}
      <g transform={`translate(${shift} 0)`}>
        <Surface b={L} finish={f} id={rid} />
        {isEntrance ? (
          <g>
            {decorate(variant % 2 ? "vgrooves" : "grooves", variant, L, f, edge, glass, rid)}
            <rect x={L.x + 6} y={L.y + 6} width={L.w - 12} height={L.h - 12} fill="none" stroke="#000" strokeOpacity=".25" strokeWidth=".8" />
            <circle cx={L.x + L.w / 2} cy={L.y + L.h * 0.36} r="1.4" fill={metal("black")} />
            <rect x={L.x + L.w - 11} y={L.y + L.h * 0.38} width="2.6" height={L.h * 0.3} rx="1.3" fill={metal(edge === "none" ? "black" : edge)} />
          </g>
        ) : isHidden ? (
          <g>
            <rect x={L.x} y={L.y} width={L.w} height={L.h} fill="none" stroke="#000" strokeOpacity=".28" strokeWidth=".6" />
            {variant % 2 === 0 && <Handle x={L.x + L.w - 7} y={L.y + L.h * 0.52} edge={edge} />}
          </g>
        ) : isSliding ? (
          decorate(variant % 2 ? "glass" : "grooves", variant, L, f, edge, glass ?? "satin", rid)
        ) : (
          decorate(kind, variant, L, f, edge, glass, rid)
        )}
        <rect x={L.x} y={L.y} width={L.w} height={L.h} fill="url(#g-light)" opacity={isHidden ? 0.4 : 1} />
        <rect x={L.x} y={L.y} width={L.w} height={L.h} fill="url(#g-vert)" />
        {edge !== "none" && !isEntrance && !isHidden && (
          <g>
            <rect x={L.x} y={L.y} width="1.1" height={L.h} fill={metal(edge)} />
            <rect x={L.x + L.w - 1.1} y={L.y} width="1.1" height={L.h} fill={metal(edge)} />
            <rect x={L.x} y={L.y} width={L.w} height="1.1" fill={metal(edge)} />
          </g>
        )}
        {handle && !isEntrance && !isHidden && (isSliding
          ? <rect x={L.x + 4} y={L.y + L.h * 0.42} width="2" height={L.h * 0.18} rx="1" fill={metal(edge)} />
          : <Handle x={L.x + L.w - 7} y={L.y + L.h * 0.52} edge={edge} />)}
      </g>
      <rect x="0" y={VBH - 0.6} width={isSliding ? 128 : 100} height=".6" fill="#000" opacity=".3" />
    </svg>
  );
}

/* ---------- специальные изделия ---------- */
type SP = { f: Finish; v: number; id: string; className?: string; title?: string; edge?: Edge };

function WallPanels({ f, v, id, className, title }: SP) {
  const W = 140, H = 210;
  const b = { x: 0, y: 0, w: W, h: H };
  const pat = v % 8;
  const content: ReactNode[] = [];
  if (pat === 0 || pat === 4) for (let i = 1; i < 10; i++) content.push(<Groove key={i} x1={i * 14} y1={0} x2={i * 14} y2={H} />);
  if (pat === 1) [0, 1, 2].forEach(r => [0, 1].forEach(c => content.push(<rect key={`${r}${c}`} x={6 + c * 66} y={6 + r * 68} width={62} height={64} fill="none" stroke="#000" strokeOpacity=".28" />)));
  if (pat === 2) [0, 1].forEach(c => { content.push(<Molding key={`a${c}`} b={{ x: 8 + c * 66, y: 8, w: 58, h: 120 }} color={f.color} />); content.push(<Molding key={`b${c}`} b={{ x: 8 + c * 66, y: 138, w: 58, h: 64 }} color={f.color} />); });
  if (pat === 3) for (let i = -10; i < 20; i++) content.push(<Groove key={i} x1={i * 14} y1={0} x2={i * 14 + 120} y2={H} />);
  if (pat === 5) { content.push(<Groove key="h" x1={0} y1={H * 0.5} x2={W} y2={H * 0.5} />); for (let i = 1; i < 4; i++) content.push(<Groove key={i} x1={i * 35} y1={0} x2={i * 35} y2={H} />); }
  if (pat === 6) for (let r = 0; r < 7; r++) content.push(<Groove key={r} x1={0} y1={r * 30 + 15} x2={W} y2={r * 30 + 15} strong={0.6} />);
  if (pat === 7) {
    const s = 14, hh = s * Math.sqrt(3);
    for (let r = -1; r < 10; r++) for (let c = -1; c < 7; c++) {
      const cx = c * s * 1.5 * 1.0 + 10, cy = r * hh + (c % 2 ? hh / 2 : 0);
      const pts = Array.from({ length: 6 }, (_, k) => { const a = Math.PI / 3 * k; return `${cx + s * Math.cos(a)},${cy + s * Math.sin(a)}`; }).join(" ");
      content.push(<polygon key={`${r}-${c}`} points={pts} fill={(r + c) % 3 === 0 ? shade(f.color, -0.08) : "none"} stroke="#000" strokeOpacity=".3" strokeWidth=".7" />);
    }
  }
  const stoneF = pat === 6 ? { ...f, texture: "stone" as const } : f;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={title ?? "Стеновые панели"}>
      <defs><clipPath id={`${id}-leaf`}><rect x="0" y="0" width={W} height={H} /></clipPath></defs>
      <Surface b={b} finish={stoneF} id={id} />
      <g clipPath={`url(#${id}-leaf)`}>{content}</g>
      <rect x="0" y="0" width={W} height={H} fill="url(#g-light)" opacity=".7" />
    </svg>
  );
}

function Slats({ f, v, id, className, title }: SP) {
  const W = 140, H = 210, gap = [3, 4, 2, 6][v % 4], sw = [7, 8, 5, 10][v % 4];
  const bars: ReactNode[] = [];
  for (let x = 2; x < W; x += sw + gap) bars.push(
    <g key={x}>
      <rect x={x} y="0" width={sw} height={H} fill={f.color} />
      <rect x={x} y="0" width={sw} height={H} filter="url(#tx-wood)" opacity=".38" />
      <rect x={x} y="0" width={sw * 0.35} height={H} fill="#fff" opacity=".08" />
      <rect x={x + sw - 1} y="0" width="1" height={H} fill="#000" opacity=".25" />
    </g>);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={title ?? "Декоративные рейки"}>
      <rect width={W} height={H} fill="#141210" />
      <g clipPath={`url(#${id}-c)`}>{bars}</g>
      <defs><clipPath id={`${id}-c`}><rect width={W} height={H} /></clipPath></defs>
      <rect width={W} height={H} fill="url(#g-vert)" />
    </svg>
  );
}

function Cabinet({ f, v, id, className, title, edge = "none" }: SP) {
  const W = 160, H = 110;
  const b = { x: 10, y: 22, w: 140, h: 58 };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={title ?? "Тумба"}>
      <defs><clipPath id={`${id}-leaf`}><rect {...{ x: b.x, y: b.y, width: b.w, height: b.h }} /></clipPath></defs>
      <rect x="6" y="14" width="148" height="8" rx="1.5" fill="#e8e4dd" />
      <rect x="6" y="14" width="148" height="8" rx="1.5" fill="url(#g-light)" />
      {v % 2 === 0 && <ellipse cx="80" cy="15" rx="26" ry="3" fill="#cfcac2" />}
      <Surface b={b} finish={f} id={id} />
      <line x1="10" y1="51" x2="150" y2="51" stroke="#000" strokeOpacity=".35" />
      {v % 3 !== 2 && <line x1="80" y1="22" x2="80" y2="80" stroke="#000" strokeOpacity=".35" />}
      <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="url(#g-light)" />
      <rect x="60" y="26" width="40" height="1.4" rx=".7" fill={metal(edge === "none" ? "black" : edge)} />
      <rect x="60" y="55" width="40" height="1.4" rx=".7" fill={metal(edge === "none" ? "black" : edge)} />
      {v % 4 !== 3 ? <><rect x="16" y="80" width="3" height="18" fill="#222" /><rect x="141" y="80" width="3" height="18" fill="#222" /></> : null}
      <ellipse cx="80" cy="104" rx="70" ry="3" fill="#000" opacity=".15" />
    </svg>
  );
}

function Mirror({ f, v, className, title, edge = "gold" }: SP) {
  const W = 90, H = 210;
  const r = v % 4 === 0 ? 40 : v % 4 === 2 ? 12 : 0;
  const path = v % 4 === 0
    ? `M5 205 L5 45 A40 40 0 0 1 85 45 L85 205 Z`
    : undefined;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={title ?? "Зеркало"}>
      {path ? (
        <g>
          <path d={path} fill={edge === "none" ? f.color : metal(edge)} />
          <path d="M9 201 L9 45 A36 36 0 0 1 81 45 L81 201 Z" fill="url(#g-mirror)" />
        </g>
      ) : (
        <g>
          <rect x="5" y={v % 4 === 3 ? 5 : 30} width="80" height={v % 4 === 3 ? 200 : 150} rx={r} fill={edge === "none" ? f.color : metal(edge)} />
          <rect x="9" y={v % 4 === 3 ? 9 : 34} width="72" height={v % 4 === 3 ? 192 : 142} rx={Math.max(0, r - 4)} fill="url(#g-mirror)" />
        </g>
      )}
      <path d="M20 60 L40 60 L15 160 L12 140 Z" fill="#fff" opacity=".18" />
    </svg>
  );
}

function AluFrame({ f, v, glass, pivot, id, className, title, edge = "black" }: SP & { glass: string; pivot: boolean }) {
  const W = pivot ? 120 : 140, H = 220;
  const prof = f.texture === "wood" || f.texture === "stone" ? f.color : edge === "none" ? "#1c1c1c" : (EDGES.find(e => e.id === edge)?.color ?? "#1c1c1c");
  const panes: Box[] = [];
  if (pivot) panes.push({ x: 8, y: 6, w: W - 16, h: H - 12 });
  else {
    const cols = [2, 3, 1, 2, 4][v % 5], rows = [1, 3, 1, 4, 1][v % 5];
    const pw = (W - 8) / cols, ph = (H - 8) / rows;
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) panes.push({ x: 4 + c * pw + 1.5, y: 4 + r * ph + 1.5, w: pw - 3, h: ph - 3 });
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={title ?? "Перегородка"}>
      <rect x="0" y="0" width={W} height={H} fill={prof} />
      <rect x="0" y="0" width={W} height={H} fill="url(#g-light)" />
      {panes.map((b, i) => <GlassPane key={i} b={b} glass={glass} id={`${id}-p${i}`} r={v % 5 === 3 && !pivot && i === 0 ? 0 : 0} />)}
      {pivot && <rect x={W - 22} y={H * 0.25} width="3" height={H * 0.5} rx="1.5" fill={metal("black")} />}
      {pivot && <circle cx={W * 0.25} cy={H - 3} r="1.6" fill={metal("gold")} />}
    </svg>
  );
}

/** Удобная обёртка для товара */
export function ProductDoor({ p, finish, edge, heightMm, className }: { p: Product; finish?: string; edge?: Edge; heightMm?: number; className?: string }) {
  return (
    <Door kind={p.kind} finish={finish ?? p.defaultFinish} edge={edge ?? p.edge} glass={p.glass} variant={p.variant}
      heightMm={heightMm} className={className} title={p.name} />
  );
}
