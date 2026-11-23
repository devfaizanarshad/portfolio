"use client";

import dynamic from "next/dynamic";

/** Three.js stays out of the server render and the initial JS payload. */
const ParticleHero = dynamic(() => import("./ParticleHero"), { ssr: false, loading: () => null });

export function HeroCanvasMount() {
  return <ParticleHero />;
}
