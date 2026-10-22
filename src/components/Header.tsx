import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { gsap, useScroll } from "../lib/motion";
import { CATEGORIES } from "../data/catalog";
import { CITIES, COMPANY, NAV } from "../data/content";
import { Door } from "./Door";
import { Arrow, Close, Pin, Search } from "./Icons";
import { useLead } from "./Lead";
import "./header.css";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={"logo " + className} aria-label="HOLZ — на главную" data-cursor="Главная">
      <svg viewBox="0 0 22 32" className="logo__mark" aria-hidden>
        <rect x="1" y="1" width="20" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <rect className="logo__leaf" x="4" y="4" width="14" height="27" fill="currentColor" />
        <circle cx="15" cy="17.5" r="1.1" fill="var(--brass)" />
      </svg>
      <span className="logo__word">HOLZ</span>
      <span className="logo__sub">interior<br />doors</span>
    </Link>
  );
}

export function Header() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mega, setMega] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [city, setCity] = useState(() => { try { return localStorage.getItem("holz-city") || "Москва"; } catch { return "Москва"; } });
  const [hover, setHover] = useState(1);
  const lead = useLead();
  const { lock } = useScroll();
  const megaRef = useRef<HTMLDivElement>(null);
  const mobRef = useRef<HTMLDivElement>(null);
  const closeT = useRef<number>();

  useEffect(() => { setMega(false); setMobile(false); setCityOpen(false); }, [pathname]);

  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 300 && y > last + 2 && !mega);
      if (y < last - 2) setHidden(false);
      last = y;
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [mega]);

  useEffect(() => {
    const el = megaRef.current;
    if (!el) return;
    if (mega) {
      gsap.set(el, { display: "block" });
      gsap.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.8, ease: "expo.out" });
      gsap.fromTo(el.querySelectorAll(".mega__item"), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.02, ease: "expo.out", delay: 0.1 });
    } else {
      gsap.to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.5, ease: "expo.in", onComplete: () => { gsap.set(el, { display: "none" }); } });
    }
  }, [mega]);

  useEffect(() => {
    const el = mobRef.current;
    if (!el) return;
    lock(mobile);
    if (mobile) {
      gsap.set(el, { display: "flex" });
      gsap.fromTo(el, { clipPath: "circle(0% at 100% 0%)" }, { clipPath: "circle(150% at 100% 0%)", duration: 1, ease: "expo.inOut" });
      gsap.fromTo(el.querySelectorAll(".mob__link"), { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.05, ease: "expo.out", delay: 0.35 });
    } else {
      gsap.to(el, { clipPath: "circle(0% at 100% 0%)", duration: 0.7, ease: "expo.inOut", onComplete: () => { gsap.set(el, { display: "none" }); } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobile]);

  const pick = (c: string) => { setCity(c); try { localStorage.setItem("holz-city", c); } catch { /* приватный режим */ } setCityOpen(false); };
  const dark = isHome && !mega;
  const cat = CATEGORIES[hover];

  return (
    <>
      <header className={["hdr", dark ? "hdr--dark" : "", scrolled ? "is-scrolled" : "", hidden ? "is-hidden" : "", mega ? "is-mega" : ""].join(" ")}>
        <div className="hdr__in container">
          <Logo />
          <nav className="hdr__nav" aria-label="Основное меню">
            {NAV.map(item => item.label === "Каталог" ? (
              <div key={item.to} className="hdr__item" onMouseEnter={() => { clearTimeout(closeT.current); setMega(true); }} onMouseLeave={() => { closeT.current = window.setTimeout(() => setMega(false), 180); }}>
                <NavLink to={item.to} className="hdr__link" onClick={() => setMega(false)}>{item.label}<span className="hdr__caret" /></NavLink>
              </div>
            ) : (
              <div key={item.to} className="hdr__item hdr__item--drop">
                <NavLink to={item.to} className="hdr__link" end={item.to === "/o-kompanii"}>{item.label}{item.children && <span className="hdr__caret" />}</NavLink>
                {item.children && (
                  <div className="hdr__drop">
                    {item.children.map(c => <NavLink key={c.label} to={c.to} end className="hdr__drop-link">{c.label}</NavLink>)}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="hdr__right">
            <button className="hdr__city" onClick={() => setCityOpen(true)} data-cursor="Город"><Pin width={16} height={16} />{city}</button>
            <a className="hdr__phone" href={COMPANY.phoneHref}>{COMPANY.phone}</a>
            <button className="btn btn--brass btn--sm hdr__cta" onClick={() => lead.open()}>Рассчитать</button>
            <button className={"burger" + (mobile ? " is-on" : "")} onClick={() => setMobile(m => !m)} aria-label="Меню"><span /><span /></button>
          </div>
        </div>

        <div className="mega" ref={megaRef} onMouseEnter={() => { clearTimeout(closeT.current); }} onMouseLeave={() => { closeT.current = window.setTimeout(() => setMega(false), 180); }}>
          <div className="container mega__in">
            <div className="mega__preview">
              <div className="mega__door" key={cat.slug}>
                <Door kind={cat.kind} finish={cat.finish} edge={cat.kind === "inlay" ? "gold" : "none"} glass={cat.kind === "aluframe" ? "clear" : undefined} />
              </div>
              <div className="mega__caption">
                <span className="eyebrow">{cat.brand ?? "HOLZ"}</span>
                <div className="h3">{cat.name}</div>
                <p className="small muted">{cat.description}</p>
              </div>
            </div>
            <div className="mega__grid">
              {CATEGORIES.map((c, i) => (
                <Link key={c.slug} to={`/katalog/${c.slug}`} className={"mega__item" + (c.type === "material" ? " is-mat" : "")} onMouseEnter={() => setHover(i)}>
                  <span className="mega__num">{String(i + 1).padStart(2, "0")}</span>
                  <span>{c.name}</span>
                  {c.brand && <em>{c.brand}</em>}
                </Link>
              ))}
              <Link to="/katalog" className="mega__all mega__item">Весь каталог <Arrow /></Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mob dark" ref={mobRef} style={{ display: "none" }} data-scroll-allow data-lenis-prevent>
        <nav className="mob__nav">
          {[{ label: "Каталог", to: "/katalog" }, ...NAV.slice(1)].map(n => (
            <span key={n.to} className="split-line"><Link className="mob__link" to={n.to}>{n.label}</Link></span>
          ))}
        </nav>
        <div className="mob__foot">
          <button className="hdr__city" onClick={() => setCityOpen(true)}><Pin width={16} height={16} />{city}</button>
          <a href={COMPANY.phoneHref} className="h3">{COMPANY.phone}</a>
          <button className="btn btn--brass" onClick={() => { setMobile(false); lead.open(); }}>Рассчитать стоимость</button>
        </div>
      </div>

      {cityOpen && <CityModal current={city} onPick={pick} onClose={() => setCityOpen(false)} />}
    </>
  );
}

function CityModal({ current, onPick, onClose }: { current: string; onPick: (c: string) => void; onClose: () => void }) {
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const { lock } = useScroll();
  useEffect(() => { lock(true); return () => lock(false); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (ref.current) gsap.fromTo(ref.current.querySelector(".city__box"), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "expo.out" });
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  const list = CITIES.filter(c => c.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="city" ref={ref} role="dialog" aria-modal="true" aria-label="Выбор города">
      <div className="city__veil" onClick={onClose} />
      <div className="city__box">
        <button className="lm__close city__close" onClick={onClose} aria-label="Закрыть"><Close /></button>
        <div className="h3">Ваш город</div>
        <p className="small muted">Покажем ближайшие салоны и наличие.</p>
        <label className="city__search"><Search /><input autoFocus placeholder="Начните вводить город" value={q} onChange={e => setQ(e.target.value)} /></label>
        <div className="city__list" data-scroll-allow data-lenis-prevent>
          {list.map(c => <button key={c} className={"city__opt" + (c === current ? " is-on" : "")} onClick={() => onPick(c)}>{c}</button>)}
          {!list.length && <p className="muted small">Салона в этом городе пока нет — оставьте заявку, доставим двери из ближайшего салона.</p>}
        </div>
      </div>
    </div>
  );
}
