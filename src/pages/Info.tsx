import { Select } from "../components/Select";
import { useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { gsap, useGSAP, useReveal, Split, Counter, prefersReduced } from "../lib/motion";
import { Door, shade } from "../components/Door";
import { PageHead } from "../components/Chrome";
import { Arrow, ArrowUR, Clock, Download, Phone, Pin, Search, Star } from "../components/Icons";
import { useLead } from "../components/Lead";
import { ARTICLES, CITIES, COMPANY, FACTS, PROMOS, SHOWROOMS, mapY } from "../data/content";
import { finishById } from "../data/catalog";
import NotFound from "./NotFound";
import "./pages.css";

/* =========================== ГДЕ КУПИТЬ =========================== */
export function WhereToBuy() {
  const [city, setCity] = useState(() => { try { return localStorage.getItem("holz-city") || "Москва"; } catch { return "Москва"; } });
  const [q, setQ] = useState("");
  const [hover, setHover] = useState<string | null>(null);
  const lead = useLead();
  const list = useMemo(() => SHOWROOMS.filter(s => (q ? (s.city + s.address + s.name).toLowerCase().includes(q.toLowerCase()) : s.city === city)), [city, q]);
  const ref = useReveal<HTMLDivElement>();
  return (
    <main className="page">
      <PageHead crumbs={[{ label: "Где купить" }]} eyebrow="Салоны HOLZ" title="Где купить двери HOLZ"
        lead="Фирменные салоны и дилеры в 20 городах. Потрогайте образцы покрытий, сравните модели и закажите бесплатный замер." />
      <div className="container wtb" ref={ref}>
        <div className="wtb__side">
          <label className="wtb__search"><Search /><input placeholder="Город, улица или салон" value={q} onChange={e => setQ(e.target.value)} /></label>
          <div className="wtb__cities">
            {CITIES.map(c => <button key={c} className={"chip" + (!q && c === city ? " is-on" : "")} onClick={() => { setQ(""); setCity(c); }}>{c}</button>)}
          </div>
          <div className="wtb__list">
            {list.map(s => (
              <article key={s.city + s.address} className={"shop" + (hover === s.address ? " is-hover" : "")} onMouseEnter={() => setHover(s.address)} onMouseLeave={() => setHover(null)}>
                <div className="shop__top"><span className="eyebrow">{s.city}</span>{s.flagship && <span className="badge badge--new">Фирменный</span>}</div>
                <div className="h3">{s.name}</div>
                <p className="shop__row"><Pin width={16} height={16} />{s.address}</p>
                <p className="shop__row"><Clock width={16} height={16} />{s.hours}</p>
                <p className="shop__row"><Phone width={16} height={16} /><a href={COMPANY.phoneHref}>{s.phone}</a></p>
                <div className="shop__cta">
                  <button className="btn btn--dark btn--sm" onClick={() => lead.open({ title: `Запись в салон: ${s.city}`, details: [s.name, s.address] })}>Записаться на визит</button>
                  <a className="btn btn--ghost btn--sm" href="#" onClick={e => e.preventDefault()}>Маршрут <ArrowUR width={14} height={14} /></a>
                </div>
              </article>
            ))}
            {!list.length && <div className="empty"><div className="h3">Салонов не найдено</div><p className="muted">Оставьте заявку — доставим двери из ближайшего салона.</p><button className="btn btn--dark" onClick={() => lead.open()}>Оставить заявку</button></div>}
          </div>
        </div>
        <div className="wtb__map" data-reveal>
          <div className="wtb__mapin">
            {SHOWROOMS.filter((s, i, a) => a.findIndex(x => x.city === s.city) === i).map(s => (
              <button key={s.city} className={"wtb__pin" + (s.city === city && !q ? " is-on" : "") + (list.some(l => l.city === s.city && l.address === hover) ? " is-hover" : "")} style={{ left: `${s.x}%`, top: `${mapY(s.y)}%` }} onClick={() => { setQ(""); setCity(s.city); }}>
                <i /><span>{s.city}</span>
              </button>
            ))}
          </div>
          <p className="demo-note">Демо: адреса салонов условные. В рабочей версии здесь будет интерактивная карта Яндекса с реальными адресами из вашей базы.</p>
        </div>
      </div>
      <div className="section--tight" />
    </main>
  );
}

/* =========================== АКЦИИ =========================== */
export function Promos() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <main className="page">
      <PageHead crumbs={[{ label: "Акции" }]} eyebrow="Спецпредложения" title="Акции и скидки" lead="Все акции с датой окончания. Скидки суммируются, если не указано иное." />
      <div className="container promo-list" ref={ref}>
        {PROMOS.map((p, i) => (
          <Link to={`/akcii/${p.slug}`} key={p.slug} className="promo-row" data-reveal data-delay={i * 0.05} data-cursor="Подробнее">
            <div className="promo-row__vis" style={{ background: `linear-gradient(160deg, ${shade(finishById(p.finish).color, 0.2)}, ${shade(finishById(p.finish).color, -0.25)})` }}>
              <Door kind={p.kind} finish={p.finish} variant={i} heightMm={2400} />
            </div>
            <div className="promo-row__body">
              <span className="badge badge--new">{p.tag}</span>
              <h2 className="h2">{p.title}</h2>
              <p className="lead">{p.lead}</p>
              <div className="promo-row__foot"><span className="small"><Clock width={14} height={14} /> Действует до {p.until}</span><span className="promo-row__go"><Arrow /></span></div>
            </div>
          </Link>
        ))}
      </div>
      <div className="section--tight" />
    </main>
  );
}

