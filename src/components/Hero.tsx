import { ArrowDown, ArrowUpRight } from "lucide-react";
import { HeroCanvasMount } from "./HeroCanvasMount";
import { hero } from "@/lib/content";
import { cssVars } from "@/lib/css";

/**
 * Pinned scroll story. The section is taller than the screen; its inner
 * panel sticks while the particles move through Idea → Build → Launch.
 * Without WebGL (or with reduced motion) it collapses to a normal hero
 * showing the HTML title.
 */
export function Hero() {
  return (
    <section id="top" tabIndex={-1} aria-labelledby="hero-title" className="hero-scroll" data-stage="0">
      <div className="hero-sticky">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-aura" aria-hidden="true" />
        <HeroCanvasMount />
        <div className="hero-vignette" aria-hidden="true" />

        <div className="hero-ui container-x">
          <div className="hero-top hero-in" style={cssVars({ "--d": "0.6s" })}>
            <div>
              <ol className="hero-steps" aria-hidden="true">
                {hero.stages.map((stage, index) => (
                  <li key={stage.label} className={`hero-step hero-step-${index}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {stage.label}
                  </li>
                ))}
              </ol>
              <div className="hero-progress" aria-hidden="true">
                <span />
              </div>
            </div>
            <p className="hero-scroll-label" aria-hidden="true">
              Scroll to explore
              <ArrowDown className="size-3.5" strokeWidth={1.5} />
            </p>
          </div>

          <h1 id="hero-title" className="hero-title">
            {hero.title}
          </h1>

          <div className="hero-bottom">
            <div className="hero-captions">
              {hero.stages.map((stage, index) => (
                <p key={stage.label} className={`hero-caption hero-caption-${index}`}>
                  {stage.caption}
                </p>
              ))}
            </div>
            <div className="hero-actions hero-in" style={cssVars({ "--d": "0.9s" })}>
              <a href="#contact" data-magnetic className="btn btn-primary btn-lg">
                Start a Project
                <ArrowUpRight className="btn-icon size-[18px]" strokeWidth={1.75} aria-hidden="true" />
              </a>
              <a href="#work" data-magnetic className="btn btn-ghost btn-lg">
                See My Work
                <ArrowDown className="btn-icon btn-icon-down size-[18px]" strokeWidth={1.5} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
