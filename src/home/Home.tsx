import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { gsap, ScrollTrigger, useGSAP, prefersReduced, Split, useReveal, useMagnetic, Counter, useScroll } from "../lib/motion";
import { Door, shade } from "../components/Door";
import { CATEGORIES, FINISHES, finishById, INTERIOR, rub } from "../data/catalog";
import { ARTICLES, FACTS, PROMOS, SHOWROOMS, mapY } from "../data/content";
import { Arrow, ArrowUR } from "../components/Icons";
import { useLead } from "../components/Lead";
import "./home.css";

const SCENES = [
  { id: "portal", label: "Вход" },
  { id: "anatomy", label: "Анатомия" },
  { id: "finishes", label: "Покрытия" },
  { id: "collections", label: "Коллекции" },
  { id: "illusion", label: "Illusion" },
  { id: "height", label: "Высота" },
  { id: "catalog", label: "Каталог" },
  { id: "network", label: "Салоны" },
  { id: "final", label: "Расчёт" },
];

export default function Home({ ready }: { ready: boolean }) {
  useEffect(() => {
    document.body.classList.add("is-dark");
    return () => document.body.classList.remove("is-dark");
  }, []);
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => clearTimeout(t);
  }, []);
  return (
    <main className="home">
      <Portal ready={ready} />
      <Anatomy />
      <Finishes />
      <Collections />
      <Illusion />
      <Height />
      <CatalogGrid />
      <Network />
      <PromosAndJournal />
      <FinalCta />
      <Rail />
    </main>
  );
}

/* =========================================================
   1. ПОРТАЛ — дверь открывается, камера влетает в проём
   ========================================================= */
