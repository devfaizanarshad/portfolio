"use client";

import { useLayoutEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollToTarget, setLenis } from "@/lib/scroll";

declare global {
  interface Window {
    __faRevealTimer?: number;
    __faRevealFallback?: boolean;
  }
}

const REVEAL_FROM = { opacity: 0, y: 28 };
const REVEAL_TO = { opacity: 1, y: 0, duration: 0.75, ease: "power3.out" };
const REVEAL_STAGGER = 0.08;
const REVEAL_START = "top 88%";

/**
 * Lenis smooth scrolling synced to GSAP ScrollTrigger, staggered scroll
 * reveals for `[data-reveal]` / `[data-reveal-stagger]`, count-up stats for
 * `[data-count]`, and smooth in-page anchor navigation.
 */
export function ScrollChoreography() {
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const root = document.documentElement;
    window.clearTimeout(window.__faRevealTimer);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animateReveals = !reduceMotion && window.__faRevealFallback !== true;
    // Re-applied because React's dev-mode remount resets attributes on <html>.
    // Without reveal animations, drop it so every element simply shows.
    root.classList.toggle("js", animateReveals);

    // Smooth scrolling ------------------------------------------------------
    let lenis: Lenis | null = null;
    const raf = (time: number) => {
      lenis?.raf(time * 1000);
    };

    if (!reduceMotion) {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      setLenis(lenis);
    }

    // In-page anchors -------------------------------------------------------
    const onAnchorClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;

      const anchor = event.target.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;

      const hash = anchor.getAttribute("href") ?? "#";
      let id = "";
      try {
        id = decodeURIComponent(hash.slice(1));
      } catch {
        return;
      }

      const section = id ? document.getElementById(id) : null;
      if (id && !section) return;

      event.preventDefault();
      scrollToTarget(section ?? "top");
      const url = id ? hash : window.location.pathname + window.location.search;
      window.history.replaceState(window.history.state, "", url);
    };
    document.addEventListener("click", onAnchorClick);

    // Reveals and counters --------------------------------------------------
    const ctx = gsap.context(() => {});
    const revealed = new WeakSet<Element>();

    const reveal = (targets: Element[]) => {
      const fresh = targets.filter((el) => !revealed.has(el));
      if (fresh.length === 0) return;
      fresh.forEach((el) => revealed.add(el));
      ctx.add(() => {
        fresh.forEach((el, index) => {
          gsap.fromTo(el, REVEAL_FROM, {
            ...REVEAL_TO,
            delay: index * REVEAL_STAGGER,
            onComplete: () => {
              el.classList.add("is-revealed");
              gsap.set(el, { clearProps: "opacity,transform" });
            },
          });
        });
      });
    };

    if (animateReveals) {
      ctx.add(() => {
        const singles = gsap.utils.toArray<HTMLElement>("[data-reveal]");
        ScrollTrigger.batch(singles, {
          start: REVEAL_START,
          onEnter: reveal,
          onEnterBack: reveal,
          onLeave: reveal,
        });

        gsap.utils.toArray<HTMLElement>("[data-reveal-stagger]").forEach((group) => {
          const children = Array.from(group.children);
          const run = () => reveal(children);
          ScrollTrigger.create({ trigger: group, start: REVEAL_START, onEnter: run, onEnterBack: run, onLeave: run });
        });

        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          const target = Number(el.dataset.count);
          const decimals = Number(el.dataset.decimals ?? "0");
          if (!Number.isFinite(target)) return;

          const counter = { value: 0 };
          el.textContent = counter.value.toFixed(decimals);
          let started = false;
          const run = () => {
            if (started) return;
            started = true;
            ctx.add(() => {
              gsap.to(counter, {
                value: target,
                duration: 1.8,
                ease: "power3.out",
                onUpdate: () => {
                  el.textContent = counter.value.toFixed(decimals);
                },
              });
            });
          };
          ScrollTrigger.create({ trigger: el, start: "top 92%", onEnter: run, onEnterBack: run, onLeave: run });
        });
      });
    }

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => undefined);
    window.addEventListener("load", refresh);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      window.removeEventListener("load", refresh);
      ctx.revert();
      document.querySelectorAll(".is-revealed").forEach((el) => el.classList.remove("is-revealed"));
      gsap.ticker.remove(raf);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
