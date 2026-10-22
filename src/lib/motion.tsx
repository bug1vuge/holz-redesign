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
  useEffect(() => {
    if (prefersReduced()) return;
    const l = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), wheelMultiplier: 0.9, touchMultiplier: 1.4 });
    l.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(l);
    return () => { gsap.ticker.remove(tick); l.destroy(); };
  }, []);
  const api: ScrollApi = {
    lenis,
    to: (target, opts) => {
      if (lenis) lenis.scrollTo(target as never, { immediate: opts?.immediate, offset: opts?.offset ?? 0, force: true });
      else if (typeof target === "number") window.scrollTo({ top: target, behavior: opts?.immediate ? "auto" : "smooth" });
      else if (target instanceof HTMLElement) target.scrollIntoView({ behavior: "smooth" });
    },
    lock: v => { if (lenis) { v ? lenis.stop() : lenis.start(); } document.documentElement.style.overflow = v ? "hidden" : ""; },
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
      yPercent: 0, rotate: 0, duration: 1.15, ease: "expo.out", stagger: 0.06, delay,
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
        opacity: 1, y: 0, duration: 1.1, ease: "expo.out", delay: Number(el.dataset.delay ?? 0),
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
