"use client";

import { useEffect, useRef, type ReactNode } from "react";

const MAX_TILT = 6;

interface ProjectCardProps {
  className?: string;
  children: ReactNode;
}

/**
 * Card shell with a ±6° perspective tilt and a pointer-following border
 * highlight. Measures an untransformed wrapper so the tilt never feeds back
 * into its own hit-testing. Inert on touch screens.
 */
export function ProjectCard({ className = "", children }: ProjectCardProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const card = cardRef.current;
    if (!wrap || !card) return;

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHover) return;
    const allowTilt = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let rect: DOMRect | null = null;
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const apply = () => {
      frame = 0;
      rect ??= wrap.getBoundingClientRect();
      const x = Math.min(Math.max((pointerX - rect.left) / rect.width, 0), 1);
      const y = Math.min(Math.max((pointerY - rect.top) / rect.height, 0), 1);
      card.style.setProperty("--mx", `${(x * 100).toFixed(2)}%`);
      card.style.setProperty("--my", `${(y * 100).toFixed(2)}%`);
      if (allowTilt) {
        const rotateX = (0.5 - y) * 2 * MAX_TILT;
        const rotateY = (x - 0.5) * 2 * MAX_TILT;
        card.style.transform = `perspective(1100px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
      }
    };

    const schedule = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    const onEnter = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      rect = wrap.getBoundingClientRect();
      card.dataset.hover = "true";
      schedule(event);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      schedule(event);
    };

    const onLeave = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      rect = null;
      delete card.dataset.hover;
      card.style.transform = "";
    };

    const onScroll = () => {
      rect = null;
    };

    wrap.addEventListener("pointerenter", onEnter);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      wrap.removeEventListener("pointerenter", onEnter);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={wrapRef} className={className} data-reveal>
      <article ref={cardRef} className="tilt-card">
        {children}
      </article>
    </div>
  );
}
