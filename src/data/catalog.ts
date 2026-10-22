// Демо-данные каталога HOLZ. Названия коллекций и моделей взяты с holzdoors.ru,
// цены и характеристики — условные, для демонстрации интерфейса.

export type Texture = "wood" | "stone" | "solid" | "enamel" | "soft";

export interface Finish {
  id: string;
  name: string;
  group: FinishGroup;
  color: string;
  tone?: string; // второй тон для текстуры
  texture: Texture;
  surcharge: number; // наценка, %
}

export type FinishGroup = "Под дерево" | "Под камень" | "Однотонные" | "Эмаль" | "Soft Touch";

export const FINISH_GROUPS: FinishGroup[] = ["Под дерево", "Под камень", "Однотонные", "Эмаль", "Soft Touch"];

export const FINISHES: Finish[] = [
  { id: "oak", name: "Дуб натуральный", group: "Под дерево", color: "#b88a57", tone: "#8f6438", texture: "wood", surcharge: 0 },
  { id: "savanna", name: "Орех саванна", group: "Под дерево", color: "#7d5434", tone: "#5a3a22", texture: "wood", surcharge: 0 },
  { id: "moro", name: "Орех моро", group: "Под дерево", color: "#4d3324", tone: "#33211a", texture: "wood", surcharge: 4 },
  { id: "umbra", name: "Дженай умбра", group: "Под дерево", color: "#5e4c3c", tone: "#43362b", texture: "wood", surcharge: 4 },
  { id: "caravan", name: "Пустынный караван", group: "Под дерево", color: "#c7a985", tone: "#a3855f", texture: "wood", surcharge: 0 },
  { id: "bleached", name: "Дуб беленый", group: "Под дерево", color: "#dccfba", tone: "#bfae95", texture: "wood", surcharge: 0 },
  { id: "agate", name: "Агатовая дымка", group: "Под камень", color: "#6f6a66", tone: "#4f4b48", texture: "stone", surcharge: 6 },
  { id: "desert", name: "Безмолвная пустыня", group: "Под камень", color: "#b8ad9c", tone: "#958a79", texture: "stone", surcharge: 6 },
  { id: "bianco", name: "Мрамор бьянко", group: "Под камень", color: "#e6e2dc", tone: "#b5aea4", texture: "stone", surcharge: 8 },
  { id: "graphite", name: "Графит", group: "Однотонные", color: "#3b3a3a", texture: "solid", surcharge: 0 },
  { id: "cashmere", name: "Кашемир", group: "Однотонные", color: "#cfc4b3", texture: "solid", surcharge: 0 },
  { id: "white", name: "Белый матовый", group: "Однотонные", color: "#ecebe6", texture: "solid", surcharge: 0 },
  { id: "e-white", name: "Эмаль белая", group: "Эмаль", color: "#f5f3ef", texture: "enamel", surcharge: 12 },
  { id: "e-sage", name: "Эмаль RAL 6021", group: "Эмаль", color: "#8fa883", texture: "enamel", surcharge: 15 },
  { id: "e-sand", name: "Эмаль NCS S 2010-Y30R", group: "Эмаль", color: "#d2bea4", texture: "enamel", surcharge: 15 },
  { id: "e-anthracite", name: "Эмаль RAL 7016", group: "Эмаль", color: "#3a3f43", texture: "enamel", surcharge: 15 },
  { id: "st-graphite", name: "Soft Touch графит", group: "Soft Touch", color: "#2e2d2e", texture: "soft", surcharge: 10 },
  { id: "st-cappuccino", name: "Soft Touch капучино", group: "Soft Touch", color: "#a18c78", texture: "soft", surcharge: 10 },
];

export const finishById = (id: string) => FINISHES.find(f => f.id === id) ?? FINISHES[0];

export type Edge = "none" | "black" | "champagne" | "gold";
export const EDGES: { id: Edge; name: string; color: string }[] = [
  { id: "black", name: "Чёрная", color: "#151515" },
  { id: "champagne", name: "Шампань", color: "#d9c39a" },
  { id: "gold", name: "Матовое золото", color: "#b8954f" },
  { id: "none", name: "В цвет полотна", color: "transparent" },
];

