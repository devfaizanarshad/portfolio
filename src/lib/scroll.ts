import type Lenis from "lenis";

let lenisInstance: Lenis | null = null;

export function setLenis(instance: Lenis | null): void {
  lenisInstance = instance;
}

/**
 * Smoothly scrolls to a section (through Lenis when it is running) and then
 * moves keyboard focus there, so the next Tab continues from the new place.
 */
export function scrollToTarget(target: HTMLElement | "top"): void {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const moveFocus = () => {
    if (target !== "top" && target.hasAttribute("tabindex")) {
      target.focus({ preventScroll: true });
    }
  };

  if (lenisInstance) {
    lenisInstance.scrollTo(target === "top" ? 0 : target, { onComplete: moveFocus });
    return;
  }

  const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";
  if (target === "top") {
    window.scrollTo({ top: 0, behavior });
  } else {
    target.scrollIntoView({ behavior, block: "start" });
  }
  moveFocus();
}
