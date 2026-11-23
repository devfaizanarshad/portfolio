import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { ProjectCard } from "./ProjectCard";
import { SectionHeading } from "./SectionHeading";
import { mobileApps, projects, type Project } from "@/lib/content";

function ProjectCardBody({ project, number, priority }: { project: Project; number: number; priority: boolean }) {
  const phone = project.size !== undefined;
  const [width, height] = project.size ?? [1600, 900];

  return (
    <div className="relative z-[1] flex h-full flex-col p-4 sm:p-5">
      {phone ? (
        <div className="shot-phone">
          <Image
            src={project.image}
            alt={project.imageAlt}
            width={width}
            height={height}
            sizes="(min-width: 1024px) 18vw, 50vw"
          />
        </div>
      ) : (
        <div className="shot">
          <div className="shot-bar" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <Image
            src={project.image}
            alt={project.imageAlt}
            width={width}
            height={height}
            sizes="(min-width: 1024px) 58vw, (min-width: 768px) 90vw, 100vw"
            priority={priority}
            className="shot-img"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col px-2 pb-2 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p className="mono-label text-bone-faint">
            {String(number).padStart(2, "0")} · {project.category}
          </p>
          <span className="metric-badge">{project.badge}</span>
        </div>
        <h3 className="h3 mt-4">{project.title}</h3>
        <p className="mt-2 text-[0.975rem] leading-relaxed text-bone-dim">{project.summary}</p>
        {project.href && (
          <a href={project.href} target="_blank" rel="noopener noreferrer" className="card-link mt-auto pt-5">
            {project.cta ?? "Visit site"}
            <ArrowUpRight className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
            <span className="sr-only">: {project.title} (opens in a new tab)</span>
          </a>
        )}
      </div>
    </div>
  );
}

export function SelectedWork() {
  return (
    <section id="work" tabIndex={-1} aria-labelledby="work-title" className="section">
      <div className="container-x">
        <SectionHeading
          index="02"
          kicker="Recent work"
          titleId="work-title"
          title="Things I’ve built."
          lede="Websites, platforms and apps I’ve designed, built and kept running for real clients."
        />

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-12">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} className={project.layout}>
              <ProjectCardBody project={project} number={index + 1} priority={index === 0} />
            </ProjectCard>
          ))}
        </div>

        <h3 className="mono-label mt-20" data-reveal>
          <span className="text-signal">Mobile apps</span>
        </h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mobileApps.map((project, index) => (
            <ProjectCard key={project.id}>
              <ProjectCardBody project={project} number={projects.length + index + 1} priority={false} />
            </ProjectCard>
          ))}
        </div>
      </div>
    </section>
  );
}