export type DoorKind =
  | "flat" | "grooves" | "vgrooves" | "panels" | "classic" | "asym" | "glass" | "inlay"
  | "entrance" | "aluframe" | "pivot" | "sliding" | "wall" | "slats" | "cabinet" | "mirror" | "transom" | "hidden";

export type Style = "modern" | "classic";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  collection: string;
  style: Style;
  kind: DoorKind;
  variant: number;
  price: number;
  finishes: string[];
  defaultFinish: string;
  edge: Edge;
  glass?: "satin" | "bronze" | "clear" | "black";
  isNew?: boolean;
  inStock?: boolean;
  heights: number[];
  thickness: number[];
}

export interface Category {
  slug: string;
  name: string;
  short: string;
  brand?: string;
  description: string;
  kind: DoorKind;
  finish: string;
  type: "products" | "material";
}

export const CATEGORIES: Category[] = [
  { slug: "in-stock", name: "Товары в наличии", short: "В наличии", description: "Модели, которые можно забрать со склада за 1–3 дня без ожидания производства.", kind: "grooves", finish: "oak", type: "products" },
  { slug: "mezhkomnatnye-dveri", name: "Межкомнатные двери", short: "Межкомнатные", description: "Современные и классические коллекции: от лаконичного Edel до неоклассики Poesie. Высота полотна до 3000 мм.", kind: "panels", finish: "e-white", type: "products" },
  { slug: "vhodnye-dveri", name: "Входные двери", short: "Входные", description: "Флагман, Scandi, North и другие серии: терморазрыв, панели в цвет межкомнатных дверей.", kind: "entrance", finish: "e-anthracite", type: "products" },
  { slug: "skrytye-dveri", name: "Скрытые двери", short: "Скрытые", brand: "Illusion", description: "Двери Illusion скрытого монтажа: полотно в одной плоскости со стеной, без наличников.", kind: "hidden", finish: "white", type: "products" },
  { slug: "peregorodki", name: "Перегородки в покрытиях", short: "Перегородки", brand: "Aura", description: "Перегородки Aura в тех же покрытиях, что и двери: единый стиль во всей квартире.", kind: "aluframe", finish: "umbra", type: "products" },
  { slug: "alyuminievye-peregorodki", name: "Алюминиевые перегородки", short: "Алюминиевые", brand: "Limitless", description: "Тонкий алюминиевый профиль и стекло: зонирование без потери света.", kind: "aluframe", finish: "graphite", type: "products" },
  { slug: "pivot", name: "Алюминиевые двери PIVOT", short: "PIVOT", description: "Двери на поворотной оси для широких проёмов и эффектного входа в гостиную.", kind: "pivot", finish: "graphite", type: "products" },
  { slug: "razdvizhnye-dveri", name: "Раздвижные двери", short: "Раздвижные", brand: "Motion", description: "Системы Roto, Shift, Book, Compack, Invisible и Loft — экономят место и работают бесшумно.", kind: "sliding", finish: "caravan", type: "products" },
  { slug: "stenovye-paneli", name: "Стеновые панели", short: "Панели", brand: "Geometria", description: "INTEGRO, CORSO, DIPLOMAT, FORMA, VERSUS, CORNER, STONE WALL и СОТЫ — в цвет дверей.", kind: "wall", finish: "moro", type: "products" },
  { slug: "dekorativnye-rejki", name: "Декоративные рейки", short: "Рейки", brand: "Immensity", description: "Рейки Immensity для акцентных стен, потолков и зонирования.", kind: "slats", finish: "savanna", type: "products" },
  { slug: "tumby", name: "Тумбы", short: "Тумбы", description: "Тумбы в покрытиях дверей — мебель, которая продолжает интерьер.", kind: "cabinet", finish: "cashmere", type: "products" },
  { slug: "zerkala", name: "Зеркала", short: "Зеркала", description: "Зеркала в рамах с кромкой в цвет фурнитуры.", kind: "mirror", finish: "graphite", type: "products" },
  { slug: "falsh-framugi", name: "Двери с фальшфрамугой", short: "Фальшфрамуги", description: "Визуально поднимают потолок: дверь и фрамуга в одной плоскости.", kind: "transom", finish: "e-sand", type: "products" },
  { slug: "kamennyj-shpon", name: "Двери в каменном шпоне", short: "Каменный шпон", description: "Натуральный каменный шпон толщиной 1–2 мм: фактура сланца на полотне двери.", kind: "flat", finish: "agate", type: "products" },
  { slug: "pokrytiya", name: "Покрытия", short: "Покрытия", description: "40 покрытий: под дерево, под камень, однотонные, эмаль по RAL и NCS, Soft Touch.", kind: "flat", finish: "e-sage", type: "material" },
  { slug: "steklo", name: "Стекло для дверей", short: "Стекло", description: "Сатинат, бронза, прозрачное и чёрное стекло, триплекс.", kind: "glass", finish: "white", type: "material" },
  { slug: "furnitura", name: "Фурнитура", short: "Фурнитура", description: "Ручки, петли и магнитные замки в цветах чёрный, шампань, матовое золото.", kind: "flat", finish: "graphite", type: "material" },
  { slug: "patina", name: "Патина", short: "Патина", description: "Патина золото, серебро и бронза для классических коллекций.", kind: "classic", finish: "e-white", type: "material" },
  { slug: "pogonazh", name: "Погонаж", short: "Погонаж", description: "Наличники, добоборы и плинтус в цвет дверей.", kind: "flat", finish: "oak", type: "material" },
  { slug: "oformlenie", name: "Оформление", short: "Оформление", description: "Капители, колонны и карнизы для классических интерьеров.", kind: "classic", finish: "e-sand", type: "material" },
];

