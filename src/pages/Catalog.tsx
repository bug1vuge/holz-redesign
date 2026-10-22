import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Flip } from "gsap/Flip";
import { gsap, useReveal, prefersReduced } from "../lib/motion";
import {
  CATEGORIES, categoryBySlug, FINISHES, FINISH_GROUPS, finishById, productsIn, rub,
  GLASS, PATINA, HARDWARE, MOULDINGS, DECOR, type FinishGroup,
} from "../data/catalog";
import { Door } from "../components/Door";
import { PageHead, ProductCard } from "../components/Chrome";
import { Arrow, Close, Filter } from "../components/Icons";
import { useLead } from "../components/Lead";
import NotFound from "./NotFound";
import "./pages.css";

gsap.registerPlugin(Flip);

/* ---------- /katalog ---------- */
export function CatalogIndex() {
  const ref = useReveal<HTMLDivElement>();
  const prod = CATEGORIES.filter(c => c.type === "products");
  const mat = CATEGORIES.filter(c => c.type === "material");
  return (
    <main className="page">
      <PageHead crumbs={[{ label: "Каталог" }]} eyebrow="Каталог HOLZ" title="Двери, перегородки и панели"
        lead="Всё, что нужно для интерьера, в одном покрытии: двери, погонаж, стеновые панели и мебель." />
      <div className="container" ref={ref}>
        <div className="cat-grid">
          {prod.map((c, i) => {
            const n = productsIn(c.slug).length;
            const min = Math.min(...productsIn(c.slug).map(p => p.price));
            return (
              <Link to={`/katalog/${c.slug}`} key={c.slug} className={"cat-tile" + (i < 2 ? " cat-tile--big" : "")} data-reveal data-delay={(i % 3) * 0.05} data-cursor="Открыть">
                <div className="cat-tile__door"><Door kind={c.kind} finish={c.finish} edge={c.kind === "inlay" ? "gold" : "none"} glass={c.kind === "aluframe" || c.kind === "pivot" ? "clear" : undefined} variant={i % 3} /></div>
                <div className="cat-tile__body">
                  {c.brand && <span className="eyebrow">{c.brand}</span>}
                  <div className="h3">{c.name}</div>
                  <p className="small muted">{c.description}</p>
                  <div className="cat-tile__foot"><span>{n} {plural(n, "модель", "модели", "моделей")}</span><span>от {rub(min)}</span></div>
                </div>
              </Link>
            );
          })}
        </div>
        <h2 className="h2 cat-sub" data-reveal>Материалы и комплектующие</h2>
        <div className="mat-row">
          {mat.map((c, i) => (
            <Link key={c.slug} to={`/katalog/${c.slug}`} className="mat-tile" data-reveal data-delay={i * 0.04}>
              <span className="mat-tile__sw" style={{ background: finishById(c.finish).color }} />
              <span className="h3">{c.name}</span>
              <span className="small muted">{c.description}</span>
              <Arrow />
            </Link>
          ))}
        </div>
      </div>
      <div className="section--tight" />
    </main>
  );
}

export const plural = (n: number, a: string, b: string, c: string) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return a;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return b;
  return c;
};

/* ---------- /katalog/:cat ---------- */
type Sort = "pop" | "asc" | "desc" | "new";
const PER = 12;

export function CategoryPage() {
  const { cat = "" } = useParams();
  const category = categoryBySlug(cat);
  if (!category) return <NotFound />;
  if (category.type === "material") return <MaterialPage slug={cat} />;
  return <ProductList key={cat} slug={cat} />;
}

