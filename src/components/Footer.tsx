import { ArrowUp } from "lucide-react";
import { site } from "@/lib/content";

export function Footer() {
  return (
    <footer className="relative border-t border-bone/10">
      <div className="container-x flex flex-col gap-10 py-14 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-4">
          <span className="monogram" aria-hidden="true">
            {site.initials}
          </span>
          <div>
            <p className="font-display text-xl font-semibold tracking-[-0.02em]">{site.name}</p>
            <p className="text-sm text-bone-dim">{site.role}</p>
          </div>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-7 gap-y-3 text-sm">
          <a href={`mailto:${site.email}`} className="text-link">
            Email
          </a>
          <a href={site.github} target="_blank" rel="noopener noreferrer" className="text-link">
            GitHub
          </a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="text-link">
            LinkedIn
          </a>
          <a href="#top" className="text-link">
            Back to top
            <ArrowUp className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
          </a>
        </nav>
      </div>

      <div className="container-x flex flex-col gap-2 border-t border-bone/5 py-6 font-mono text-[0.68rem] tracking-[0.06em] text-bone-faint sm:flex-row sm:justify-between">
        <span>© 2026 {site.name}. All rights reserved.</span>
      </div>
    </footer>
  );
}
