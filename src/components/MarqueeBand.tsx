"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const ROWS = [
  ["Websites", "Web apps", "Online stores", "Dashboards", "Maps", "Mobile apps"],
  ["Built to last", "Fast", "Secure", "Easy to use", "Looked after", "Ready to grow"],
];

/** Two giant text rows that slide in opposite directions as you scroll. */
export function MarqueeBand() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const scroll = { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 };
      gsap.fromTo(".band-row-a", { xPercent: 0 }, { xPercent: -28, ease: "none", scrollTrigger: scroll });
      gsap.fromTo(".band-row-b", { xPercent: -28 }, { xPercent: 0, ease: "none", scrollTrigger: scroll });
      gsap.fromTo(el, { rotation: -3 }, { rotation: 0, ease: "none", scrollTrigger: scroll });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div className="band-wrap" aria-hidden="true">
      <div ref={ref} className="band">
        {ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className={`band-row ${rowIndex === 0 ? "band-row-a" : "band-row-b band-row-outline"}`}>
            {[...row, ...row, ...row].map((item, index) => (
              <span key={index} className="band-item">
                {item}
                <span className="band-star">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
