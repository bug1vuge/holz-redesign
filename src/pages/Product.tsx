import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { gsap, prefersReduced, useReveal } from "../lib/motion";
import { ALL_PRODUCTS, categoryBySlug, EDGES, findProduct, finishById, FINISH_GROUPS, priceFor, rub, type Edge, type FinishGroup } from "../data/catalog";
import { ProductDoor } from "../components/Door";
import { Crumbs, ProductCard } from "../components/Chrome";
import { Arrow, Check, Pin } from "../components/Icons";
import { useLead } from "../components/Lead";
import NotFound from "./NotFound";
import "./pages.css";

const EXTRAS = [
  { id: "nal", name: "Наличники с двух сторон", price: 4900 },
  { id: "dob", name: "Добор 100 мм", price: 2600 },
  { id: "hw", name: "Ручка Evolve + магнитный замок", price: 6400 },
  { id: "inst", name: "Установка", price: 5500 },
];

export default function ProductPage() {
  const { cat = "", slug = "" } = useParams();
  const p = findProduct(cat, slug);
  if (!p) return <NotFound />;
  return <Configurator key={p.id} cat={cat} />;
}

function Configurator({ cat }: { cat: string }) {
  const { slug = "" } = useParams();
  const p = findProduct(cat, slug)!;
  const category = categoryBySlug(cat)!;
  const lead = useLead();
  const groups = FINISH_GROUPS.filter(g => p.finishes.some(f => finishById(f).group === g));
  const [group, setGroup] = useState<FinishGroup>(finishById(p.defaultFinish).group);
  const [finish, setFinish] = useState(p.defaultFinish);
  const [base0, setBase0] = useState(p.defaultFinish);
  const [edge, setEdge] = useState<Edge>(p.edge);
  const [height, setHeight] = useState(p.heights.includes(2100) ? 2100 : p.heights[0]);
  const [thick, setThick] = useState(p.thickness[0]);
  const [side, setSide] = useState<"right" | "left">("right");
  const [extras, setExtras] = useState<string[]>(["nal", "dob"]);
  const [open, setOpen] = useState(false);
  const [room, setRoom] = useState<"light" | "dark">("light");
  const priceEl = useRef<HTMLSpanElement>(null);
  const priceVal = useRef(0);
  const stage = useRef<HTMLDivElement>(null);
  const ref = useReveal<HTMLDivElement>();

  const isDoor = !["wall", "slats", "cabinet", "mirror"].includes(p.kind);
  const base = priceFor(p, finish, height, thick);
  const total = base + EXTRAS.filter(e => extras.includes(e.id)).reduce((s, e) => s + e.price, 0) * (isDoor ? 1 : 0);

  useEffect(() => {
    const el = priceEl.current;
    if (!el) return;
    const o = { v: priceVal.current || total };
    gsap.to(o, { v: total, duration: 0.8, ease: "expo.out", onUpdate: () => { el.textContent = rub(Math.round(o.v / 10) * 10); } });
    priceVal.current = total;
  }, [total]);

  useEffect(() => {
    if (!stage.current || prefersReduced()) return;
    gsap.fromTo(stage.current.querySelector(".cfg__door"), { opacity: 0, y: 40, rotateY: -12 }, { opacity: 1, y: 0, rotateY: 0, duration: 1.4, ease: "expo.out", delay: 0.4 });
    gsap.fromTo(".cfg__col > *", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, stagger: 0.05, ease: "expo.out", delay: 0.45 });
  }, []);

  const pickFinish = (id: string) => {
    setFinish(id);
    const d = stage.current?.querySelector(".cfg__wipe") as HTMLElement | null;
    if (d && !prefersReduced()) {
      gsap.killTweensOf(d);
      gsap.fromTo(d, { clipPath: "circle(0% at 80% 52%)", opacity: 1 }, { clipPath: "circle(150% at 80% 52%)", duration: 0.9, ease: "power3.inOut", onComplete: () => { setBase0(id); gsap.set(d, { opacity: 0 }); } });
    } else setBase0(id);
  };

  const related = useMemo(() => ALL_PRODUCTS.filter(x => x.collection === p.collection && x.id !== p.id).slice(0, 4), [p]);
  const f = finishById(finish);
  const details = [`Покрытие: ${f.name}`, ...(edge !== "none" ? [`Кромка: ${EDGES.find(e => e.id === edge)?.name}`] : []), `Размер: ${height} мм, толщина ${thick} мм`, ...(isDoor ? [`Открывание: ${side === "right" ? "правое" : "левое"}`] : []), `Ориентировочно: ${rub(total)}`];

  return (
    <main className="page cfg-page">
      <div className="container"><Crumbs items={[{ label: "Каталог", to: "/katalog" }, { label: category.name, to: `/katalog/${cat}` }, { label: p.name }]} /></div>
      <section className="container cfg">
        <div className={"cfg__stage cfg__stage--" + room} ref={stage}>
          <div className="cfg__tools">
            {p.isNew && <span className="badge badge--new">Новинка</span>}
            {p.inStock && <span className="badge badge--stock">В наличии</span>}
            <div className="cfg__room">
              <button className={room === "light" ? "is-on" : ""} onClick={() => setRoom("light")} aria-label="Светлая стена" />
              <button className={room === "dark" ? "is-on" : ""} onClick={() => setRoom("dark")} aria-label="Тёмная стена" />
            </div>
          </div>
          <div className={"cfg__door" + (open ? " is-open" : "")} style={{ transform: side === "left" ? "scaleX(-1)" : undefined }}>
            <div className="cfg__beyond" />
            <div className="cfg__leaf"><ProductDoor p={p} finish={base0} edge={edge} heightMm={height} /></div>
            <div className="cfg__wipe"><ProductDoor p={p} finish={finish} edge={edge} heightMm={height} /></div>
          </div>
          <div className="cfg__floor" />
          <div className="cfg__caption">
            <span>{f.name}{edge !== "none" ? ` · кромка ${EDGES.find(e => e.id === edge)?.name.toLowerCase()}` : ""}</span>
            {isDoor && <button className="chip" onClick={() => setOpen(o => !o)} data-cursor={open ? "Закрыть" : "Открыть"}>{open ? "Закрыть дверь" : "Открыть дверь"}</button>}
          </div>
        </div>

        <div className="cfg__col">
          <span className="eyebrow">{p.collection} · {p.style === "modern" ? "Современная" : "Классическая"}</span>
          <h1 className="h1 cfg__title">{p.name}</h1>
          <div className="cfg__price">
            <span ref={priceEl}>{rub(total)}</span>
            <span className="small muted">{isDoor ? "комплект с выбранными опциями, ориентировочно" : "за единицу, ориентировочно"}</span>
          </div>

          <div className="opt">
            <div className="opt__h">Покрытие <span className="muted">{f.name}</span></div>
            <div className="opt__tabs">
              {groups.map(g => <button key={g} className={"chip" + (g === group ? " is-on" : "")} onClick={() => setGroup(g)}>{g}</button>)}
            </div>
            <div className="opt__sw">
              {p.finishes.filter(id => finishById(id).group === group).map(id => (
                <button key={id} className={"bigsw" + (finish === id ? " is-on" : "")} onClick={() => pickFinish(id)} title={finishById(id).name} aria-label={finishById(id).name}>
                  <span style={{ background: finishById(id).color }} />
                  {finish === id && <Check width={14} height={14} />}
                </button>
              ))}
            </div>
          </div>

          {isDoor && (
            <div className="opt">
              <div className="opt__h">Кромка</div>
              <div className="opt__tabs">
                {EDGES.map(e => (
                  <button key={e.id} className={"chip" + (edge === e.id ? " is-on" : "")} onClick={() => setEdge(e.id)}>
                    {e.id !== "none" && <i className="opt__dot" style={{ background: e.color }} />}{e.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="opt opt--row">
            <div>
              <div className="opt__h">Высота, мм</div>
              <div className="opt__tabs">{p.heights.map(h => <button key={h} className={"chip" + (height === h ? " is-on" : "")} onClick={() => setHeight(h)}>{h}</button>)}</div>
            </div>
            <div>
              <div className="opt__h">Толщина, мм</div>
              <div className="opt__tabs">{p.thickness.map(t => <button key={t} className={"chip" + (thick === t ? " is-on" : "")} onClick={() => setThick(t)}>{t}</button>)}</div>
            </div>
          </div>
          {height <= 2400 && height > 2100 && <p className="cfg__note">Высота до 2400 мм — <b>без наценки</b> по акции «Стираем границы».</p>}

          {isDoor && (
            <>
              <div className="opt">
                <div className="opt__h">Открывание</div>
                <div className="opt__tabs">
                  <button className={"chip" + (side === "right" ? " is-on" : "")} onClick={() => setSide("right")}>Правое</button>
                  <button className={"chip" + (side === "left" ? " is-on" : "")} onClick={() => setSide("left")}>Левое</button>
                </div>
              </div>
              <div className="opt">
                <div className="opt__h">Комплектация</div>
                <div className="opt__extras">
                  {EXTRAS.map(e => (
                    <label key={e.id} className="check">
                      <input type="checkbox" checked={extras.includes(e.id)} onChange={() => setExtras(x => x.includes(e.id) ? x.filter(i => i !== e.id) : [...x, e.id])} />
                      <span className="check__box" />{e.name}<span className="muted small opt__p">+{rub(e.price)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="cfg__cta">
            <button className="btn btn--dark" onClick={() => lead.open({ title: p.name, details })}>Рассчитать комплект <Arrow /></button>
            <Link to="/gde-kupit" className="btn btn--ghost"><Pin width={16} height={16} />Посмотреть в салоне</Link>
          </div>
          <ul className="cfg__perks">
            <li><Check width={16} height={16} />Гарантия 2 года</li>
            <li><Check width={16} height={16} />Собственное производство</li>
            <li><Check width={16} height={16} />Бесплатный замер</li>
          </ul>
        </div>
      </section>

      <section className="section" ref={ref}>
        <div className="container spec">
          <div data-reveal>
            <span className="eyebrow">Характеристики</span>
            <h2 className="h2">{p.name}</h2>
            <p className="muted">Изображение — визуализация выбранной конфигурации. Реальный оттенок покрытия можно оценить на образцах в салоне.</p>
          </div>
          <dl className="spec__table" data-reveal>
            {[
              ["Коллекция", p.collection],
              ["Покрытия", Array.from(new Set(p.finishes.map(x => finishById(x).group))).join(", ")],
              ...(isDoor ? [["Цвет кромки", "Чёрная, шампань, матовое золото, покраска по RAL и NCS"]] : []),
              ["Высота", `${Math.min(...p.heights)}–${Math.max(...p.heights)} мм`],
              ["Ширина", isDoor ? "400–950 мм" : "по проекту"],
              ["Толщина", p.thickness.join(", ") + " мм"],
              ...(isDoor ? [["Раздвижные системы", "Roto, Shift, Book, Compack, Invisible, Loft (для 38 и 42 мм)"], ["Фальшфрамуга", "Возможна"]] : []),
              ["Гарантия", "2 года"],
            ].map(([k, v]) => <div key={k} className="spec__row"><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section paper-2">
          <div className="container">
            <div className="rel__head"><h2 className="h2">Другие модели {p.collection}</h2><Link className="link-u" to={`/katalog/${cat}?c=${encodeURIComponent(p.collection)}`}>Вся коллекция</Link></div>
            <div className="pgrid pgrid--4">{related.map(r => <ProductCard key={r.id} p={r} catSlug={cat} />)}</div>
          </div>
        </section>
      )}
    </main>
  );
}