function ProductList({ slug }: { slug: string }) {
  const category = categoryBySlug(slug)!;
  const all = useMemo(() => productsIn(slug), [slug]);
  const [params, setParams] = useSearchParams();
  const coll = params.get("c") ?? "";
  const [style, setStyle] = useState<"" | "modern" | "classic">("");
  const [groups, setGroups] = useState<FinishGroup[]>([]);
  const [stock, setStock] = useState(false);
  const [maxPrice, setMaxPrice] = useState(0);
  const [sort, setSort] = useState<Sort>("pop");
  const [shown, setShown] = useState(PER);
  const [drawer, setDrawer] = useState(false);
  const grid = useRef<HTMLDivElement>(null);
  const flip = useRef<Flip.FlipState | null>(null);

  const collections = useMemo(() => Array.from(new Set(all.map(p => p.collection))), [all]);
  const priceCap = useMemo(() => Math.ceil(Math.max(...all.map(p => p.price)) / 5000) * 5000, [all]);
  const hasStyles = new Set(all.map(p => p.style)).size > 1;

  const list = useMemo(() => {
    let l = all.filter(p =>
      (!coll || p.collection === coll) &&
      (!style || p.style === style) &&
      (!stock || p.inStock) &&
      (!maxPrice || p.price <= maxPrice) &&
      (!groups.length || p.finishes.some(f => groups.includes(finishById(f).group))));
    if (sort === "asc") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "desc") l = [...l].sort((a, b) => b.price - a.price);
    if (sort === "new") l = [...l].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    return l;
  }, [all, coll, style, stock, maxPrice, groups, sort]);

  const change = (fn: () => void) => {
    if (grid.current && !prefersReduced()) flip.current = Flip.getState(grid.current.querySelectorAll(".pc-wrap"));
    fn();
    setShown(PER);
  };
  useLayoutEffect(() => {
    if (!flip.current || !grid.current) return;
    Flip.from(flip.current, {
      targets: grid.current.querySelectorAll(".pc-wrap"), duration: 0.7, ease: "expo.out", absolute: true,
      onEnter: els => gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" }),
    });
    flip.current = null;
  }, [list]);

  const setColl = (c: string) => change(() => { const p = new URLSearchParams(params); if (c) p.set("c", c); else p.delete("c"); setParams(p, { replace: true }); });
  const toggleGroup = (g: FinishGroup) => change(() => setGroups(gs => gs.includes(g) ? gs.filter(x => x !== g) : [...gs, g]));
  const reset = () => change(() => { setStyle(""); setGroups([]); setStock(false); setMaxPrice(0); setParams({}, { replace: true }); });
  const active = Number(!!coll) + Number(!!style) + groups.length + Number(stock) + Number(!!maxPrice);

  const filters = (
    <div className="flt">
      {hasStyles && (
        <div className="flt__grp">
          <div className="flt__h">Стиль</div>
          <div className="flt__chips">
            {([["", "Все"], ["modern", "Современные"], ["classic", "Классические"]] as const).map(([v, l]) => (
              <button key={v} className={"chip" + (style === v ? " is-on" : "")} onClick={() => change(() => setStyle(v))}>{l}</button>
            ))}
          </div>
        </div>
      )}
      {collections.length > 1 && (
        <div className="flt__grp">
          <div className="flt__h">Коллекция</div>
          <div className="flt__chips">
            <button className={"chip" + (!coll ? " is-on" : "")} onClick={() => setColl("")}>Все</button>
            {collections.map(c => <button key={c} className={"chip" + (coll === c ? " is-on" : "")} onClick={() => setColl(c)}>{c}</button>)}
          </div>
        </div>
      )}
      <div className="flt__grp">
        <div className="flt__h">Покрытие</div>
        <div className="flt__checks">
          {FINISH_GROUPS.map(g => (
            <label key={g} className="check">
              <input type="checkbox" checked={groups.includes(g)} onChange={() => toggleGroup(g)} />
              <span className="check__box" />
              <span className="check__sw">{FINISHES.filter(f => f.group === g).slice(0, 4).map(f => <i key={f.id} style={{ background: f.color }} />)}</span>
              {g}
            </label>
          ))}
        </div>
      </div>
      <div className="flt__grp">
        <div className="flt__h">Цена до <b>{maxPrice ? rub(maxPrice) : "любая"}</b></div>
        <input className="range" type="range" min={0} max={priceCap} step={1000} value={maxPrice || priceCap}
          onChange={e => { const v = Number(e.target.value); change(() => setMaxPrice(v >= priceCap ? 0 : v)); }} />
      </div>
      <label className="toggle">
        <input type="checkbox" checked={stock} onChange={() => change(() => setStock(s => !s))} />
        <span className="toggle__track"><i /></span>Только в наличии
      </label>
      {active > 0 && <button className="link-u flt__reset" onClick={reset}>Сбросить фильтры ({active})</button>}
    </div>
  );

  return (
    <main className="page">
      <PageHead crumbs={[{ label: "Каталог", to: "/katalog" }, { label: category.name }]} eyebrow={category.brand ? `Коллекция ${category.brand}` : "Каталог"}
        title={category.name} lead={category.description}
        aside={<div className="cat-aside"><Door kind={category.kind} finish={category.finish} edge={category.kind === "inlay" ? "gold" : "none"} glass={category.kind === "aluframe" || category.kind === "pivot" ? "clear" : undefined} /></div>} />
      <div className="container cat-layout">
        <aside className={"cat-side" + (drawer ? " is-open" : "")}>
          <div className="cat-side__head"><span className="h3">Фильтры</span><button onClick={() => setDrawer(false)} aria-label="Закрыть"><Close /></button></div>
          {filters}
          <button className="btn btn--dark cat-side__apply" onClick={() => setDrawer(false)}>Показать {list.length}</button>
        </aside>
        <div>
          <div className="cat-bar">
            <button className="chip cat-bar__flt" onClick={() => setDrawer(true)}><Filter width={16} height={16} />Фильтры{active ? ` · ${active}` : ""}</button>
            <span className="cat-bar__count"><b>{list.length}</b> {plural(list.length, "товар", "товара", "товаров")}</span>
            <label className="cat-bar__sort">
              <span className="small muted">Сортировка:</span>
              <select value={sort} onChange={e => change(() => setSort(e.target.value as Sort))}>
                <option value="pop">по популярности</option>
                <option value="asc">сначала дешевле</option>
                <option value="desc">сначала дороже</option>
                <option value="new">сначала новинки</option>
              </select>
            </label>
          </div>
          {list.length ? (
            <div className="pgrid" ref={grid}>
              {list.slice(0, shown).map(p => <div key={p.id} className="pc-wrap" data-flip-id={p.id}><ProductCard p={p} catSlug={slug} /></div>)}
            </div>
          ) : (
            <div className="empty">
              <div className="h3">По этим фильтрам ничего не нашлось</div>
              <p className="muted">Попробуйте убрать часть фильтров — или оставьте заявку, сделаем дверь под ваш запрос.</p>
              <button className="btn btn--dark" onClick={reset}>Сбросить фильтры</button>
            </div>
          )}
          {shown < list.length && (
            <div className="more"><button className="btn btn--ghost" onClick={() => setShown(s => s + PER)}>Показать ещё {Math.min(PER, list.length - shown)}</button><span className="small muted">Показано {Math.min(shown, list.length)} из {list.length}</span></div>
          )}
        </div>
      </div>
      <SeoBlock name={category.name} />
    </main>
  );
}