function Portal({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);
  // скролл-сцена создаётся один раз, чтобы порядок пинов на странице не нарушался
  useGSAP(() => {
    const q = gsap.utils.selector(root);
    if (prefersReduced()) return;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: root.current, start: "top top", end: "+=260%", scrub: 1, pin: true, anticipatePin: 1 },
    });
    tl.to(q(".portal__leaf"), { rotateY: -112, ease: "power2.inOut", duration: 1 }, 0)
      .to(q(".portal__glow"), { opacity: 1, duration: 0.8 }, 0.05)
      .to(q(".portal__beam"), { opacity: 1, scaleX: 1, duration: 1 }, 0.1)
      .to(q(".portal__dust"), { opacity: 1, duration: 0.6 }, 0.3)
      .to(q(".portal__row--a"), { xPercent: -18, opacity: 0.18, duration: 1 }, 0)
      .to(q(".portal__row--b"), { xPercent: 18, opacity: 0.18, duration: 1 }, 0)
      .to(q(".portal__fade"), { opacity: 0, duration: 0.3 }, 0)
      .to(q(".portal__beyond-txt"), { opacity: 1, duration: 0.3 }, 0.55)
      .to(q(".portal__beyond-txt"), { opacity: 0, duration: 0.15 }, 0.95)
      .to(q(".portal__leaf"), { opacity: 0, duration: 0.25 }, 1.05)
      .to(q(".portal__stage"), { scale: 16, duration: 1.4, ease: "power3.in" }, 1)
      .to(q(".portal__room"), { opacity: 0, duration: 0.5 }, 1.2);
  }, { scope: root });

  // заставка после прелоадера
  useGSAP(() => {
    const q = gsap.utils.selector(root);
    if (!ready || prefersReduced()) return;
    gsap.timeline({ delay: 0.15 })
      .fromTo(q(".portal__frame"), { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.6, ease: "expo.inOut" })
      .fromTo(q(".portal__char"), { yPercent: 110 }, { yPercent: 0, duration: 1.3, stagger: 0.035, ease: "expo.out" }, 0.5)
      .fromTo(q(".portal__intro"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: "expo.out" }, 1.1)
      .fromTo(q(".portal__leaf"), { rotateY: 0 }, { rotateY: -9, duration: 1.2, ease: "power3.inOut", yoyo: true, repeat: 1 }, 1.4);
    ScrollTrigger.refresh();
  }, { scope: root, dependencies: [ready] });

  const word = (w: string) => w.split("").map((c, i) => <span key={i} className="split-line"><span className="portal__char">{c === " " ? " " : c}</span></span>);

  return (
    <section className="portal" id="portal" ref={root}>
      <div className="portal__room">
        <div className="portal__title display" aria-label="Откройте новый интерьер">
          <div className="portal__row portal__row--a" aria-hidden>{word("Откройте")}</div>
          <div className="portal__row portal__row--b" aria-hidden><span className="serif-i">{word("новый")}</span>&nbsp;{word("интерьер")}</div>
        </div>
        <div className="portal__beam" />
        <div className="portal__fade"><div className="portal__stat portal__intro">
          {FACTS.slice(0, 3).map(f => <div key={f.label}><b>{f.value.toLocaleString("ru-RU")}{f.suffix}</b><span>{f.label}</span></div>)}
        </div>
        <p className="portal__meta portal__intro">HOLZ Interior Doors — межкомнатные и входные двери, перегородки и стеновые панели от производителя.</p>
        <div className="portal__hint portal__intro"><span className="portal__mouse"><i /></span>Прокрутите, чтобы открыть</div></div>
      </div>
      <div className="portal__stage">
        <div className="portal__frame">
          <div className="portal__beyond">
            <div className="portal__glow" />
            <div className="portal__dust">{Array.from({ length: 26 }, (_, i) => <i key={i} style={{ "--x": `${(i * 37) % 100}%`, "--d": `${4 + (i % 7)}s`, "--delay": `${-(i % 9)}s` } as CSSProperties} />)}</div>
            <span className="portal__beyond-txt serif-i">добро пожаловать</span>
          </div>
          <div className="portal__leaf">
            <Door kind="grooves" finish="moro" edge="champagne" variant={0} frame={false} heightMm={2400} crop />
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   2. АНАТОМИЯ — дверь раскладывается на слои
   ========================================================= */
const LAYERS = [
  { t: "Каркас из клеёного бруса", d: "Ламели склеены со смещением волокон — полотно не ведёт от перепадов влажности и температуры." },
  { t: "МДФ повышенной плотности", d: "Ровная основа под покрытие и фрезеровку. Шумоизоляция и вес настоящей двери." },
  { t: "Покрытие", d: "40 вариантов: под дерево, под камень, однотонные, эмаль по RAL и NCS, Soft Touch." },
  { t: "Кромка", d: "Алюминиевая кромка: чёрная, шампань или матовое золото. Защищает торцы от сколов." },
];
function Anatomy() {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    const q = gsap.utils.selector(root);
    if (prefersReduced()) { gsap.set(q(".anat__label"), { opacity: 1 }); return; }
    const mm = gsap.matchMedia();
    mm.add({ big: "(min-width: 900px)", small: "(max-width: 899px)" }, ctx => {
      const gap = ctx.conditions?.big ? 90 : 55;
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "+=320%", scrub: 1, pin: true } });
      tl.fromTo(q(".anat__stack"), { rotateX: 0, rotateZ: 0, scale: 0.9 }, { rotateX: 58, rotateZ: -36, scale: 1, duration: 1, ease: "power2.inOut" })
        .to(q(".anat__intro"), { opacity: 0, y: -30, duration: 0.5 }, 0.2);
      q(".anat__layer").forEach((l, i) => tl.to(l, { z: i * gap, duration: 1, ease: "power2.out" }, 0.6));
      q(".anat__label").forEach((l, i) => {
        tl.fromTo(l, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.5 }, 1.2 + i * 0.6);
        tl.to(q(".anat__layer")[i], { filter: "brightness(1.15)", duration: 0.3 }, 1.2 + i * 0.6);
        if (i > 0) tl.to(q(".anat__label")[i - 1], { opacity: 0.35, duration: 0.3 }, 1.2 + i * 0.6);
      });
      tl.to(q(".anat__label"), { opacity: 0, duration: 0.4 }, 4)
        .to(q(".anat__layer"), { z: 0, filter: "brightness(1)", duration: 0.8, ease: "power3.inOut" }, 4)
        .to(q(".anat__stack"), { rotateX: 0, rotateZ: 0, scale: 1.05, duration: 0.8, ease: "power3.inOut" }, 4.2)
        .fromTo(q(".anat__done"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6 }, 4.6);
    });
  }, { scope: root });

  return (
    <section className="anat" id="anatomy" ref={root}>
      <div className="anat__intro container">
        <span className="eyebrow">01 · Технология</span>
        <h2 className="h1">Анатомия <span className="serif-i">двери</span> HOLZ</h2>
        <p className="lead">Прокрутите — и дверь покажет, из чего она сделана.</p>
      </div>
      <div className="anat__scene">
        <div className="anat__stack">
          <div className="anat__layer anat__layer--core"><i /><i /><i /><i /></div>
          <div className="anat__layer anat__layer--mdf" />
          <div className="anat__layer anat__layer--face"><Door kind="grooves" finish="umbra" variant={3} frame={false} handle={false} heightMm={2400} crop /></div>
          <div className="anat__layer anat__layer--edge" />
        </div>
      </div>
      <ol className="anat__labels">
        {LAYERS.map((l, i) => (
          <li key={l.t} className="anat__label">
            <span className="anat__n">0{i + 1}</span>
            <div><div className="h3">{l.t}</div><p>{l.d}</p></div>
          </li>
        ))}
      </ol>
      <div className="anat__done container">
        <h3 className="h2">Собрано в Чувашии. <span className="serif-i">Гарантия 2 года.</span></h3>
        <Link to="/o-kompanii/tehnologii" className="btn btn--dark">Как мы производим <Arrow /></Link>
      </div>
    </section>
  );
}

