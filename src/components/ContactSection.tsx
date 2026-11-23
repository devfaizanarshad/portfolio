import { ArrowUpRight, Clock3, Reply } from "lucide-react";
import { CopyEmailButton } from "./CopyEmailButton";
import { InquiryForm } from "./InquiryForm";
import { contact, site } from "@/lib/content";

export function ContactSection() {
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent("Project inquiry")}`;

  return (
    <section id="contact" tabIndex={-1} aria-labelledby="contact-title" className="section overflow-hidden">
      <div className="contact-backdrop" aria-hidden="true" />

      <div className="container-x relative">
        <div className="max-w-[48rem]">
          <p className="mono-label" data-reveal>
            <span className="text-signal">04</span>
            <span className="mx-2 text-bone-faint">{"//"}</span>
            Contact
          </p>
          <h2 id="contact-title" className="h2 mt-5" data-reveal>
            {contact.headline}
          </h2>
          <p className="lede mt-6 max-w-[42rem]" data-reveal>
            {contact.sub}
          </p>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-12">
          <aside className="panel flex flex-col lg:col-span-5" aria-label="Direct contact" data-reveal>
            <p className="mono-label">Direct line</p>
            <a href={mailto} className="contact-email">
              {site.email}
            </a>

            <div className="mt-6 flex flex-wrap gap-2">
              <CopyEmailButton email={site.email} className="grow" />
              <a href={mailto} data-magnetic className="btn btn-ghost grow">
                Email directly
                <ArrowUpRight className="btn-icon size-4" strokeWidth={1.75} aria-hidden="true" />
              </a>
            </div>

            <ul className="contact-notes mt-9 border-t border-bone/10 pt-7">
              <li>
                <Clock3 className="size-[18px]" strokeWidth={1.5} aria-hidden="true" />
                {contact.timezoneNote}
              </li>
              <li>
                <Reply className="size-[18px]" strokeWidth={1.5} aria-hidden="true" />
                {contact.replyNote}
              </li>
            </ul>

            <div className="mt-auto pt-9">
              <div className="flex gap-6 text-sm">
                <a href={site.github} target="_blank" rel="noopener noreferrer" className="text-link">
                  GitHub
                  <ArrowUpRight className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                </a>
                <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="text-link">
                  LinkedIn
                  <ArrowUpRight className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                </a>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-7" data-reveal>
            <InquiryForm />
          </div>
        </div>
      </div>
    </section>
  );
}
