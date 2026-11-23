import { ArrowUpRight } from "lucide-react";
import { PortraitScene } from "./PortraitScene";
import { ScrubText } from "./ScrubText";
import { about, site } from "@/lib/content";

export function About() {
  return (
    <section id="about" tabIndex={-1} aria-labelledby="about-title" className="section overflow-hidden">
      <div className="container-x grid items-center gap-16 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <p className="mono-label" data-reveal>
            <span className="text-signal">01</span>
            <span className="mx-2 text-bone-faint">{"//"}</span>
            About
          </p>
          <h2 id="about-title" className="h2 mt-5" data-reveal>
            {about.title}
          </h2>
          <ScrubText text={about.text} className="about-text mt-8 max-w-[34rem]" />
          <div className="mt-10" data-reveal>
            <a href="#contact" data-magnetic className="btn btn-primary">
              Let’s talk
              <ArrowUpRight className="btn-icon size-[18px]" strokeWidth={1.75} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="lg:col-span-6">
          <PortraitScene
            src="/faizan-intro.jpg"
            alt={`Portrait of ${site.name}`}
            name={site.name}
            role={site.role}
            chips={about.chips}
          />
        </div>
      </div>
    </section>
  );
}