/* =========================================================
   3. ПОКРЫТИЯ — каждое следующее «заливает» дверь от ручки
   ========================================================= */
const SHOW = ["oak", "umbra", "agate", "e-white", "e-sage", "st-graphite"].map(finishById);
function Finishes() {
  const root = useRef<HTMLElement>(null);
  const [idx, setIdx] = useState(0);
  useGSAP(() => {
    const q = gsap.utils.selector(root);
    if (prefersReduced()) return;
    const doors = q(".fin__door"), names = q(".fin__name"), groups = q(".fin__group");
    gsap.set(doors.slice(1), { clipPath: "circle(0% at 78% 54%)" });
    gsap.set(names.slice(1), { yPercent: 105 });
    gsap.set(groups.slice(1), { opacity: 0, y: 10 });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root.current, start: "top top", end: `+=${SHOW.length * 90}%`, scrub: 1, pin: true,
        onUpdate: s => setIdx(Math.min(SHOW.length - 1, Math.round(s.progress * (SHOW.length - 1)))),
      },
    });
    SHOW.forEach((f, i) => {
      if (i === 0) return;
      const at = i - 1;
      tl.to(doors[i], { clipPath: "circle(150% at 78% 54%)", duration: 1, ease: "power2.inOut" }, at)
        .to(names[i - 1], { yPercent: -105, duration: 0.6, ease: "power3.in" }, at)
        .to(names[i], { yPercent: 0, duration: 0.6, ease: "power3.out" }, at + 0.4)
        .to(groups[i - 1], { opacity: 0, y: -10, duration: 0.3 }, at)
        .to(groups[i], { opacity: 1, y: 0, duration: 0.3 }, at + 0.5)
        .to(root.current, { backgroundColor: shade(f.color, -0.86), duration: 1 }, at)
        .to(q(".fin__ind"), { x: () => (q(".fin__sw")[i] as HTMLElement).offsetLeft, duration: 1, ease: "power2.inOut" }, at);
    });
  }, { scope: root });

  return (
    <section className="fin dark" id="finishes" ref={root} style={{ backgroundColor: shade(SHOW[0].color, -0.86) }}>
      <div className="fin__in container">
        <div className="fin__copy">
          <span className="eyebrow">02 · Покрытия</span>
          <h2 className="h2 fin__h">40 покрытий.<br /><span className="serif-i">Одна дверь.</span></h2>
          <div className="fin__names" aria-live="polite">
            {SHOW.map(f => <div key={f.id} className="fin__name">{f.name}</div>)}
          </div>
          <div className="fin__groups">
            {SHOW.map(f => <div key={f.id} className="fin__group">{f.group}{f.texture === "enamel" ? " · окраска по каталогам RAL и NCS" : f.texture === "soft" ? " · бархатистая матовая поверхность" : f.texture === "stone" ? " · фактура натурального камня" : " · текстура натурального шпона"}</div>)}
          </div>
          <div className="fin__sws">
            <span className="fin__ind" />
            {SHOW.map(f => <span key={f.id} className="fin__sw" style={{ background: f.color }} />)}
          </div>
          <div className="fin__count"><b>{String(idx + 1).padStart(2, "0")}</b> / {String(SHOW.length).padStart(2, "0")}</div>
          <Link to="/katalog/pokrytiya" className="link-u fin__all">Все {FINISHES.length > 30 ? FINISHES.length : 40} покрытий <ArrowUR width={16} height={16} /></Link>
        </div>
        <div className="fin__stage">
          {SHOW.map((f, i) => (
            <div key={f.id} className="fin__door" style={{ zIndex: i }}>
              <Door kind="panels" finish={f} variant={0} edge={i % 2 ? "gold" : "champagne"} heightMm={2300} />
            </div>
          ))}
          <div className="fin__shadow" />
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   4. КОЛЛЕКЦИИ — горизонтальная лента
   ========================================================= */
const COLL_FIN: Record<string, string> = { Edel: "umbra", Poesie: "e-white", Nodo: "st-graphite", Fusion: "savanna", "Neo Classic": "e-sand", Plaza: "oak", Elite: "moro", Fly: "caravan", Filigran: "e-anthracite", Endless: "agate" };
const COLL = Object.keys(COLL_FIN).map(n => INTERIOR.find(c => c.name === n)!);
function Collections() {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    const q = gsap.utils.selector(root);
    if (prefersReduced()) return;
    const track = q(".coll__track")[0] as HTMLElement;
    const dist = () => track.scrollWidth - window.innerWidth;
    const tween = gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: { trigger: root.current, start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1, invalidateOnRefresh: true },
    });
    gsap.to(q(".coll__bg"), { xPercent: -35, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: () => "+=" + dist(), scrub: 1 } });
    q(".coll__door").forEach(d => gsap.fromTo(d, { xPercent: 22, rotateY: 18 }, {
      xPercent: -22, rotateY: -18, ease: "none",
      scrollTrigger: { trigger: d, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
    }));
    q(".coll__card").forEach(c => gsap.fromTo(c, { opacity: 0.35, scale: 0.92 }, {
      opacity: 1, scale: 1, ease: "power1.out",
      scrollTrigger: { trigger: c, containerAnimation: tween, start: "left 95%", end: "left 55%", scrub: true },
    }));
  }, { scope: root });

  return (
    <section className="coll" id="collections" ref={root}>
      <div className="coll__bg" aria-hidden>Коллекции · Collections · Коллекции</div>
      <div className="coll__track">
        <div className="coll__intro">
          <span className="eyebrow">03 · Коллекции</span>
          <h2 className="h1">22 коллекции —<br /><span className="serif-i">от неоклассики до минимализма</span></h2>
          <p className="lead">Каждая коллекция — это система: двери, перегородки, панели и погонаж в одном покрытии.</p>
        </div>
        {COLL.map((c, i) => (
          <Link to={`/katalog/mezhkomnatnye-dveri?c=${encodeURIComponent(c.name)}`} key={c.name} className="coll__card" data-cursor="Открыть">
            <div className="coll__num">{String(i + 1).padStart(2, "0")}</div>
            <div className="coll__door"><Door kind={c.kind} finish={COLL_FIN[c.name]} edge={c.edge ?? "none"} glass={c.glass} variant={i % 3} heightMm={2300} /></div>
            <div className="coll__meta">
              <div className="coll__name">{c.name}</div>
              <div className="coll__info">{c.style === "modern" ? "Современная" : "Классическая"} · {c.models.length} моделей · от {rub(c.price)}</div>
            </div>
          </Link>
        ))}
        <Link to="/katalog/mezhkomnatnye-dveri" className="coll__card coll__card--all" data-cursor="Каталог">
          <span className="h2">Все<br />коллекции</span>
          <span className="coll__circle"><Arrow /></span>
        </Link>
      </div>
    </section>
  );
}

