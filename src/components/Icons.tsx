import type { SVGProps } from "react";

const base = (p: SVGProps<SVGSVGElement>) => ({ width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, ...p });

export const Arrow = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)} className={"arrow " + (p.className ?? "")}><path d="M4 12h16M14 6l6 6-6 6" /></svg>;
export const ArrowUR = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M7 17 17 7M9 7h8v8" /></svg>;
export const Phone = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>;
export const Close = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const Search = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
export const Pin = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>;
export const Check = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="m5 12 5 5L20 7" /></svg>;
export const Plus = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>;
export const Filter = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M4 6h16M7 12h10M10 18h4" /></svg>;
export const Clock = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
export const Download = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M12 4v11m-5-5 5 5 5-5M5 20h14" /></svg>;
export const Star = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)} fill="currentColor" stroke="none"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" /></svg>;
export const Chat = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M20 12a8 8 0 0 1-11.7 7.1L4 20l1-4A8 8 0 1 1 20 12Z" /></svg>;
export const Telegram = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)} fill="currentColor" stroke="none"><path d="M21.5 4.3 2.9 11.5c-1 .4-1 1.6 0 1.9l4.7 1.5 1.8 5.6c.3.8 1.3 1 1.9.4l2.6-2.5 4.9 3.6c.7.5 1.7.1 1.9-.8l3-14.6c.2-1-.8-1.8-1.7-1.3ZM9.8 14.4l-.5 3.9-1.2-3.8 9.6-6.7Z" /></svg>;
export const WhatsApp = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3.3 3.2Z" /><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1.2-1.6-2-1-1 .8a5 5 0 0 1-2.4-2.4l.8-1-1-2Z" fill="currentColor" stroke="none" /></svg>;