export function PromoPage() {
  const { slug } = useParams();
  const p = PROMOS.find(x => x.slug === slug);
  const lead = useLead();
  if (!p) return <NotFound />;
  return (
    <main className="page">
      <PageHead crumbs={[{ label: "Акции", to: "/akcii" }, { label: p.title }]} eyebrow={p.tag} title={p.title} lead={p.lead}
        aside={<div className="cat-aside"><Door kind={p.kind} finish={p.finish} heightMm={2400} /></div>} />
      <div className="container article">
        <div className="article__meta"><span className="badge badge--new">до {p.until}</span></div>
        <div className="article__body">{p.body.map((t, i) => <p key={i}>{t}</p>)}</div>
        <button className="btn btn--dark" onClick={() => lead.open({ title: `Акция: ${p.title}` })}>Воспользоваться акцией <Arrow /></button>
      </div>
      <div className="section" />
    </main>
  );
}

/* =========================== ПРЕСС-ЦЕНТР =========================== */
export function Press({ type }: { type?: "news" | "blog" }) {
  const list = ARTICLES.filter(a => !type || a.type === type);
  const ref = useReveal<HTMLDivElement>();
  const [first, ...rest] = list;
  const title = type === "news" ? "Новости" : type === "blog" ? "Блог" : "Пресс-центр";
  return (
    <main className="page">
      <PageHead crumbs={[{ label: "Пресс-центр", to: "/press" }, ...(type ? [{ label: title }] : [])]} eyebrow="Журнал HOLZ" title={title}
        lead="Новости компании, новые коллекции и советы по выбору дверей и интерьеру." />
      <div className="container" ref={ref}>
        <div className="press-tabs" data-reveal>
          <Link to="/press" className={"chip" + (!type ? " is-on" : "")}>Все</Link>
          <Link to="/press/novosti" className={"chip" + (type === "news" ? " is-on" : "")}>Новости</Link>
          <Link to="/press/blog" className={"chip" + (type === "blog" ? " is-on" : "")}>Блог</Link>
        </div>
        {first && (
          <Link to={`/press/${first.slug}`} className="press-hero" data-reveal data-cursor="Читать">
            <div className="press-hero__img" style={{ background: `linear-gradient(140deg, ${finishById(first.finish).color}, ${shade(finishById(first.finish).color, -0.45)})` }}>
              <Door kind="panels" finish={first.finish} variant={0} />
            </div>
            <div className="press-hero__body">
              <div className="jmeta"><span>{first.type === "news" ? "Новости" : "Блог"}</span><span>{first.date}</span><span>{first.minutes} мин</span></div>
              <h2 className="h2">{first.title}</h2>
              <p className="lead">{first.lead}</p>
            </div>
          </Link>
        )}
        <div className="press-grid">
          {rest.map((a, i) => (
            <Link key={a.slug} to={`/press/${a.slug}`} className="pcard" data-reveal data-delay={(i % 3) * 0.06}>
              <div className="pcard__img" style={{ background: `linear-gradient(140deg, ${finishById(a.finish).color}, ${shade(finishById(a.finish).color, -0.4)})` }}>
                <Door kind={i % 2 ? "grooves" : "vgrooves"} finish={a.finish} variant={i} />
              </div>
              <div className="jmeta"><span>{a.type === "news" ? "Новости" : "Блог"}</span><span>{a.date}</span></div>
              <div className="h3">{a.title}</div>
              <p className="small muted">{a.lead}</p>
            </Link>
          ))}
        </div>
      </div>
      <div className="section--tight" />
    </main>
  );
}

