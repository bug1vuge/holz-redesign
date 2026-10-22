import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, useGSAP);
export { gsap, ScrollTrigger, useGSAP };

export const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- плавный скролл ---------- */
interface ScrollApi {
  lenis: Lenis | null;
  to: (target: number | string | HTMLElement, opts?: { immediate?: boolean; offset?: number }) => void;
  lock: (v: boolean) => void;
}
const ScrollCtx = createContext<ScrollApi>({ lenis: null, to: () => {}, lock: () => {} });
export const useScroll = () => useContext(ScrollCtx);

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const locks = useRef(0);
  const lenisRef = useRef<Lenis | null>(null);
  useEffect(() => {
    if (prefersReduced()) return;
    const l = new Lenis({ lerp: 0.12, wheelMultiplier: 1, touchMultiplier: 1.2 });
    l.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenisRef.current = l;
    setLenis(l);
    // если страница выросла после расчёта (шрифты, пины, «показать ещё»), Lenis не пускал колесом до самого низа:
    // у конца страницы сверяем лимит с реальной высотой документа и пересчитываем его
    const realLimit = () => document.documentElement.scrollHeight - window.innerHeight;
    const nearEnd = (e: WheelEvent) => {
      if (e.deltaY <= 0) return;
      if (l.targetScroll >= l.limit - window.innerHeight && Math.abs(realLimit() - l.limit) > 1) l.resize();
    };
    window.addEventListener("wheel", nearEnd, { passive: true, capture: true });
    // высота страницы меняется (смена маршрута, «показать ещё», картинки) — пересчитываем лимиты
    let t = 0;
    const ro = new ResizeObserver(() => { clearTimeout(t); t = window.setTimeout(() => { l.resize(); ScrollTrigger.refresh(); }, 120); });
    ro.observe(document.body);
    return () => { window.removeEventListener("wheel", nearEnd, { capture: true }); ro.disconnect(); gsap.ticker.remove(tick); l.destroy(); lenisRef.current = null; };
  }, []);

  // блокировка скролла без скрытия полосы прокрутки — страница не «прыгает» по ширине
  useEffect(() => {
    // прокрутка разрешена только внутри элемента, который действительно может прокрутиться в эту сторону
    const canScroll = (e: Event) => {
      let el = (e.target as HTMLElement | null)?.closest?.("[data-scroll-allow]") as HTMLElement | null;
      while (el) {
        const dy = e instanceof WheelEvent ? e.deltaY : 0;
        const room = el.scrollHeight - el.clientHeight;
        if (room > 1) {
          if (!(e instanceof WheelEvent)) return true;
          if (dy > 0 && el.scrollTop < room - 1) return true;
          if (dy < 0 && el.scrollTop > 0) return true;
        }
        el = el.parentElement?.closest("[data-scroll-allow]") as HTMLElement | null;
      }
      return false;
    };
    const block = (e: Event) => { if (locks.current > 0 && !canScroll(e)) e.preventDefault(); };
    const keys = (e: KeyboardEvent) => {
      if (locks.current === 0) return;
      const tag = (e.target as HTMLElement).tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      if ([" ", "PageDown", "PageUp", "End", "Home", "ArrowDown", "ArrowUp"].includes(e.key)) e.preventDefault();
    };
    window.addEventListener("wheel", block, { passive: false });
    window.addEventListener("touchmove", block, { passive: false });
    window.addEventListener("keydown", keys);
    return () => { window.removeEventListener("wheel", block); window.removeEventListener("touchmove", block); window.removeEventListener("keydown", keys); };
  }, []);

  const api: ScrollApi = {
    lenis,
    to: (target, opts) => {
      if (lenis) lenis.scrollTo(target as never, { immediate: opts?.immediate, offset: opts?.offset ?? 0, force: true, duration: opts?.immediate ? undefined : 1.2 });
      else if (typeof target === "number") window.scrollTo({ top: target, behavior: opts?.immediate ? "auto" : "smooth" });
      else if (target instanceof HTMLElement) target.scrollIntoView({ behavior: "smooth" });
    },
    lock: v => {
      locks.current = Math.max(0, locks.current + (v ? 1 : -1));
      const l = lenisRef.current;
      if (l) { if (locks.current > 0) l.stop(); else l.start(); }
    },
  };
  return <ScrollCtx.Provider value={api}>{children}</ScrollCtx.Provider>;
}

/* ---------- раскрытие заголовков по словам ---------- */
export function Split({ text, as: Tag = "h2", className, delay = 0, immediate = false }: {
  text: string; as?: keyof JSX.IntrinsicElements; className?: string; delay?: number; immediate?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    if (!ref.current || prefersReduced()) return;
    const words = ref.current.querySelectorAll(".split-line > span");
    gsap.fromTo(words, { yPercent: 115, rotate: 4 }, {
      yPercent: 0, rotate: 0, duration: 0.9, ease: "expo.out", stagger: 0.045, delay,
      scrollTrigger: immediate ? undefined : { trigger: ref.current, start: "top 88%" },
    });
  }, { scope: ref });
  const lines = text.split("\n");
  const El = Tag as "h2";
  return (
    <El ref={ref as never} className={className} aria-label={text.replace(/\n/g, " ")}>
      {lines.map((line, li) => (
        <span key={li} style={{ display: "block" }} aria-hidden>
          {line.split(" ").map((w, i) => (
            <span className="split-line" key={i} style={{ display: "inline-block", marginRight: "0.24em" }}>
              <span>{w}</span>
            </span>
          ))}
        </span>
      ))}
    </El>
  );
}

/** Плавное появление дочерних [data-reveal] при попадании в экран */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useGSAP(() => {
    if (!ref.current) return;
    const items = gsap.utils.toArray<HTMLElement>(ref.current.querySelectorAll("[data-reveal]"));
    if (prefersReduced()) { gsap.set(items, { opacity: 1, y: 0 }); return; }
    items.forEach(el => {
      gsap.fromTo(el, { opacity: 0, y: 46 }, {
        opacity: 1, y: 0, duration: 0.85, ease: "expo.out", delay: Number(el.dataset.delay ?? 0) * 0.8,
        scrollTrigger: { trigger: el, start: "top 92%" },
      });
    });
  }, { scope: ref });
  return ref;
}

/** Магнитный эффект для кнопок */
export function useMagnetic<T extends HTMLElement>(strength = 0.3) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(hover: none)").matches) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, .4)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, .4)" });
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => { xTo(0); yTo(0); };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => { el.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", leave); };
  }, [strength]);
  return ref;
}

/** Счётчик чисел */
export function Counter({ to, suffix = "", duration = 2 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    if (!ref.current) return;
    const o = { v: 0 };
    const el = ref.current;
    const fmt = (n: number) => Math.round(n).toLocaleString("ru-RU") + suffix;
    if (prefersReduced()) { el.textContent = fmt(to); return; }
    gsap.to(o, { v: to, duration, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 92%" }, onUpdate: () => { el.textContent = fmt(o.v); } });
  }, { scope: ref });
  return <span ref={ref}>0{suffix}</span>;
}
