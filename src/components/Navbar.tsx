"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import { navLinks, site } from "@/lib/content";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  // Firmer glass once the page has moved.
  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  // Highlight the section currently crossing the middle of the viewport.
  useEffect(() => {
    const ids = ["top", ...navLinks.map((link) => link.href.slice(1))];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id === "top" ? "" : `#${entry.target.id}`);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Close the mobile menu on Escape or when the layout grows past it.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (desktop.matches) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onChange);
    return () => {
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onChange);
    };
  }, [open]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 px-4">
      <nav
        aria-label="Primary"
        data-scrolled={scrolled}
        className="nav-pill pointer-events-auto mx-auto flex h-[60px] max-w-[1120px] items-center justify-between gap-3 rounded-full px-2"
      >
        <div className="flex min-w-0 items-center gap-3">
          <a href="#top" className="flex min-w-0 items-center gap-3 rounded-full" aria-label={`${site.name}, back to top`}>
            <span className="monogram" aria-hidden="true">
              {site.initials}
            </span>
            <span className="truncate whitespace-nowrap font-display text-[0.95rem] font-semibold tracking-[-0.02em] text-bone max-[339px]:hidden">
              {site.name}
            </span>
          </a>
        </div>

        <ul className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                data-magnetic
                className="nav-link"
                aria-current={active === link.href ? "location" : undefined}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex flex-none items-center gap-1.5">
          <a href="#contact" data-magnetic className="btn btn-primary btn-sm max-sm:px-3.5">
            Book a Build
            <ArrowUpRight className="btn-icon hidden size-4 sm:block" strokeWidth={1.75} aria-hidden="true" />
          </a>
          <button
            type="button"
            className="menu-btn lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <X className="size-[18px]" strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Menu className="size-[18px]" strokeWidth={1.5} aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      <div id="mobile-menu" className="mobile-menu pointer-events-auto lg:hidden" hidden={!open}>
        <ul>
          {navLinks.map((link, index) => (
            <li key={link.href}>
              <a href={link.href} className="mobile-link" onClick={() => setOpen(false)}>
                <span className="font-mono text-[0.7rem] font-medium tracking-[0.1em] text-signal">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">{link.label}</span>
                <ArrowRight className="size-4 text-bone-faint" strokeWidth={1.5} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
