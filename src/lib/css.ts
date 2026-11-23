import type { CSSProperties } from "react";

/** Typed helper for inline CSS custom properties, e.g. cssVars({ "--i": 2 }). */
export function cssVars(vars: Record<`--${string}`, string | number>): CSSProperties {
  return vars as unknown as CSSProperties;
}
