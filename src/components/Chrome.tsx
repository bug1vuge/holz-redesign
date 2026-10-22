import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { gsap, prefersReduced } from "../lib/motion";
import { CATEGORIES, rub, finishById, type Product } from "../data/catalog";
import { COMPANY, NAV } from "../data/content";
import { ProductDoor } from "./Door";
import { Logo } from "./Header";
import { ArrowUR } from "./Icons";
import { useLead } from "./Lead";
import "./chrome.css";

/* ---------- футер ---------- */
export function Footer() {
  const lead = useLead();
  return (
    <footer className="ftr dark">
      <div className="container">
        <div className="ftr__cta">
          <div>
            <span className="eyebrow">Есть проект?</span>
            <h2 className="display ftr__big">Откроем <span className="serif-i">новую</span> дверь</h2>
          </div>
          <button className="btn btn--brass" onClick={() => lead.open()}>Получить расчёт</button>
        </div>
        <div className="ftr__grid">
          <div className="ftr__col">
            <Logo />
            <p className="small ftr__muted">Производитель межкомнатных и входных дверей, перегородок и стеновых панелей. Собственное производство в Чувашской Республике.</p>
          </div>
          <div className="ftr__col">
            <div className="ftr__h">Каталог</div>
            {CATEGORIES.slice(0, 8).map(c => <Link key={c.slug} to={`/katalog/${c.slug}`} className="link-u">{c.name}</Link>)}
          </div>
          <div className="ftr__col">
            <div className="ftr__h">Компания</div>
            {NAV.filter(n => n.label !== "Каталог").flatMap(n => n.children ? n.children : [n]).map(n => <Link key={n.label} to={n.to} className="link-u">{n.label}</Link>)}
          </div>
          <div className="ftr__col">
            <div className="ftr__h">Связаться</div>
            <a href={COMPANY.phoneHref} className="h3">{COMPANY.phone}</a>
            <span className="small ftr__muted">Бесплатно по России</span>
            <a href={`mailto:${COMPANY.email}`} className="link-u">{COMPANY.email}</a>
            <div className="ftr__soc">
              {COMPANY.socials.map(s => <a key={s.name} href={s.href} target="_blank" rel="noreferrer" className="chip">{s.name}<ArrowUR width={14} height={14} /></a>)}
            </div>
          </div>
        </div>
        <div className="ftr__bottom">
          <span>© 2026 HOLZ. Все права принадлежат {COMPANY.owner}</span>
          <Link to="/politika" className="link-u">Политика конфиденциальности</Link>
          <span className="badge badge--demo">Демо-версия редизайна · данные условные</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------- курсор ---------- */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches || prefersReduced()) return;
    document.documentElement.classList.add("has-cursor");
    const dx = gsap.quickTo(dot.current, "x", { duration: 0.12 }), dy = gsap.quickTo(dot.current, "y", { duration: 0.12 });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.5, ease: "power3" }), ry = gsap.quickTo(ring.current, "y", { duration: 0.5, ease: "power3" });
    const move = (e: MouseEvent) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); };
    const over = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest("a, button, [data-cursor], input, select, textarea, label") as HTMLElement | null;
      ring.current?.classList.toggle("is-hover", !!t);
      setLabel(t?.dataset.cursor ?? "");
    };
    const down = () => ring.current?.classList.add("is-down");
    const up = () => ring.current?.classList.remove("is-down");
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseover", over); window.removeEventListener("mousedown", down); window.removeEventListener("mouseup", up); };
  }, []);
  return (
    <>
      <div className="cur-dot" ref={dot} />
      <div className={"cur-ring" + (label ? " has-label" : "")} ref={ring}><span>{label}</span></div>
    </>
  );
}

/* ---------- прелоадер ---------- */
export function Preloader({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    if (prefersReduced()) { el.remove(); onDone(); return; }
    const num = el.querySelector(".pre__num") as HTMLElement;
    const o = { v: 0 };
    const path = el.querySelector(".pre__outline") as SVGRectElement;
    const len = path.getTotalLength?.() ?? 400;
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    const tl = gsap.timeline({ onComplete: () => { el.style.display = "none"; } });
    tl.to(o, { v: 100, duration: 1.6, ease: "power2.inOut", onUpdate: () => { num.textContent = String(Math.round(o.v)).padStart(3, "0"); } })
      .to(path, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" }, 0)
      .fromTo(".pre__word span", { yPercent: 110 }, { yPercent: 0, stagger: 0.06, duration: 0.9, ease: "expo.out" }, 0.2)
      .to(".pre__leaf", { scaleX: 1, duration: 0.5, ease: "power3.inOut" }, 1.4)
      .add(() => onDone(), 1.9)
      .to(".pre__panel--l", { xPercent: -100, duration: 1.1, ease: "expo.inOut" }, 2)
      .to(".pre__panel--r", { xPercent: 100, duration: 1.1, ease: "expo.inOut" }, 2)
      .to(".pre__center", { opacity: 0, scale: 0.9, duration: 0.5 }, 1.95);
    return () => { tl.kill(); };
  }, [onDone]);
  return (
    <div className="pre" ref={ref} aria-hidden>
      <div className="pre__panel pre__panel--l" />
      <div className="pre__panel pre__panel--r" />
      <div className="pre__center">
        <svg viewBox="0 0 60 100" className="pre__door">
          <rect className="pre__outline" x="2" y="2" width="56" height="96" fill="none" stroke="#c9a368" strokeWidth="1.5" />
          <rect className="pre__leaf" x="8" y="8" width="44" height="90" fill="#c9a368" opacity=".9" style={{ transformOrigin: "8px 50px", transform: "scaleX(0)" }} />
        </svg>
        <div className="pre__word">{"HOLZ".split("").map((c, i) => <span key={i}>{c}</span>)}</div>
        <div className="pre__num">000</div>
      </div>
    </div>
  );
}

