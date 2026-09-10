"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import gsap from "gsap";

export interface InteractiveListItem {
  client: string;
  platform?: string;
  services: string;
  img: string;
}

export interface InteractiveListPreviewProps {
  items: InteractiveListItem[];
  imageSize?: number;
  duration?: number;
  smoothness?: number;
  lerp?: number;
  bgColor?: string;
  className?: string;
}

const defaults = {
  imageSize: 1,
  duration: 0.6,
  smoothness: 0.35,
  lerp: 0.18,
};

function clamp(value: number | undefined, min: number, max: number, fallback: number) {
  const next = Number(value);
  return Number.isFinite(next) ? Math.min(Math.max(next, min), max) : fallback;
}

/** A desktop hover-list with a pointer-following image preview and a touch-safe fallback. */
export default function InteractiveListPreview({
  items,
  imageSize = defaults.imageSize,
  duration = defaults.duration,
  smoothness = defaults.smoothness,
  lerp = defaults.lerp,
  bgColor = "#171717",
  className = "",
}: InteractiveListPreviewProps) {
  const imageLayer = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const pointer = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const [active, setActive] = useState<number | null>(null);
  const [coarse, setCoarse] = useState(false);
  const safeSize = clamp(imageSize, 0.5, 2, defaults.imageSize);
  const safeDuration = clamp(duration, 0.1, 2, defaults.duration);
  const safeSmoothness = clamp(smoothness, 0.05, 1.5, defaults.smoothness);
  const safeLerp = clamp(lerp, 0.02, 1, defaults.lerp);

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarse(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      pointer.current.x += (target.current.x - pointer.current.x) * safeLerp;
      pointer.current.y += (target.current.y - pointer.current.y) * safeLerp;
      if (imageLayer.current) {
        gsap.set(imageLayer.current, { x: pointer.current.x, y: pointer.current.y });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [safeLerp]);

  const reveal = (index: number, event: ReactMouseEvent<HTMLTableRowElement>) => {
    if (coarse) return;
    target.current = { x: event.clientX + 24, y: event.clientY - 120 };
    setActive(index);
    const image = imageRefs.current[index];
    if (!image) return;
    gsap.killTweensOf(imageRefs.current);
    gsap.set(image, { visibility: "visible" });
    gsap.fromTo(image, { clipPath: "inset(50%)", opacity: 0 }, { clipPath: "inset(0%)", opacity: 1, duration: safeDuration, ease: "power3.out" });
  };

  const hide = (index: number) => {
    if (coarse) return;
    const image = imageRefs.current[index];
    if (!image) return;
    gsap.to(image, { clipPath: "inset(50%)", opacity: 0, duration: safeDuration, ease: "power3.in", onComplete: () => { image.style.visibility = "hidden"; } });
    setActive(null);
  };

  return (
    <section style={{ backgroundColor: bgColor }} className={`relative w-full overflow-hidden font-mono text-white ${className}`}>
      {!coarse && <div ref={imageLayer} className="pointer-events-none fixed left-0 top-0 z-20 h-[22.5rem] w-[19.5rem] -translate-y-1/2">
        {items.map((item, index) => <img key={`${item.client}-${index}`} ref={(element) => { imageRefs.current[index] = element; }} src={item.img} alt="" className="invisible absolute inset-0 h-full w-full object-cover opacity-0" style={{ transform: `scale(${safeSize})` }} />)}
      </div>}
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-0 bg-white transition-[height,transform,opacity]" style={{ opacity: active === null ? 0 : 0.08 }} />
        <table className="w-full table-fixed border-collapse">
          <thead><tr className="border-b border-white/20 text-left text-[10px] uppercase tracking-[0.2em] text-white/45"><th className="w-1/4 px-6 py-4">Client</th><th className="w-1/5 px-6 py-4">Platform</th><th className="px-6 py-4">Services</th></tr></thead>
          <tbody>{items.map((item, index) => <tr key={`${item.client}-${index}`} onMouseEnter={(event) => reveal(index, event)} onMouseMove={(event) => { target.current = { x: event.clientX + 24, y: event.clientY - 120 }; }} onMouseLeave={() => hide(index)} className="group border-b border-white/10 transition-colors hover:bg-white/5">
            <td className="px-6 py-5 text-sm uppercase tracking-[0.15em]">{item.client}</td><td className="px-6 py-5 text-sm uppercase tracking-[0.15em] text-white/55">{item.platform ?? "—"}</td><td className="px-6 py-5 text-sm leading-relaxed text-white/65">{item.services}</td>
          </tr>)}</tbody>
        </table>
      </div>
      {coarse && <div className="grid grid-cols-2 gap-px bg-white/10 md:hidden">{items.map((item, index) => <article key={`${item.client}-mobile-${index}`} className="flex flex-col gap-4 bg-black/20 p-4"><p className="text-xs uppercase tracking-[0.15em]">{item.client}</p><p className="text-xs leading-relaxed text-white/55">{item.services}</p><img src={item.img} alt={item.client} className="aspect-[3/4] w-full object-cover" /></article>)}</div>}
      <style>{`@media (prefers-reduced-motion: reduce){.group{transition:none!important}}`}</style>
    </section>
  );
}