/* =========================================================
   5. ILLUSION — дверь, которой нет
   ========================================================= */
function Illusion() {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    const q = gsap.utils.selector(root);
    if (prefersReduced()) return;
    const seam = q(".ill__seam rect")[0] as unknown as SVGRectElement;
    const len = 2 * (seam.width.baseVal.value + seam.height.baseVal.value);
    gsap.set(seam, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set(q(".ill__line"), { opacity: 0, y: 20 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "+=300%", scrub: 1, pin: true } });
    tl.to(seam, { strokeDashoffset: 0, duration: 1, ease: "none" }, 0)
      .to(q(".ill__line")[0], { opacity: 1, y: 0, duration: 0.3 }, 0.2)
      .to(q(".ill__handle"), { opacity: 1, scale: 1, duration: 0.3 }, 0.9)
      .to(q(".ill__leaf"), { rotateY: -42, duration: 1, ease: "power2.inOut" }, 1.1)
      .to(q(".ill__light"), { opacity: 1, duration: 0.8 }, 1.1)
      .to(q(".ill__line")[0], { opacity: 0.3, duration: 0.3 }, 1.2)
      .to(q(".ill__line")[1], { opacity: 1, y: 0, duration: 0.3 }, 1.3)
      .to(q(".ill__leaf"), { rotateY: 0, duration: 1, ease: "power2.inOut" }, 2.3)
      .to(q(".ill__light"), { opacity: 0, duration: 0.8 }, 2.4)
      .to(q(".ill__line")[1], { opacity: 0.3, duration: 0.3 }, 2.4)
      .to(q(".ill__line")[2], { opacity: 1, y: 0, duration: 0.3 }, 2.5)
      .to(q(".ill__handle"), { opacity: 0, duration: 0.3 }, 3.1)
      .to(seam, { opacity: 0, duration: 0.6 }, 3.2)
      .fromTo(q(".ill__word"), { opacity: 0, letterSpacing: "0.6em" }, { opacity: 1, letterSpacing: "0.12em", duration: 0.8 }, 3.3);
  }, { scope: root });

  return (
    <section className="ill" id="illusion" ref={root}>
      <div className="ill__copy container">
        <span className="eyebrow">04 · Скрытые двери</span>
        <h2 className="h2">Дверь, <span className="serif-i">которой нет</span></h2>
        <ul className="ill__lines">
          <li className="ill__line">Полотно в одной плоскости со стеной</li>
          <li className="ill__line">Без наличников и видимых петель</li>
          <li className="ill__line">Красится вместе со стенами в любой цвет</li>
        </ul>
        <Link to="/katalog/skrytye-dveri" className="btn btn--dark">Двери Illusion <Arrow /></Link>
      </div>
      <div className="ill__wall">
        <div className="ill__opening">
          <div className="ill__light" />
          <div className="ill__leaf"><span className="ill__handle" /></div>
          <svg className="ill__seam" viewBox="0 0 100 220" preserveAspectRatio="none"><rect x="0.5" y="0.5" width="99" height="219" fill="none" stroke="#2a2420" strokeOpacity=".55" strokeWidth=".8" vectorEffect="non-scaling-stroke" /></svg>
        </div>
        <div className="ill__word">ILLUSION</div>
        <div className="ill__plinth" />
      </div>
    </section>
  );
}

