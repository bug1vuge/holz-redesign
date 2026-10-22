// Текстуры дерева и камня генерируются один раз на canvas и переиспользуются как картинки.
// Это намного дешевле SVG-фильтров feTurbulence, которые браузер пересчитывает при каждой перерисовке.

function rng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

function noise1D(len: number, octaves: number, seed: number) {
  const r = rng(seed);
  const out = new Float32Array(len);
  for (let o = 0; o < octaves; o++) {
    const step = Math.max(1, Math.floor(len / (4 << o)));
    const pts = Array.from({ length: Math.ceil(len / step) + 2 }, r);
    const amp = 1 / (1 << o);
    for (let i = 0; i < len; i++) {
      const t = i / step, k = Math.floor(t), f = t - k, sm = f * f * (3 - 2 * f);
      out[i] += (pts[k] * (1 - sm) + pts[k + 1] * sm) * amp;
    }
  }
  let mn = Infinity, mx = -Infinity;
  out.forEach(v => { mn = Math.min(mn, v); mx = Math.max(mx, v); });
  return out.map(v => (v - mn) / (mx - mn || 1));
}

function noise2D(w: number, h: number, octaves: number, seed: number, base = 8) {
  const out = new Float32Array(w * h);
  const r = rng(seed);
  for (let o = 0; o < octaves; o++) {
    const cells = base << o, gw = cells + 2, gh = Math.ceil(cells * h / w) + 2;
    const grid = Array.from({ length: gw * gh }, r);
    const amp = 1 / (1.8 ** o);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const fx = x / w * cells, fy = y / w * cells;
      const ix = Math.floor(fx), iy = Math.floor(fy);
      const tx = fx - ix, ty = fy - iy, sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      const a = grid[iy * gw + ix], b = grid[iy * gw + ix + 1], c = grid[(iy + 1) * gw + ix], d = grid[(iy + 1) * gw + ix + 1];
      out[y * w + x] += ((a * (1 - sx) + b * sx) * (1 - sy) + (c * (1 - sx) + d * sx) * sy) * amp;
    }
  }
  let mn = Infinity, mx = -Infinity;
  out.forEach(v => { mn = Math.min(mn, v); mx = Math.max(mx, v); });
  return out.map(v => (v - mn) / (mx - mn || 1));
}

function toUrl(w: number, h: number, alpha: (x: number, y: number) => number, white = false) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4, a = Math.max(0, Math.min(1, alpha(x, y)));
    img.data[i] = img.data[i + 1] = img.data[i + 2] = white ? 255 : 0;
    img.data[i + 3] = Math.round(a * 255);
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL("image/png");
}

export interface TextureSet { wood: string; woodLight: string; stone: string; vein: string }
let cache: TextureSet | null = null;

export function getTextures(): TextureSet {
  if (cache) return cache;
  if (typeof document === "undefined") return { wood: "", woodLight: "", stone: "", vein: "" };
  const W = 200, H = 512;
  const cols = noise1D(W, 6, 7), cols2 = noise1D(W, 5, 19), drift = noise1D(H, 3, 3);
  const fine = noise1D(W * 3, 4, 31);
  const wood = toUrl(W, H, (x, y) => {
    const sx = Math.min(W - 1, Math.max(0, Math.round(x + (drift[y] - 0.5) * 10)));
    const v = cols[sx] * 0.75 + cols2[sx] * 0.25;
    return Math.pow(v, 2.2) * 0.9 + fine[(sx * 3 + (y >> 6)) % fine.length] * 0.12;
  });
  const woodLight = toUrl(W, H, (x, y) => {
    const sx = Math.min(W - 1, Math.max(0, Math.round(x + (drift[y] - 0.5) * 6)));
    return Math.max(0, cols2[sx] - 0.62) * 2.2;
  }, true);
  const S = 256;
  const st = noise2D(S, S, 5, 11, 4);
  const stone = toUrl(S, S, (x, y) => Math.pow(st[y * S + x], 1.6) * 0.95);
  const vn = noise2D(S, S, 4, 4, 3);
  const vein = toUrl(S, S, (x, y) => {
    const v = Math.abs(Math.sin(vn[y * S + x] * 18));
    return v < 0.08 ? (0.08 - v) * 9 : 0;
  });
  cache = { wood, woodLight, stone, vein };
  return cache;
}