export const categoryBySlug = (s: string) => CATEGORIES.find(c => c.slug === s);

// ---------- коллекции межкомнатных дверей ----------
interface CollectionDef {
  name: string; style: Style; kind: DoorKind; price: number; models: string[];
  finishes: string[]; edge?: Edge; glass?: Product["glass"]; isNew?: boolean;
}
const WOOD = ["oak", "savanna", "moro", "umbra", "caravan", "bleached"];
const STONE = ["agate", "desert", "bianco"];
const SOLID = ["graphite", "cashmere", "white"];
const ENAMEL = ["e-white", "e-sage", "e-sand", "e-anthracite"];
const SOFT = ["st-graphite", "st-cappuccino"];
const ALL = [...WOOD, ...STONE, ...SOLID, ...ENAMEL, ...SOFT];

export const INTERIOR: CollectionDef[] = [
  { name: "Edel", style: "modern", kind: "grooves", price: 24900, isNew: true, edge: "champagne", models: ["Edel 1", "Edel 2", "Edel 3", "Edel 4", "Edel 5"], finishes: ["umbra", "caravan", "agate", "desert", "savanna", ...ENAMEL, ...SOFT] },
  { name: "Poesie", style: "classic", kind: "panels", price: 31900, models: ["Ps 1", "Ps 2", "Ps Asm 1", "Ps Asm 2", "Ps FR 3", "Ps 6"], finishes: [...ENAMEL, "agate", "umbra", "moro"] },
  { name: "Nodo", style: "modern", kind: "inlay", price: 27400, edge: "gold", models: ["Nodo 1", "Nodo 2", "Nodo 3", "Nodo 4"], finishes: [...ENAMEL, ...SOFT, "moro"] },
  { name: "Fusion", style: "modern", kind: "glass", price: 21900, glass: "satin", models: ["Fusion 1", "Fusion 2", "Fusion 3", "Fusion 4", "Fusion 5"], finishes: [...WOOD, ...SOLID] },
  { name: "Palitra", style: "modern", kind: "flat", price: 16900, models: ["Palitra 1", "Palitra 2", "Palitra 3", "Palitra 4", "Palitra 5", "Palitra 6"], finishes: ALL },
  { name: "Neo Classic", style: "classic", kind: "classic", price: 29900, models: ["Neo Classic 1", "Neo Classic 2", "Neo Classic 3", "Neo Classic 4"], finishes: [...ENAMEL, "bleached", "cashmere"] },
  { name: "Felicia", style: "classic", kind: "classic", price: 33900, glass: "satin", models: ["Felicia 1", "Felicia 2", "Felicia 3"], finishes: [...ENAMEL, "bleached"] },
  { name: "Deloress", style: "classic", kind: "panels", price: 35900, models: ["Deloress 1", "Deloress 2", "Deloress 3"], finishes: [...ENAMEL] },
  { name: "Plaza", style: "modern", kind: "vgrooves", price: 22900, models: ["Plaza 1", "Plaza 2", "Plaza 3", "Plaza 4"], finishes: [...WOOD, ...SOLID, ...SOFT] },
  { name: "Elite", style: "classic", kind: "asym", price: 38900, edge: "gold", models: ["Elite 1", "Elite 2", "Elite 3"], finishes: [...ENAMEL, "moro"] },
  { name: "Fly", style: "modern", kind: "glass", price: 23900, glass: "bronze", models: ["Fly 1", "Fly 2", "Fly 3", "Fly 4"], finishes: [...WOOD, ...SOFT] },
  { name: "Innovation", style: "modern", kind: "inlay", price: 25900, edge: "black", models: ["Innovation 1", "Innovation 2", "Innovation 3"], finishes: [...SOLID, ...ENAMEL] },
  { name: "Galant", style: "classic", kind: "classic", price: 30900, models: ["Galant 1", "Galant 2", "Galant 3"], finishes: [...ENAMEL, ...WOOD] },
  { name: "Decanto", style: "classic", kind: "panels", price: 32900, models: ["Decanto 1", "Decanto 2", "Decanto 3"], finishes: [...ENAMEL] },
  { name: "Dante", style: "modern", kind: "grooves", price: 19900, models: ["Dante 1", "Dante 2", "Dante 3", "Dante 4"], finishes: [...WOOD, ...STONE, ...SOLID] },
  { name: "Space", style: "modern", kind: "vgrooves", price: 20900, models: ["Space 1", "Space 2", "Space 3"], finishes: [...SOLID, ...SOFT, ...WOOD] },
  { name: "Filigran", style: "modern", kind: "inlay", price: 28900, edge: "champagne", models: ["Filigran 1", "Filigran 2", "Filigran 3"], finishes: [...ENAMEL, ...SOFT] },
  { name: "Zeit", style: "modern", kind: "asym", price: 26900, models: ["Zeit 1", "Zeit 2", "Zeit 3"], finishes: [...STONE, ...SOLID, ...WOOD] },
  { name: "Volo", style: "modern", kind: "glass", price: 24400, glass: "black", models: ["Volo 1", "Volo 2", "Volo 3"], finishes: [...SOFT, ...SOLID, "moro"] },
  { name: "Endless", style: "modern", kind: "flat", price: 18900, edge: "black", models: ["Endless 1", "Endless 2", "Endless 3"], finishes: ALL },
  { name: "Country", style: "classic", kind: "panels", price: 27900, models: ["Country 1", "Country 2", "Country 3"], finishes: [...WOOD] },
  { name: "Inlay", style: "modern", kind: "inlay", price: 29400, edge: "gold", models: ["Inlay 1", "Inlay 2", "Inlay 3"], finishes: [...ENAMEL, "moro", "umbra"] },
];

