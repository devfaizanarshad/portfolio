"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";

const SPOTLIGHT_SIZE = 320;
const LERP = 0.12;
/** How far outside an element's edge the pull starts. */
const MAGNET_RADIUS = 40;
const MAX_PULL_X = 12;
const MAX_PULL_Y = 9;

interface Magnet {
  el: HTMLElement;
  active: boolean;
}

/**
 * Desktop-only cursor spotlight plus magnetic snapping for every
 * `[data-magnetic]` element. Disabled for touch input and reduced motion.
 */
export function MagneticCursor() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (coarse || !fine || reduceMotion) return;

    gsap.registerPlugin(CustomEase);
    const snapEase = CustomEase.create("magneticSnap", "M0,0 C0.23,1 0.32,1 1,1");

    let magnets: Magnet[] = [];
    const collect = () => {
      const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
      const next = elements.map((el) => magnets.find((magnet) => magnet.el === el) ?? { el, active: false });
      for (const magnet of magnets) {
        if (!next.includes(magnet)) gsap.killTweensOf(magnet.el);
      }
      magnets = next;
    };
    collect();

    const pointer = { x: -9999, y: -9999, inside: false };
    const spot = { x: 0, y: 0 };
    let frame = 0;
    let magnetsDirty = false;
    let overMagnet = false;

    const updateMagnets = () => {
      let anyActive = false;
      for (const magnet of magnets) {
        const rect = magnet.el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;

        // Remove the current pull so the hit zone is measured from the resting position.
        const offsetX = Number(gsap.getProperty(magnet.el, "x")) || 0;
        const offsetY = Number(gsap.getProperty(magnet.el, "y")) || 0;
        const centerX = rect.left + rect.width / 2 - offsetX;
        const centerY = rect.top + rect.height / 2 - offsetY;
        const dx = pointer.x - centerX;
        const dy = pointer.y - centerY;
        const gapX = Math.max(0, Math.abs(dx) - rect.width / 2);
        const gapY = Math.max(0, Math.abs(dy) - rect.height / 2);
        const within = pointer.inside && Math.hypot(gapX, gapY) <= MAGNET_RADIUS;

        if (within) {
          anyActive = true;
          magnet.active = true;
          const reachX = rect.width / 2 + MAGNET_RADIUS;
          const reachY = rect.height / 2 + MAGNET_RADIUS;
          gsap.to(magnet.el, {
            x: (dx / reachX) * MAX_PULL_X,
            y: (dy / reachY) * MAX_PULL_Y,
            duration: 0.4,
            ease: snapEase,
            overwrite: "auto",
          });
        } else if (magnet.active) {
          magnet.active = false;
          gsap.to(magnet.el, { x: 0, y: 0, duration: 0.8, ease: snapEase, overwrite: "auto" });
        }
      }

      if (anyActive !== overMagnet) {
        overMagnet = anyActive;
        glow.dataset.magnet = String(anyActive);
      }
    };

    const tick = () => {
      frame = 0;
      spot.x += (pointer.x - spot.x) * LERP;
      spot.y += (pointer.y - spot.y) * LERP;
      glow.style.transform = `translate3d(${(spot.x - SPOTLIGHT_SIZE / 2).toFixed(1)}px, ${(
        spot.y -
        SPOTLIGHT_SIZE / 2
      ).toFixed(1)}px, 0)`;

      if (magnetsDirty) {
        magnetsDirty = false;
        updateMagnets();
      }

      if (Math.abs(pointer.x - spot.x) > 0.2 || Math.abs(pointer.y - spot.y) > 0.2) schedule();
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!pointer.inside) {
        pointer.inside = true;
        spot.x = pointer.x;
        spot.y = pointer.y;
        glow.dataset.visible = "true";
      }
      magnetsDirty = true;
      schedule();
    };

    const onPointerExit = () => {
      pointer.inside = false;
      glow.dataset.visible = "false";
      magnetsDirty = true;
      schedule();
    };

    const onMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget) onPointerExit();
    };

    const onScroll = () => {
      if (!pointer.inside) return;
      magnetsDirty = true;
      schedule();
    };

    let collectFrame = 0;
    const observer = new MutationObserver((mutations) => {
      const elementsChanged = mutations.some((mutation) =>
        [...mutation.addedNodes, ...mutation.removedNodes].some((node) => node.nodeType === Node.ELEMENT_NODE),
      );
      if (!elementsChanged || collectFrame) return;
      collectFrame = window.requestAnimationFrame(() => {
        collectFrame = 0;
        collect();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("blur", onPointerExit);
    document.addEventListener("mouseout", onMouseOut);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("blur", onPointerExit);
      document.removeEventListener("mouseout", onMouseOut);
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(collectFrame);
      for (const magnet of magnets) {
        gsap.killTweensOf(magnet.el);
        gsap.set(magnet.el, { clearProps: "transform" });
      }
      glow.dataset.visible = "false";
      glow.dataset.magnet = "false";
    };
  }, []);

  return <div ref={glowRef} className="cursor-glow" data-visible="false" data-magnet="false" aria-hidden="true" />;
}