/* =========================================================
   6. ВЫСОТА — полотно растёт до 3000 мм
   ========================================================= */
function Height() {
  const root = useRef<HTMLElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const q = gsap.utils.selector(root);
    if (prefersReduced()) { if (num.current) num.current.textContent = "3000"; return; }
    const o = { h: 2000 };
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "+=220%", scrub: 1, pin: true } });
    tl.fromTo(q(".hgt__door"), { height: "66.66%" }, { height: "100%", ease: "power1.inOut", duration: 1 }, 0)
      .to(o, { h: 3000, duration: 1, ease: "power1.inOut", onUpdate: () => { if (num.current) num.current.textContent = String(Math.round(o.h / 10) * 10); } }, 0)
      .fromTo(q(".hgt__tag"), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.15 }, 0.38)
      .fromTo(q(".hgt__ceil"), { opacity: 0.2 }, { opacity: 1, duration: 0.2 }, 0.85)
      .fromTo(q(".hgt__copy p, .hgt__copy .btn"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.3 }, 0.6);
  }, { scope: root });
  const lead = useLead();
  return (
    <section className="hgt dark" id="height" ref={root}>
      <div className="hgt__in container">
        <div className="hgt__copy">
          <span className="eyebrow">05 · Стираем границы</span>
          <h2 className="h1">До <span ref={num}>2000</span><small> мм</small></h2>
          <p className="lead">Высокая дверь визуально поднимает потолок. Мы делаем полотна до 3000 мм — без вертикальных стыков и с той же геометрией.</p>
          <p className="hgt__promo"><b>Акция:</b> полотна до 2400 мм — без наценки, до 30 ноября.</p>
          <button className="btn btn--brass" onClick={() => lead.open({ title: "Высокая дверь", details: ["Высота полотна до 3000 мм", "Акция: до 2400 мм без наценки"] })}>Рассчитать высокую дверь</button>
        </div>
        <div className="hgt__stage">
          <div className="hgt__ruler">{[0, 500, 1000, 1500, 2000, 2500, 3000].map(v => <span key={v} style={{ bottom: `${(v / 3000) * 100}%` }}>{v}</span>)}</div>
          <div className="hgt__ceil">потолок 3000</div>
          <div className="hgt__door"><span className="hgt__handle" /><i /><i /><i /></div>
          <div className="hgt__tag" style={{ bottom: `${(2400 / 3000) * 100}%` }}>2400 — без наценки</div>
          <svg className="hgt__man" viewBox="0 0 40 180" aria-hidden><circle cx="20" cy="12" r="9" /><path d="M10 26h20l4 64h-7l-2 86h-7l-2-60-2 60H7l-2-86H6Z" /></svg>
          <div className="hgt__floor" />
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   7. КАТАЛОГ — плитка разделов
   ========================================================= */
function CatalogGrid() {
  const ref = useReveal<HTMLElement>();
  const main = CATEGORIES.filter(c => c.type === "products").slice(0, 12);
  return (
    <section className="cgrid" id="catalog" ref={ref}>
      <div className="container">
        <div className="cgrid__head">
          <div>
            <span className="eyebrow" data-reveal>06 · Каталог</span>
            <Split className="h1" text={"Всё для интерьера\nв одном покрытии"} />
          </div>
          <Link to="/katalog" className="btn btn--dark" data-reveal>Весь каталог <Arrow /></Link>
        </div>
        <div className="cgrid__list">
          {main.map((c, i) => (
            <Link key={c.slug} to={`/katalog/${c.slug}`} className="cgrid__item" data-reveal data-delay={(i % 4) * 0.06} data-cursor="Смотреть">
              <div className="cgrid__door"><Door kind={c.kind} finish={c.finish} edge={c.kind === "inlay" ? "gold" : "none"} glass={c.kind === "aluframe" || c.kind === "pivot" ? "clear" : undefined} variant={i % 3} /></div>
              <div className="cgrid__meta">
                <span className="cgrid__n">{String(i + 1).padStart(2, "0")}</span>
                <span className="cgrid__name">{c.name}</span>
                {c.brand && <em>{c.brand}</em>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   8. СЕТЬ САЛОНОВ — карта с линиями от производства
   ========================================================= */
function Network() {
  const root = useRef<HTMLElement>(null);
  const cities = SHOWROOMS.filter((s, i, a) => a.findIndex(x => x.city === s.city) === i);
  const factory = cities.find(c => c.city === "Чебоксары")!;
  useGSAP(() => {
    const q = gsap.utils.selector(root);
    if (prefersReduced()) return;
    const paths = q(".net__arc") as unknown as SVGPathElement[];
    paths.forEach(p => { const l = p.getTotalLength(); gsap.set(p, { strokeDasharray: l, strokeDashoffset: l }); });
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "+=160%", scrub: 1, pin: true } });
    tl.fromTo(q(".net__factory"), { scale: 0 }, { scale: 1, duration: 0.3, ease: "back.out(3)" }, 0)
      .to(paths, { strokeDashoffset: 0, duration: 1, stagger: 0.05, ease: "power1.inOut" }, 0.2)
      .fromTo(q(".net__city"), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, stagger: 0.05, ease: "back.out(3)" }, 0.5)
      .fromTo(q(".net__copy > *"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.4 }, 0);
  }, { scope: root });
  return (
    <section className="net dark" id="network" ref={root}>
      <div className="net__in container">
        <div className="net__copy">
          <span className="eyebrow">07 · Где купить</span>
          <h2 className="h1"><Counter to={cities.length} /> городов</h2>
          <p className="lead">Фирменные салоны и дилеры в России, Казахстане и Беларуси. Двери можно потрогать, сравнить покрытия и заказать замер.</p>
          <Link to="/gde-kupit" className="btn btn--brass">Найти салон <Arrow /></Link>
        </div>
        <div className="net__map">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="net__svg">
            {cities.filter(c => c !== factory).map(c => {
              const fy = mapY(factory.y), cy = mapY(c.y), mx = (factory.x + c.x) / 2, my = Math.min(fy, cy) - 10 - Math.abs(c.x - factory.x) * 0.2;
              return <path key={c.city} className="net__arc" d={`M${factory.x} ${fy} Q${mx} ${my} ${c.x} ${cy}`} fill="none" stroke="#c9a368" strokeOpacity=".55" strokeWidth=".25" vectorEffect="non-scaling-stroke" />;
            })}
          </svg>
          {cities.map(c => (
            <div key={c.city} className={"net__city" + (c === factory ? " net__factory" : "")} style={{ left: `${c.x}%`, top: `${mapY(c.y)}%` }}>
              <i /><span>{c === factory ? "Производство" : c.city}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   9. АКЦИИ И ЖУРНАЛ
   ========================================================= */
function PromosAndJournal() {
  const ref = useReveal<HTMLElement>();
  const news = ARTICLES.slice(0, 3);
  return (
    <section className="pj" ref={ref}>
      <div className="container">
        <div className="pj__head">
          <Split className="h2" text="Акции" />
          <Link to="/akcii" className="link-u" data-reveal>Все акции</Link>
        </div>
        <div className="pj__promos">
          {PROMOS.map((p, i) => (
            <Link key={p.slug} to={`/akcii/${p.slug}`} className="promo" data-reveal data-delay={i * 0.06}>
              <div className="promo__door"><Door kind={p.kind} finish={p.finish} variant={i} heightMm={2400} /></div>
              <div className="promo__body">
                <span className="badge badge--new">{p.tag}</span>
                <div className="h3">{p.title}</div>
                <span className="small muted">до {p.until}</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="pj__head pj__head--j">
          <Split className="h2" text="Журнал" />
          <Link to="/press/blog" className="link-u" data-reveal>Все статьи</Link>
        </div>
        <div className="pj__journal">
          {news.map((a, i) => (
            <Link key={a.slug} to={`/press/${a.slug}`} className="jcard" data-reveal data-delay={i * 0.08}>
              <div className="jcard__img" style={{ background: `linear-gradient(140deg, ${finishById(a.finish).color}, ${shade(finishById(a.finish).color, -0.4)})` }}>
                <Door kind="grooves" finish={a.finish} variant={i} className="jcard__door" />
              </div>
              <div className="jcard__meta"><span>{a.type === "news" ? "Новости" : "Блог"}</span><span>{a.date}</span></div>
              <div className="h3 jcard__title">{a.title}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   10. ФИНАЛ — заявка
   ========================================================= */
function FinalCta() {
  const lead = useLead();
  const btn = useMagnetic<HTMLButtonElement>(0.35);
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    const q = gsap.utils.selector(root);
    if (prefersReduced()) return;
    gsap.fromTo(q(".final__door"), { rotateY: 0 }, { rotateY: -70, ease: "none", scrollTrigger: { trigger: root.current, start: "top 80%", end: "center center", scrub: 1 } });
  }, { scope: root });
  return (
    <section className="final dark" id="final" ref={root}>
      <div className="final__in container">
        <div className="final__visual">
          <div className="final__frame">
            <div className="final__beyond" />
            <div className="final__door"><Door kind="grooves" finish="e-sand" variant={1} frame={false} edge="gold" heightMm={2400} crop /></div>
          </div>
        </div>
        <div className="final__copy">
          <span className="eyebrow">08 · Расчёт</span>
          <Split className="display final__h" text={"Подберём двери\nза 15 минут"} />
          <p className="lead">Пришлите план квартиры или количество проёмов — рассчитаем комплект с погонажем, фурнитурой и установкой.</p>
          <div className="final__actions">
            <button ref={btn} className="btn btn--brass final__btn" onClick={() => lead.open()}>Получить расчёт <Arrow /></button>
            <Link to="/gde-kupit" className="btn btn--ghost">Прийти в салон</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- навигация по сценам ---------- */
function Rail() {
  const [active, setActive] = useState(0);
  const { to } = useScroll();
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      const mid = window.innerHeight / 2;
      let cur = 0;
      SCENES.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (!el) return;
        const box = el.parentElement?.classList.contains("pin-spacer") ? el.parentElement : el;
        if (box.getBoundingClientRect().top <= mid) cur = i;
      });
      setActive(cur);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(calc); };
    window.addEventListener("scroll", on, { passive: true });
    calc();
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, []);
  return (
    <nav className="rail" aria-label="Сцены главной страницы">
      {SCENES.map((s, i) => (
        <button key={s.id} className={"rail__item" + (i === active ? " is-on" : "")} onClick={() => { const el = document.getElementById(s.id); if (!el) return; const box = el.parentElement?.classList.contains("pin-spacer") ? el.parentElement : el; to(box.getBoundingClientRect().top + window.scrollY); }}>
          <span className="rail__label">{s.label}</span><span className="rail__dot" />
        </button>
      ))}
    </nav>
  );
}