/* ---------- переход между страницами: «двери» закрываются и открываются ---------- */
export function useRouteCurtain() {
  const loc = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (prefersReduced()) return;
    const tl = gsap.timeline();
    tl.set(".curtain", { display: "block" })
      .fromTo(".curtain__l", { xPercent: -100 }, { xPercent: 0, duration: 0.01 })
      .fromTo(".curtain__r", { xPercent: 100 }, { xPercent: 0, duration: 0.01 }, 0)
      .to(".curtain__l", { xPercent: -100, duration: 1.1, ease: "expo.inOut", delay: 0.05 })
      .to(".curtain__r", { xPercent: 100, duration: 1.1, ease: "expo.inOut" }, "<")
      .fromTo(".curtain__logo", { opacity: 1 }, { opacity: 0, duration: 0.3 }, "<")
      .set(".curtain", { display: "none" });
    return () => { tl.kill(); };
  }, [loc.pathname]);
}

export function Curtain() {
  return (
    <div className="curtain" aria-hidden>
      <div className="curtain__l" /><div className="curtain__r" />
      <div className="curtain__logo">HOLZ</div>
    </div>
  );
}

/* ---------- хлебные крошки и шапка страницы ---------- */
export function Crumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="crumbs" aria-label="Хлебные крошки">
      <Link to="/">Главная</Link>
      {items.map((it, i) => (
        <span key={i}>
          <span className="crumbs__sep">/</span>
          {it.to ? <Link to={it.to}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function PageHead({ crumbs, eyebrow, title, lead, aside, children }: {
  crumbs: { label: string; to?: string }[]; eyebrow?: string; title: string; lead?: string; aside?: ReactNode; children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || prefersReduced()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".ph__word > span", { yPercent: 115 }, { yPercent: 0, duration: 1.2, stagger: 0.05, ease: "expo.out", delay: 0.35 });
      gsap.fromTo(".ph__fade", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: "expo.out", delay: 0.55 });
    }, ref);
    return () => ctx.revert();
  }, [title]);
  return (
    <div className="ph container" ref={ref}>
      <div className="ph__fade"><Crumbs items={crumbs} /></div>
      <div className="ph__row">
        <div>
          {eyebrow && <span className="eyebrow ph__fade">{eyebrow}</span>}
          <h1 className="h1 ph__title" aria-label={title}>
            {title.split(" ").map((w, i) => <span key={i} className="split-line ph__word" aria-hidden><span>{w}&nbsp;</span></span>)}
          </h1>
          {lead && <p className="lead ph__fade">{lead}</p>}
          {children}
        </div>
        {aside && <div className="ph__aside ph__fade">{aside}</div>}
      </div>
    </div>
  );
}

/* ---------- карточка товара ---------- */
export function ProductCard({ p, catSlug }: { p: Product; catSlug?: string }) {
  const [fin, setFin] = useState(p.defaultFinish);
  const lead = useLead();
  const to = `/katalog/${catSlug ?? p.category}/${p.slug}`;
  return (
    <article className="pc">
      <Link to={to} className="pc__media" data-cursor="Смотреть">
        <div className="pc__badges">
          {p.isNew && <span className="badge badge--new">Новинка</span>}
          {p.inStock && <span className="badge badge--stock">В наличии</span>}
        </div>
        <div className="pc__door"><ProductDoor p={p} finish={fin} /></div>
        <div className="pc__floor" />
      </Link>
      <div className="pc__body">
        <div className="pc__top">
          <span className="pc__coll">{p.collection}</span>
          <span className="pc__finish">{finishById(fin).name}</span>
        </div>
        <Link to={to} className="pc__name">{p.name}</Link>
        <div className="pc__sw" role="radiogroup" aria-label="Покрытие">
          {p.finishes.slice(0, 7).map(f => (
            <button key={f} role="radio" aria-checked={f === fin} aria-label={finishById(f).name} title={finishById(f).name}
              className={"sw" + (f === fin ? " is-on" : "")} style={{ background: finishById(f).color }} onClick={() => setFin(f)} />
          ))}
          {p.finishes.length > 7 && <span className="pc__more">+{p.finishes.length - 7}</span>}
        </div>
        <div className="pc__foot">
          <div className="pc__price"><span className="small muted">от</span> {rub(p.price)}</div>
          <button className="pc__ask" onClick={() => lead.open({ title: p.name, details: [`Покрытие: ${finishById(fin).name}`, `Цена от ${rub(p.price)}`] })}>Рассчитать</button>
        </div>
      </div>
    </article>
  );
}