export function Article() {
  const { slug } = useParams();
  const a = ARTICLES.find(x => x.slug === slug);
  const bar = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (!bar.current) return;
    gsap.fromTo(bar.current, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".article", start: "top top", end: "bottom bottom", scrub: true } });
  }, { dependencies: [slug] });
  if (!a) return <NotFound />;
  const more = ARTICLES.filter(x => x.slug !== a.slug).slice(0, 3);
  return (
    <main className="page">
      <div className="readbar" ref={bar} />
      <PageHead crumbs={[{ label: "Пресс-центр", to: "/press" }, { label: a.type === "news" ? "Новости" : "Блог", to: a.type === "news" ? "/press/novosti" : "/press/blog" }, { label: a.title }]}
        eyebrow={`${a.type === "news" ? "Новости" : "Блог"} · ${a.date} · ${a.minutes} мин`} title={a.title} lead={a.lead} />
      <div className="container">
        <div className="article-cover" style={{ background: `linear-gradient(140deg, ${finishById(a.finish).color}, ${shade(finishById(a.finish).color, -0.5)})` }}>
          <Door kind="panels" finish={a.finish} edge="champagne" heightMm={2300} />
          <Door kind="grooves" finish={a.finish} variant={2} heightMm={2300} />
        </div>
      </div>
      <article className="container article">
        <div className="article__body">
          {a.body.map((t, i) => <p key={i}>{t}</p>)}
          <p className="demo-note">Демо-версия: здесь будет полный текст статьи из CMS с фотографиями интерьеров.</p>
        </div>
      </article>
      <section className="section paper-2">
        <div className="container">
          <h2 className="h2" style={{ marginBottom: 32 }}>Читайте также</h2>
          <div className="press-grid">
            {more.map(m => (
              <Link key={m.slug} to={`/press/${m.slug}`} className="pcard">
                <div className="pcard__img" style={{ background: `linear-gradient(140deg, ${finishById(m.finish).color}, ${shade(finishById(m.finish).color, -0.4)})` }}><Door kind="grooves" finish={m.finish} /></div>
                <div className="jmeta"><span>{m.date}</span></div>
                <div className="h3">{m.title}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================== ДИЗАЙНЕРАМ =========================== */
const TIERS = [
  { name: "Partner", cond: "от 1 проекта", perks: ["Персональный менеджер", "Скидка на образцы", "3D-модели и текстуры"] },
  { name: "Pro", cond: "от 5 проектов в год", perks: ["Всё из Partner", "Агентское вознаграждение", "Приоритетное производство", "Публикация проектов в соцсетях HOLZ"] },
  { name: "Studio", cond: "для бюро и студий", perks: ["Всё из Pro", "Образцы покрытий для шоурума", "Обучение команды", "Совместные проекты и съёмки"] },
];
export function Designers() {
  const lead = useLead();
  const ref = useReveal<HTMLDivElement>();
  return (
    <main className="page">
      <PageHead crumbs={[{ label: "Дизайнерам" }]} eyebrow="Партнёрская программа" title="Дизайнерам и архитекторам"
        lead="Понятные условия, библиотека 3D-моделей и персональный менеджер, который ведёт ваш проект от спецификации до установки."
        aside={<button className="btn btn--dark" onClick={() => lead.open({ title: "Партнёрство для дизайнеров" })}>Стать партнёром <Arrow /></button>} />
      <div ref={ref}>
        <section className="container">
          <div className="tiers">
            {TIERS.map((t, i) => (
              <div key={t.name} className={"tier" + (i === 1 ? " tier--accent" : "")} data-reveal data-delay={i * 0.08}>
                <span className="eyebrow">{t.cond}</span>
                <div className="tier__name">{t.name}</div>
                <ul>{t.perks.map(p => <li key={p}>{p}</li>)}</ul>
                <button className={"btn " + (i === 1 ? "btn--brass" : "btn--ghost")} onClick={() => lead.open({ title: `Уровень ${t.name}` })}>Обсудить условия</button>
              </div>
            ))}
          </div>
          <p className="demo-note" data-reveal>Уровни и условия — пример структуры. Конкретные проценты и требования заполняются по данным HOLZ.</p>
        </section>
        <section className="section">
          <div className="container lib">
            <div data-reveal>
              <span className="eyebrow">Библиотека</span>
              <Split className="h2" text={"Все 3D-модели\nв одном месте"} />
              <p className="lead">Двери, перегородки, панели и погонаж для 3ds Max, SketchUp и Blender. Скачивание прямо с сайта HOLZ — без сторонних сервисов.</p>
            </div>
            <div className="lib__list">
              {["Межкомнатные двери · 220 моделей", "Скрытые двери Illusion", "Перегородки Aura и Limitless", "Стеновые панели Geometria", "Текстуры 40 покрытий"].map((t, i) => (
                <button key={t} className="lib__item" data-reveal data-delay={i * 0.05}><span>{t}</span><span className="small muted">.max · .skp · .blend</span><Download /></button>
              ))}
            </div>
          </div>
        </section>
        <section className="section dark">
          <div className="container steps-row">
            {[["Заявка", "Две строки: имя и телефон. Остальное обсудим с менеджером."], ["Спецификация", "Подготовим спецификацию и расчёт по вашему проекту за 1 день."], ["Образцы", "Привезём образцы покрытий на встречу с заказчиком."], ["Реализация", "Контроль производства, доставки и монтажа."]].map(([t, d], i) => (
              <div key={t} className="step-c" data-reveal data-delay={i * 0.06}><span className="step-c__n">0{i + 1}</span><div className="h3">{t}</div><p className="muted small">{d}</p></div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================== О КОМПАНИИ =========================== */
export function About() {
  const ref = useReveal<HTMLDivElement>();
  const lead = useLead();
  const stripe = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (!stripe.current || prefersReduced()) return;
    gsap.to(stripe.current.querySelector(".doors-strip__in"), { xPercent: -35, ease: "none", scrollTrigger: { trigger: stripe.current, start: "top bottom", end: "bottom top", scrub: 1 } });
  }, { scope: stripe });
  return (
    <main className="page">
      <PageHead crumbs={[{ label: "О компании" }]} eyebrow="HOLZ Interior Doors" title="Красивые двери — в каждый дом"
        lead="Наша миссия — сделать красивые двери доступными для каждого дома, независимо от стиля интерьера и бюджета." />
      <div ref={ref}>
        <section className="container facts">
          {FACTS.map((f, i) => (
            <div key={f.label} className="fact" data-reveal data-delay={i * 0.06}>
              <div className="fact__v"><Counter to={f.value} suffix={f.suffix} /></div>
              <div className="fact__l">{f.label}</div>
            </div>
          ))}
        </section>
        <div className="doors-strip" ref={stripe}>
          <div className="doors-strip__in">
            {["moro", "e-white", "agate", "caravan", "e-sage", "umbra", "graphite", "e-sand", "savanna", "bianco", "st-cappuccino", "oak"].map((f, i) => (
              <Door key={f} kind={(["grooves", "panels", "glass", "inlay", "classic", "vgrooves"] as const)[i % 6]} finish={f} edge={i % 3 === 0 ? "gold" : "none"} variant={i} glass="satin" />
            ))}
          </div>
        </div>
        <section className="section">
          <div className="container about-cols">
            <div data-reveal><span className="eyebrow">Производство</span><Split className="h2" text="Собственная фабрика в Чувашии" /></div>
            <div className="about-txt" data-reveal>
              <p>Мы производим межкомнатные двери в классическом и современном стилях, скрытые двери, раздвижные системы, перегородки, стеновые панели и погонаж в цвет дверей.</p>
              <p>Короткие сроки производства, индивидуальный подход и цена производителя — без посредников между фабрикой и салоном.</p>
              <p className="demo-note">Здесь будет история компании: год основания, этапы развития и фото производства — по материалам HOLZ.</p>
            </div>
          </div>
        </section>
        <section className="section paper-2">
          <div className="container about-links">
            {[["Технологии", "Клеёный брус, МДФ и 40 покрытий", "/o-kompanii/tehnologii"], ["Сертификаты", "Соответствие стандартам качества", "/o-kompanii/sertifikaty"], ["Отзывы", "Что говорят покупатели", "/o-kompanii/otzyvy"], ["Контакты", "Офис, производство и отделы", "/o-kompanii/kontakty"]].map(([t, d, to], i) => (
              <Link key={to} to={to} className="about-link" data-reveal data-delay={i * 0.05}><span className="h3">{t}</span><span className="small muted">{d}</span><Arrow /></Link>
            ))}
          </div>
        </section>
        <section className="section--tight"><div className="container"><button className="btn btn--dark" onClick={() => lead.open()}>Связаться с нами <Arrow /></button></div></section>
      </div>
    </main>
  );
}

export function Technology() {
  const ref = useReveal<HTMLDivElement>();
  const steps = [
    ["Клеёный брус", "Каркас полотна собирается из отдельных ламелей, склеенных со смещением волокон. Это снимает внутренние напряжения в древесине — дверь не ведёт и не коробит.", "oak"],
    ["Бесшовные модели", "Часть моделей изготавливается без стыков на лицевой поверхности: покрытие не расслаивается по кромкам, а полотно выглядит монолитным.", "e-white"],
    ["Фрезеровка по эскизу", "Фрезеруем рисунок по эскизу заказчика: линии, филёнки, геометрия под конкретный интерьер.", "umbra"],
    ["Двухцветная окраска", "Разные цвета с двух сторон полотна — под интерьер каждой комнаты.", "e-sage"],
    ["Опции", "Зеркальные вставки, дверца для питомца, фальшфрамуга, высота до 3000 мм.", "agate"],
  ];
  return (
    <main className="page">
      <PageHead crumbs={[{ label: "О компании", to: "/o-kompanii" }, { label: "Технологии" }]} eyebrow="Как мы производим" title="Технологии изготовления дверей"
        lead="Что внутри двери HOLZ и почему она служит долго." />
      <div className="container tech" ref={ref}>
        {steps.map(([t, d, f], i) => (
          <div key={t} className="tech__row" data-reveal>
            <div className="tech__n">0{i + 1}</div>
            <div><div className="h2">{t}</div><p className="lead">{d}</p></div>
            <div className="tech__vis"><Door kind={(["grooves", "flat", "inlay", "panels", "glass"] as const)[i]} finish={f} variant={i} glass="satin" /></div>
          </div>
        ))}
      </div>
      <div className="section--tight" />
    </main>
  );
}

export function Certificates() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <main className="page">
      <PageHead crumbs={[{ label: "О компании", to: "/o-kompanii" }, { label: "Сертификаты" }]} eyebrow="Качество" title="Сертификаты" lead="Документы о соответствии продукции стандартам качества и безопасности." />
      <div className="container certs" ref={ref}>
        {["Декларация соответствия ЕАЭС", "Сертификат пожарной безопасности", "Экологический сертификат", "Сертификат на покрытия", "Протокол испытаний", "Сертификат ISO 9001"].map((c, i) => (
          <button key={c} className="cert" data-reveal data-delay={(i % 3) * 0.06} data-cursor="Открыть">
            <div className="cert__paper"><span className="cert__seal" /><i /><i /><i /><i /></div>
            <div className="h3">{c}</div>
            <span className="small muted">PDF · демо</span>
          </button>
        ))}
      </div>
      <div className="container"><p className="demo-note">Демо: в рабочей версии здесь будут сканы ваших действующих сертификатов с просмотром и скачиванием.</p></div>
      <div className="section--tight" />
    </main>
  );
}

export function Reviews() {
  const lead = useLead();
  const ref = useReveal<HTMLDivElement>();
  const [rating, setRating] = useState(5);
  return (
    <main className="page">
      <PageHead crumbs={[{ label: "О компании", to: "/o-kompanii" }, { label: "Отзывы" }]} eyebrow="Отзывы" title="Отзывы покупателей"
        lead="Мы показываем отзывы с Яндекс Карт и 2ГИС — без фильтрации." />
      <div className="container" ref={ref}>
        <div className="rev-sum" data-reveal>
          {["Яндекс Карты", "2ГИС", "На сайте"].map(s => (
            <div key={s} className="rev-src"><div className="rev-src__n">—</div><div className="rev-src__stars">{Array.from({ length: 5 }, (_, i) => <Star key={i} width={16} height={16} />)}</div><div className="small muted">{s}</div></div>
          ))}
        </div>
        <p className="demo-note" data-reveal>Демо: рейтинг и отзывы подтянутся автоматически из Яндекс Карт и 2ГИС по каждому салону. Карточки ниже — макет оформления, а не реальные отзывы.</p>
        <div className="rev-grid">
          {[0, 1, 2].map(i => (
            <div key={i} className="rev rev--mock" data-reveal data-delay={i * 0.06}>
              <div className="rev__head"><span className="rev__ava" /><div><div className="rev__line" style={{ width: 120 }} /><div className="rev__line rev__line--s" style={{ width: 80 }} /></div></div>
              <div className="rev-src__stars">{Array.from({ length: 5 }, (_, k) => <Star key={k} width={14} height={14} />)}</div>
              <div className="rev__line" /><div className="rev__line" /><div className="rev__line" style={{ width: "60%" }} />
              <span className="small muted">Макет карточки · источник: Яндекс Карты</span>
            </div>
          ))}
        </div>
        <form className="rev-form" onSubmit={e => { e.preventDefault(); lead.open({ title: "Спасибо за отзыв!", details: ["Демо: отзыв отправлен на модерацию"] }); }} data-reveal>
          <div><span className="eyebrow">Оставить отзыв</span><div className="h2">Расскажите о своих дверях</div></div>
          <div className="rev-form__fields">
            <label className="field"><input required placeholder=" " /><label>Имя</label></label>
            <Select name="city" label="Город" defaultValue="Москва" options={CITIES} />
            <div className="rev-form__stars">{[1, 2, 3, 4, 5].map(n => <button type="button" key={n} onClick={() => setRating(n)} className={n <= rating ? "is-on" : ""} aria-label={`${n} из 5`}><Star width={26} height={26} /></button>)}</div>
            <label className="field"><textarea required placeholder=" " /><label>Ваш отзыв</label></label>
            <button className="btn btn--dark" type="submit">Отправить отзыв</button>
          </div>
        </form>
      </div>
      <div className="section--tight" />
    </main>
  );
}

export function Contacts() {
  const lead = useLead();
  const ref = useReveal<HTMLDivElement>();
  return (
    <main className="page">
      <PageHead crumbs={[{ label: "О компании", to: "/o-kompanii" }, { label: "Контакты" }]} eyebrow="Контакты" title="Свяжитесь с нами" lead="Звонок по России бесплатный. Ответим в мессенджерах в течение 15 минут в рабочее время." />
      <div className="container contacts" ref={ref}>
        <div className="contacts__main" data-reveal>
          <a href={COMPANY.phoneHref} className="contacts__phone">{COMPANY.phone}</a>
          <span className="muted">Бесплатно по России · Пн–Пт 9:00–18:00 (МСК)</span>
          <a href="tel:+74991124563" className="h3">{COMPANY.phoneMsk}</a>
          <div className="contacts__btns">
            <button className="btn btn--dark" onClick={() => lead.open()}>Заказать звонок</button>
            <a className="btn btn--ghost" href="https://t.me/holzinteriordoors" target="_blank" rel="noreferrer">Telegram</a>
          </div>
        </div>
        <div className="contacts__grid">
          {COMPANY.emails.map(e => <div key={e.value} className="contacts__item" data-reveal><span className="small muted">{e.label}</span><a className="link-u" href={`mailto:${e.value}`}>{e.value}</a></div>)}
          <div className="contacts__item" data-reveal><span className="small muted">Центральный офис и производство</span><span>{COMPANY.office}</span></div>
          <div className="contacts__item" data-reveal><span className="small muted">Реквизиты</span><span>{COMPANY.owner}</span><span className="small muted">ИНН / ОГРН — заполняются по данным компании</span></div>
        </div>
      </div>
      <div className="section--tight" />
    </main>
  );
}

export function Policy() {
  return (
    <main className="page">
      <PageHead crumbs={[{ label: "Политика конфиденциальности" }]} title="Политика конфиденциальности" />
      <div className="container article"><div className="article__body">
        <p>Демо-версия. Здесь будет актуальный текст политики обработки персональных данных {COMPANY.owner} и пользовательского соглашения.</p>
        <p>Формы на сайте собирают только данные, необходимые для связи с покупателем: имя, телефон, город и комментарий к заявке.</p>
      </div></div>
      <div className="section" />
    </main>
  );
}
