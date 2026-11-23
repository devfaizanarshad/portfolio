import { SectionHeading } from "./SectionHeading";
import { services } from "@/lib/content";

export function Services() {
  return (
    <section id="services" tabIndex={-1} aria-labelledby="services-title" className="section">
      <div className="container-x">
        <SectionHeading index="03" kicker="Services" titleId="services-title" title="How I can help." />

        <div className="mt-14 grid gap-4 md:grid-cols-3" data-reveal-stagger>
          {services.map((service, index) => (
            <article key={service.title} className="stack-panel">
              <p className="mono-label text-signal">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="h3">{service.title}</h3>
              <p className="text-[0.975rem] leading-relaxed text-bone-dim">{service.blurb}</p>
              <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
                {service.items.map((item) => (
                  <li key={item} className="chip">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
