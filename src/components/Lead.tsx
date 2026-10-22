import { createContext, useContext, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { gsap, useScroll } from "../lib/motion";
import { CITIES } from "../data/content";
import { Check, Close } from "./Icons";
import "./lead.css";

export interface LeadContext { title: string; details?: string[] }
interface Api { open: (ctx?: LeadContext) => void }
const Ctx = createContext<Api>({ open: () => {} });
export const useLead = () => useContext(Ctx);

export function LeadProvider({ children }: { children: ReactNode }) {
  const [ctx, setCtx] = useState<LeadContext | null>(null);
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const { lock } = useScroll();

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    lock(open);
    if (open) {
      gsap.set(el, { visibility: "visible" });
      gsap.timeline()
        .fromTo(el.querySelector(".lm__veil"), { opacity: 0 }, { opacity: 1, duration: 0.5 })
        .fromTo(el.querySelector(".lm__panel"), { xPercent: 100 }, { xPercent: 0, duration: 0.9, ease: "expo.out" }, 0)
        .fromTo(el.querySelectorAll("[data-li]"), { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.7, ease: "expo.out" }, 0.25);
    } else {
      gsap.timeline({ onComplete: () => { gsap.set(el, { visibility: "hidden" }); setSent(false); } })
        .to(el.querySelector(".lm__panel"), { xPercent: 100, duration: 0.6, ease: "expo.in" })
        .to(el.querySelector(".lm__veil"), { opacity: 0, duration: 0.4 }, 0.2);
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
    requestAnimationFrame(() => {
      const s = root.current?.querySelector(".lm__success");
      if (s) gsap.fromTo(s.children, { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.8, ease: "expo.out" });
      const p = root.current?.querySelector(".lm__check path") as SVGPathElement | null;
      if (p) { const l = p.getTotalLength(); gsap.fromTo(p, { strokeDasharray: l, strokeDashoffset: l }, { strokeDashoffset: 0, duration: 0.9, ease: "power2.out", delay: 0.2 }); }
    });
  };

  return (
    <Ctx.Provider value={{ open: c => { setCtx(c ?? null); setOpen(true); } }}>
      {children}
      <div className="lm" ref={root} style={{ visibility: "hidden" }} aria-hidden={!open} role="dialog" aria-modal="true" aria-label="Заявка">
        <div className="lm__veil" onClick={() => setOpen(false)} />
        <div className="lm__panel dark">
          <button className="lm__close" onClick={() => setOpen(false)} aria-label="Закрыть"><Close /></button>
          {!sent ? (
            <form onSubmit={submit} className="lm__form">
              <span className="eyebrow" data-li>Бесплатная консультация</span>
              <h3 className="h2" data-li>{ctx?.title ? "Рассчитаем стоимость" : "Подберём двери под ваш интерьер"}</h3>
              {ctx && (
                <div className="lm__ctx" data-li>
                  <div className="lm__ctx-title">{ctx.title}</div>
                  {ctx.details?.map(d => <div key={d} className="lm__ctx-row">{d}</div>)}
                </div>
              )}
              <p className="lm__sub" data-li>Менеджер перезвонит в течение 15 минут в рабочее время, рассчитает комплект с погонажем и подскажет ближайший салон.</p>
              <div className="lm__fields">
                <label className="field" data-li><input required placeholder=" " name="name" /><label>Как к вам обращаться</label></label>
                <label className="field" data-li><input required placeholder=" " name="phone" type="tel" inputMode="tel" pattern="[0-9+()\- ]{10,}" /><label>Телефон</label></label>
                <label className="field" data-li>
                  <select name="city" defaultValue="Москва">{CITIES.map(c => <option key={c}>{c}</option>)}</select>
                  <label>Город</label>
                </label>
                <label className="field" data-li><textarea placeholder=" " name="comment" /><label>Комментарий: количество проёмов, сроки</label></label>
              </div>
              <div className="lm__pref" data-li>
                <span className="small muted">Удобнее связаться:</span>
                {["Звонок", "WhatsApp", "Telegram", "MAX"].map((m, i) => (
                  <label key={m} className="lm__radio"><input type="radio" name="via" defaultChecked={i === 0} /><span>{m}</span></label>
                ))}
              </div>
              <button className="btn btn--brass" type="submit" data-li>Отправить заявку</button>
              <p className="consent" data-li>Нажимая кнопку, вы соглашаетесь с <Link to="/politika" onClick={() => setOpen(false)}>политикой обработки персональных данных</Link>.</p>
            </form>
          ) : (
            <div className="lm__success">
              <svg className="lm__check" viewBox="0 0 80 80"><circle cx="40" cy="40" r="38" fill="none" stroke="currentColor" strokeOpacity=".2" /><path d="M24 41l11 11 22-24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
              <h3 className="h2">Заявка принята</h3>
              <p className="lm">Это демо-версия: в рабочем сайте заявка уйдёт в CRM, а менеджер получит название модели и выбранную конфигурацию.</p>
              <button className="btn btn--ghost" onClick={() => setOpen(false)}>Вернуться к сайту</button>
            </div>
          )}
        </div>
      </div>
    </Ctx.Provider>
  );
}

export function Messengers() {
  const [open, setOpen] = useState(false);
  return (
    <div className={"msgr" + (open ? " is-open" : "")}>
      <div className="msgr__list">
        <a href="https://t.me/holzinteriordoors" target="_blank" rel="noreferrer" className="msgr__item" style={{ ["--i" as string]: 2 }}>Telegram</a>
        <a href="#" onClick={e => e.preventDefault()} className="msgr__item" style={{ ["--i" as string]: 1 }}>WhatsApp</a>
        <a href="#" onClick={e => e.preventDefault()} className="msgr__item" style={{ ["--i" as string]: 0 }}>MAX</a>
      </div>
      <button className="msgr__btn" onClick={() => setOpen(o => !o)} aria-label="Написать в мессенджер" data-cursor="Написать">
        <span className="msgr__pulse" />
        {open ? <Close /> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20 12a8 8 0 0 1-11.7 7.1L4 20l1-4A8 8 0 1 1 20 12Z" /></svg>}
      </button>
      <span className="sr-only"><Check /></span>
    </div>
  );
}
