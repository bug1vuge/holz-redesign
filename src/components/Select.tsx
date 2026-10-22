import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent as RKE } from "react";
import { createPortal } from "react-dom";
import "./select.css";

type Opt = string | { value: string; label: string };
const norm = (o: Opt) => (typeof o === "string" ? { value: o, label: o } : o);

interface Props {
  options: Opt[];
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  name?: string;
  /** подпись поля — плавающая, как у остальных полей формы */
  label?: string;
  /** "field" — как поле формы, "inline" — компактный текстовый (сортировка) */
  variant?: "field" | "inline";
  className?: string;
}

/** Выпадающий список в стиле сайта: открывается под полем (или над ним, если снизу мало места),
 *  не перекрывает форму целиком, листается внутри себя, управляется с клавиатуры. */
export function Select({ options, value, defaultValue, onChange, name, label, variant = "field", className }: Props) {
  const opts = options.map(norm);
  const [inner, setInner] = useState(defaultValue ?? opts[0]?.value ?? "");
  const cur = value ?? inner;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<{ left: number; top?: number; bottom?: number; width: number; maxH: number; dark: boolean; up: boolean } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ s: "", t: 0 });
  const id = useId();

  const pick = (v: string) => {
    if (value === undefined) setInner(v);
    onChange?.(v);
    setOpen(false);
    btn.current?.focus();
  };

  const place = () => {
    const el = btn.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight, vw = window.innerWidth;
    const below = vh - r.bottom - 12, above = r.top - 12;
    const want = Math.min(opts.length * 44 + 12, 300);
    const up = below < Math.min(want, 200) && above > below;
    const width = Math.max(r.width, variant === "inline" ? 220 : 0);
    const left = Math.min(Math.max(8, variant === "inline" ? r.right - width : r.left), vw - width - 8);
    setPos({
      left, width, up,
      top: up ? undefined : r.bottom + 6,
      bottom: up ? vh - r.top + 6 : undefined,
      maxH: Math.max(140, Math.min(want, up ? above : below)),
      dark: !!el.closest(".dark, .is-dark"),
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    place();
    const i = Math.max(0, opts.findIndex(o => o.value === cur));
    setActive(i);
    requestAnimationFrame(() => {
      const li = list.current?.children[i] as HTMLElement | undefined;
      if (li && list.current) list.current.scrollTop = li.offsetTop - list.current.clientHeight / 2 + li.offsetHeight / 2;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!list.current?.contains(t) && !btn.current?.contains(t)) setOpen(false);
    };
    const scroll = (e: Event) => { if (!list.current?.contains(e.target as Node)) setOpen(false); };
    const resize = () => setOpen(false);
    document.addEventListener("pointerdown", outside, true);
    window.addEventListener("scroll", scroll, true);
    window.addEventListener("resize", resize);
    return () => {
      document.removeEventListener("pointerdown", outside, true);
      window.removeEventListener("scroll", scroll, true);
      window.removeEventListener("resize", resize);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const li = list.current?.children[active] as HTMLElement | undefined;
    li?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const onKey = (e: RKE) => {
    const n = opts.length;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); setOpen(true); }
      return;
    }
    if (e.key === "Escape" || e.key === "Tab") { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); } setOpen(false); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(n - 1, a + 1)); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(0, a - 1)); return; }
    if (e.key === "Home") { e.preventDefault(); setActive(0); return; }
    if (e.key === "End") { e.preventDefault(); setActive(n - 1); return; }
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(opts[active].value); return; }
    if (e.key.length === 1) {
      const now = Date.now();
      typed.current.s = (now - typed.current.t < 700 ? typed.current.s : "") + e.key.toLowerCase();
      typed.current.t = now;
      const i = opts.findIndex(o => o.label.toLowerCase().startsWith(typed.current.s));
      if (i >= 0) setActive(i);
    }
  };

  const curLabel = opts.find(o => o.value === cur)?.label ?? "";

  const trigger = (
    <button
      ref={btn} type="button" className={"sel" + (open ? " is-open" : "")}
      aria-haspopup="listbox" aria-expanded={open} aria-controls={id}
      aria-label={label ? `${label}: ${curLabel}` : curLabel}
      onClick={() => setOpen(o => !o)} onKeyDown={onKey}
    >
      <span className="sel__val">{curLabel}</span>
      <svg className="sel__arrow" viewBox="0 0 12 12" aria-hidden><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );

  const pop = open && pos && createPortal(
    <ul
      ref={list} id={id} role="listbox" tabIndex={-1}
      className={"sel-pop" + (pos.dark ? " sel-pop--dark" : "") + (pos.up ? " is-up" : "")}
      style={{ left: pos.left, top: pos.top, bottom: pos.bottom, width: pos.width, maxHeight: pos.maxH }}
      data-scroll-allow data-lenis-prevent
    >
      {opts.map((o, i) => (
        <li
          key={o.value} role="option" aria-selected={o.value === cur}
          className={"sel-pop__opt" + (o.value === cur ? " is-on" : "") + (i === active ? " is-active" : "")}
          onPointerEnter={() => setActive(i)}
          onClick={() => pick(o.value)}
        >
          <span>{o.label}</span>
          {o.value === cur && <svg viewBox="0 0 14 14" aria-hidden><path d="M3 7.5 6 10l5-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </li>
      ))}
    </ul>,
    document.body,
  );

  return variant === "field" ? (
    <div className={"field field--sel" + (className ? " " + className : "")}>
      {trigger}
      {label && <span className="field__lbl">{label}</span>}
      {name && <input type="hidden" name={name} value={cur} />}
      {pop}
    </div>
  ) : (
    <span className={"sel-inline" + (className ? " " + className : "")}>
      {trigger}
      {name && <input type="hidden" name={name} value={cur} />}
      {pop}
    </span>
  );
}