function SeoBlock({ name }: { name: string }) {
  const lead = useLead();
  return (
    <section className="section">
      <div className="container seo">
        <div>
          <span className="eyebrow">Как купить</span>
          <h2 className="h2">{name} от производителя — без посредников</h2>
        </div>
        <ol className="steps">
          {[["Выберите модель", "Сравните покрытия и размеры прямо на сайте — цена пересчитывается сразу."], ["Замер", "Мастер приедет на замер в удобное время и уточнит комплектацию."], ["Производство", "Изготовим двери на собственной фабрике в Чувашии."], ["Доставка и установка", "Привезём и установим. Гарантия на двери — 2 года."]].map(([t, d], i) => (
            <li key={t}><span>0{i + 1}</span><div><b>{t}</b><p className="muted small">{d}</p></div></li>
          ))}
        </ol>
        <button className="btn btn--dark" onClick={() => lead.open({ title: name })}>Заказать замер <Arrow /></button>
      </div>
    </section>
  );
}

/* ---------- материалы: покрытия, стекло, фурнитура... ---------- */
function MaterialPage({ slug }: { slug: string }) {
  const category = categoryBySlug(slug)!;
  const ref = useReveal<HTMLDivElement>();
  const [preview, setPreview] = useState(FINISHES[0].id);
  const lead = useLead();
  let body: JSX.Element;
  if (slug === "pokrytiya") {
    body = (
      <div className="fin-page">
        <div className="fin-page__stage"><Door kind="panels" finish={preview} edge="champagne" heightMm={2300} /><div className="fin-page__name"><span className="eyebrow">{finishById(preview).group}</span><div className="h3">{finishById(preview).name}</div></div></div>
        <div>
          {FINISH_GROUPS.map(g => (
            <div key={g} className="fin-page__grp" data-reveal>
              <div className="flt__h">{g}</div>
              <div className="fin-page__list">
                {FINISHES.filter(f => f.group === g).map(f => (
                  <button key={f.id} className={"swatch" + (preview === f.id ? " is-on" : "")} onMouseEnter={() => setPreview(f.id)} onClick={() => setPreview(f.id)}>
                    <span className="swatch__c" style={{ background: f.color }} />
                    <span>{f.name}</span>
                    {f.surcharge > 0 && <span className="small muted">+{f.surcharge}%</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <p className="demo-note">Показаны 18 из 40 покрытий. Эмаль доступна в любом цвете по каталогам RAL и NCS — сейчас со скидкой 30% на нестандартные цвета.</p>
        </div>
      </div>
    );
  } else {
    const items = slug === "steklo" ? GLASS.map(g => ({ id: g.id, name: g.name, note: g.note, color: g.color }))
      : slug === "patina" ? PATINA.map(p => ({ id: p.id, name: p.name, note: "Ручное нанесение по фрезеровке", color: p.color }))
      : slug === "furnitura" ? HARDWARE
      : slug === "pogonazh" ? MOULDINGS.map(m => ({ ...m, color: finishById("oak").color }))
      : DECOR.map(m => ({ ...m, color: finishById("e-sand").color }));
    body = (
      <div className="mat-grid">
        {items.map((it, i) => (
          <div key={it.id} className="mat-card" data-reveal data-delay={(i % 3) * 0.05}>
            <div className="mat-card__vis" style={{ background: slug === "steklo" ? `linear-gradient(135deg, ${it.color}, ${it.color}cc)` : "var(--paper-2)" }}>
              {slug === "steklo" && <span className="mat-card__sheen" />}
              {slug === "furnitura" && <svg viewBox="0 0 120 60" className="mat-card__h"><circle cx="30" cy="30" r="12" fill={it.color} /><rect x="30" y="26" width="70" height="8" rx="4" fill={it.color} /></svg>}
              {(slug === "patina" || slug === "oformlenie" || slug === "pogonazh") && <Door kind={slug === "pogonazh" ? "flat" : "classic"} finish={slug === "patina" ? "e-white" : slug === "pogonazh" ? "oak" : "e-sand"} edge={slug === "patina" ? "gold" : "none"} variant={i} className="mat-card__door" />}
              {slug === "patina" && <span className="mat-card__dot" style={{ background: it.color }} />}
            </div>
            <div className="h3">{it.name}</div>
            <p className="small muted">{it.note}</p>
          </div>
        ))}
      </div>
    );
  }
  return (
    <main className="page">
      <PageHead crumbs={[{ label: "Каталог", to: "/katalog" }, { label: category.name }]} eyebrow="Материалы" title={category.name} lead={category.description} />
      <div className="container" ref={ref}>{body}</div>
      <section className="section--tight"><div className="container"><button className="btn btn--dark" onClick={() => lead.open({ title: category.name })}>Подобрать с менеджером <Arrow /></button></div></section>
    </main>
  );
}