const slugify = (s: string) =>
  s.toLowerCase()
    .replace(/[а-яё]/g, ch => ({ а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya" } as Record<string, string>)[ch] ?? ch)
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const PRODUCTS: Product[] = [];
let seq = 0;
function add(p: Omit<Product, "id" | "slug">) {
  seq++;
  PRODUCTS.push({ ...p, id: String(seq), slug: slugify(p.name) });
}

INTERIOR.forEach(c => c.models.forEach((m, i) => add({
  name: `Дверь ${m}`, category: "mezhkomnatnye-dveri", collection: c.name, style: c.style, kind: c.kind, variant: i,
  price: c.price + i * 1100, finishes: c.finishes, defaultFinish: c.finishes[i % c.finishes.length], edge: c.edge ?? "none",
  glass: c.glass, isNew: c.isNew && i < 3, inStock: (seq % 5 === 0), heights: [2000, 2100, 2200, 2400, 2700, 3000], thickness: [38, 42, 58],
})));

const ENTR = [
  ["Флагман", [6.1, 12, 18, 24, 30, 37, 44, 51, 54]], ["Scandi", [1, 2, 3]], ["North", [1]], ["Intro", [1, 2]],
  ["Im", [1, 2, 3, 4]], ["Nt", [1, 2, 3]], ["Nt HPL", [1, 2]], ["Hi Nt", [1, 2, 3]],
] as const;
ENTR.forEach(([n, nums], ci) => nums.forEach((num, i) => add({
  name: `Входная дверь ${n} ${num}`, category: "vhodnye-dveri", collection: n, style: "modern", kind: "entrance", variant: (i + ci) % 4,
  price: 54900 + ci * 4000 + i * 1500, finishes: ["e-anthracite", "graphite", "moro", "umbra", "st-graphite", "agate"], defaultFinish: ["e-anthracite", "moro", "graphite", "umbra"][(i + ci) % 4],
  edge: "black", inStock: i % 3 === 0, heights: [2050, 2100, 2200], thickness: [90, 105],
})));

const simple = (category: string, collection: string, kind: DoorKind, names: string[], price: number, finishes: string[], extra: Partial<Product> = {}) =>
  names.forEach((nm, i) => add({
    name: nm, category, collection, style: "modern", kind, variant: i, price: price + i * 1800, finishes,
    defaultFinish: finishes[i % finishes.length], edge: "none", heights: [2000, 2100, 2400, 2700, 3000], thickness: [42, 58], ...extra,
  }));

simple("skrytye-dveri", "Illusion", "hidden", ["Illusion Standard", "Illusion Reverse", "Illusion Paint", "Illusion Wall", "Illusion Double"], 26900, ["white", "e-white", "cashmere", "graphite", "e-sand"], { edge: "black" });
simple("peregorodki", "Aura", "aluframe", ["Aura 1", "Aura 2", "Aura 3", "Aura 4"], 42900, ["umbra", "moro", "oak", "graphite"], { glass: "clear" });
simple("alyuminievye-peregorodki", "Limitless", "aluframe", ["Limitless 1", "Limitless 2", "Limitless 3", "Limitless Arc", "Limitless Grid"], 48900, ["graphite", "st-graphite"], { glass: "clear", edge: "black" });
simple("pivot", "Limitless Pivot", "pivot", ["Pivot P1", "Pivot P2", "Pivot P3"], 89900, ["graphite", "st-graphite", "moro"], { glass: "bronze", edge: "black" });
simple("razdvizhnye-dveri", "Motion", "sliding", ["Система Roto", "Система Shift", "Система Book", "Система Compack", "Система Invisible", "Система Loft"], 15900, [...WOOD, ...ENAMEL]);
simple("stenovye-paneli", "Geometria", "wall", ["Панели INTEGRO", "Панели CORSO", "Панели DIPLOMAT", "Панели FORMA", "Панели VERSUS", "Панели CORNER", "Панели STONE WALL", "Панели СОТЫ"], 8900, [...WOOD, ...STONE, ...ENAMEL]);
simple("dekorativnye-rejki", "Immensity", "slats", ["Рейки Immensity 1", "Рейки Immensity 2", "Рейки Immensity 3", "Рейки Immensity 4"], 4900, WOOD);
simple("tumby", "Holz Home", "cabinet", ["Тумба 600", "Тумба 800", "Тумба 1000", "Тумба 1200 подвесная"], 34900, [...WOOD, ...ENAMEL, ...SOFT]);
simple("zerkala", "Holz Mirror", "mirror", ["Зеркало Arc", "Зеркало Line", "Зеркало Frame", "Зеркало Tall"], 18900, ["graphite", "moro", "e-sand"], { edge: "gold" });
simple("falsh-framugi", "Edel / Plaza", "transom", ["Edel 1 с фальшфрамугой", "Plaza 2 с фальшфрамугой", "Palitra 1 с фальшфрамугой"], 36900, [...ENAMEL, ...WOOD], { heights: [2700, 3000] });
simple("kamennyj-shpon", "Stone", "flat", ["Stone Slate", "Stone Rust", "Stone Black", "Stone Silver"], 49900, STONE, { edge: "black" });

export const ALL_PRODUCTS = PRODUCTS;

export function productsIn(category: string): Product[] {
  if (category === "in-stock") return PRODUCTS.filter(p => p.inStock);
  return PRODUCTS.filter(p => p.category === category);
}

export function findProduct(category: string, slug: string) {
  return PRODUCTS.find(p => p.slug === slug && (p.category === category || (category === "in-stock" && p.inStock)));
}

export function priceFor(p: Product, finishId: string, height: number, thickness: number) {
  const f = finishById(finishId);
  let price = p.price * (1 + f.surcharge / 100);
  if (height > 2400) price *= 1 + (height - 2400) / 3000; // «высокие двери без наценки» до 2400 мм
  if (thickness >= 58) price *= 1.12;
  return Math.round(price / 100) * 100;
}

export const rub = (n: number) => n.toLocaleString("ru-RU") + " ₽";

// ---------- материалы ----------
export const GLASS = [
  { id: "satin", name: "Сатинат белый", color: "#e9ece9", note: "Матовое стекло, мягко рассеивает свет" },
  { id: "bronze", name: "Бронза", color: "#7a5a3c", note: "Тонированное стекло тёплого оттенка" },
  { id: "clear", name: "Прозрачное", color: "#cfe0e2", note: "Максимум света, для перегородок" },
  { id: "black", name: "Чёрное лакобель", color: "#1b1b1c", note: "Глухое глянцевое стекло" },
  { id: "fluted", name: "Рифлёное «Флутс»", color: "#d9e2df", note: "Вертикальные линзы, приватность без потери света" },
  { id: "triplex", name: "Триплекс с узором", color: "#e2ddd3", note: "Безопасное стекло с плёнкой" },
];
export const PATINA = [
  { id: "gold", name: "Патина золото", color: "#b8954f" },
  { id: "silver", name: "Патина серебро", color: "#a7a9ac" },
  { id: "bronze", name: "Патина бронза", color: "#7d5a3a" },
  { id: "graphite", name: "Патина графит", color: "#4a4a4a" },
];
export const HARDWARE = [
  { id: "evolve", name: "Ручка Evolve", note: "Чёрный матовый · шампань · матовое золото", color: "#151515" },
  { id: "line", name: "Ручка Line", note: "Тонкий профиль, скрытая розетка", color: "#b8954f" },
  { id: "magnet", name: "Замок магнитный AGB", note: "Бесшумный, без язычка", color: "#7b7b7b" },
  { id: "hinge", name: "Петли скрытые 3D", note: "Регулировка в 3 плоскостях", color: "#9a9a9a" },
  { id: "stopper", name: "Ограничитель напольный", note: "В цвет фурнитуры", color: "#d9c39a" },
  { id: "pull", name: "Ручка-скоба для PIVOT", note: "Длина 600–1200 мм", color: "#1b1b1b" },
];
export const MOULDINGS = [
  { id: "nalichnik", name: "Наличник телескопический", note: "Ширина 70 и 90 мм" },
  { id: "dobor", name: "Добор", note: "100, 150, 200 мм" },
  { id: "plintus", name: "Плинтус скрытый", note: "Высота 80 мм, в цвет двери" },
  { id: "karniz", name: "Карниз классический", note: "Для коллекций Poesie и Neo Classic" },
];
export const DECOR = [
  { id: "capital", name: "Капитель «Ионика»", note: "Для классических наличников" },
  { id: "column", name: "Колонна-наличник", note: "Каннелюры, в эмали" },
  { id: "rosette", name: "Розетка угловая", note: "Классика и неоклассика" },
  { id: "crown", name: "Корона над проёмом", note: "Высота 120 мм" },
];
