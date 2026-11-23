"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface PortraitSceneProps {
  src: string;
  alt: string;
  name: string;
  role: string;
  chips: readonly { value: string; label: string }[];
}

/**
 * Portrait that swings into place in 3D as you scroll, then tilts with the
 * pointer. Rings, badges and the photo itself drift at different speeds for
 * depth. Everything animates transform/opacity only.
 */
export function PortraitScene({ src, alt, name, role, chips }: PortraitSceneProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const tilt = tiltRef.current;
    if (!stage || !tilt) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const amp = window.matchMedia("(max-width: 767px)").matches ? 0.6 : 1;
    const whole = { trigger: stage, start: "top 100%", end: "bottom 0%", scrub: true };

    const ctx = gsap.context(() => {
      gsap
        .timeline({ scrollTrigger: { ...whole, scrub: 0.8 } })
        .fromTo(
          ".portrait-card",
          { rotationY: -36 * amp, rotationX: 12 * amp, z: -160, scale: 0.86, y: 80 },
          { rotationY: 0, rotationX: 0, z: 0, scale: 1, y: 0, ease: "power2.out", duration: 1 },
        )
        .to(".portrait-card", { rotationY: 18 * amp, rotationX: -5 * amp, y: -40, ease: "power1.in", duration: 1 });

      gsap.fromTo(
        ".portrait-img",
        { scale: 1.24 },
        { scale: 1, ease: "none", scrollTrigger: { ...whole, end: "center 45%" } },
      );

      gsap.utils.toArray<HTMLElement>(".portrait-chip").forEach((chip, index) => {
        const speed = 50 + index * 35;
        gsap.fromTo(chip, { y: speed }, { y: -speed, ease: "none", scrollTrigger: whole });
      });

      gsap.fromTo(".portrait-ring-a", { rotation: -40 }, { rotation: 140, ease: "none", scrollTrigger: whole });
      gsap.fromTo(".portrait-ring-b", { rotation: 60 }, { rotation: -120, ease: "none", scrollTrigger: whole });
      gsap.fromTo(".portrait-glow", { scale: 0.6, opacity: 0.2 }, { scale: 1.15, opacity: 1, ease: "none", scrollTrigger: whole });
    }, stage);

    let cleanupPointer = () => {};
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      gsap.set(tilt, { transformPerspective: 1100 });
      const rotateX = gsap.quickTo(tilt, "rotationX", { duration: 0.7, ease: "power3.out" });
      const rotateY = gsap.quickTo(tilt, "rotationY", { duration: 0.7, ease: "power3.out" });

      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        const rect = stage.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        rotateY((x - 0.5) * 16);
        rotateX((0.5 - y) * 16);
        tilt.style.setProperty("--sx", `${(x * 100).toFixed(1)}%`);
        tilt.style.setProperty("--sy", `${(y * 100).toFixed(1)}%`);
      };
      const onLeave = () => {
        rotateX(0);
        rotateY(0);
      };

      stage.addEventListener("pointermove", onMove, { passive: true });
      stage.addEventListener("pointerleave", onLeave);
      cleanupPointer = () => {
        stage.removeEventListener("pointermove", onMove);
        stage.removeEventListener("pointerleave", onLeave);
      };
    }

    return () => {
      cleanupPointer();
      ctx.revert();
    };
  }, []);

  return (
    <div ref={stageRef} className="portrait-stage">
      <div className="portrait-glow" aria-hidden="true" />
      <div className="portrait-ring portrait-ring-a" aria-hidden="true" />
      <div className="portrait-ring portrait-ring-b" aria-hidden="true" />

      <div className="portrait-card">
        <div ref={tiltRef} className="portrait-tilt">
          <div className="portrait-edge" aria-hidden="true" />
          <div className="portrait-photo">
            <div className="portrait-img">
              <Image
                src={src}
                alt={alt}
                fill
                sizes="(min-width: 1024px) 520px, 90vw"
                className="object-cover"
                style={{ objectPosition: "50% 50%", transform: "scale(1.5)", transformOrigin: "48% 66%" }}
              />
            </div>
            <div className="portrait-shade" aria-hidden="true" />
            <div className="portrait-shine" aria-hidden="true" />
            <div className="portrait-caption">
              <p className="font-display text-lg font-semibold tracking-[-0.02em]">{name}</p>
              <p className="mono-label mt-1 text-bone-dim">{role}</p>
            </div>
          </div>
        </div>
      </div>

      {chips.map((chip, index) => (
        <div key={chip.label} className={`portrait-chip portrait-chip-${index + 1}`}>
          <span className="font-display text-xl font-semibold tracking-[-0.02em]">{chip.value}</span>
          <span className="mono-label">{chip.label}</span>
        </div>
      ))}
    </div>
  );
}
