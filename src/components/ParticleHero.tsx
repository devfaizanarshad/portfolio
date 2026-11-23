"use client";

import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  MathUtils,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from "three";
import { hero } from "@/lib/content";

/*
 * Scroll story told with particles:
 *   stage 0  particles stream in and spell the first word
 *   stage 1  they swirl into a rotating 3D globe with orbit rings
 *   stage 2  they reassemble into the second word
 * The cursor pushes particles away. All motion happens in the vertex shader;
 * the CPU only updates a handful of uniforms per frame.
 */

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uIntro;
  uniform float uMorphA;
  uniform float uMorphB;
  uniform float uSpin;
  uniform float uCenterY;
  uniform vec3 uMouse;
  uniform float uMouseForce;
  uniform float uRadius;
  uniform float uSize;
  uniform float uPixelRatio;

  attribute vec3 aWordA;
  attribute vec3 aSphere;
  attribute vec3 aWordB;
  attribute vec3 aStart;
  attribute vec4 aRand;

  varying vec3 vColor;
  varying float vAlpha;

  float easeInOut(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  vec3 rotateY(vec3 p, float a) {
    float c = cos(a);
    float s = sin(a);
    return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
  }

  vec3 rotateX(vec3 p, float a) {
    float c = cos(a);
    float s = sin(a);
    return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
  }

  void main() {
    vec3 sphere = rotateX(rotateY(aSphere, uSpin), 0.32);
    sphere.y += uCenterY;

    float tA = easeInOut(clamp(uMorphA * 1.5 - aRand.x * 0.5, 0.0, 1.0));
    float tB = easeInOut(clamp(uMorphB * 1.5 - aRand.y * 0.5, 0.0, 1.0));
    vec3 p = mix(aWordA, sphere, tA);
    p = mix(p, aWordB, tB);

    // Swirl while travelling between shapes.
    float travel = sin(3.14159 * tA) + sin(3.14159 * tB);
    float ang = aRand.z * 6.2831 + uTime * 0.7;
    p += vec3(cos(ang), sin(ang * 1.3) * 0.7, sin(ang)) * travel * (0.3 + aRand.w * 1.1);

    // Intro: stream in from a wide vortex.
    float tI = easeInOut(clamp(uIntro * 1.6 - aRand.y * 0.6, 0.0, 1.0));
    p = mix(aStart, p, tI);

    // Idle shimmer.
    p += vec3(
      sin(uTime * 0.9 + aRand.x * 40.0),
      cos(uTime * 0.7 + aRand.y * 40.0),
      sin(uTime * 0.8 + aRand.z * 40.0)
    ) * 0.012;

    // Cursor pushes particles away.
    vec2 diff = p.xy - uMouse.xy;
    float dist = length(diff);
    float force = (1.0 - smoothstep(0.0, uRadius, dist)) * uMouseForce;
    p.xy += normalize(diff + 0.0001) * force * 0.6;
    p.z += force * 0.8;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.55 + aRand.z * 0.9) * uPixelRatio * (9.0 / -mv.z);

    float globe = tA * (1.0 - tB);
    float warm = step(0.86, aRand.w);
    vec3 bone = vec3(0.93, 0.91, 0.88);
    vec3 signal = vec3(1.0, 0.42, 0.21);
    vColor = mix(bone, signal, clamp(warm + force * 1.6 + globe * step(0.55, aRand.w) * 0.85, 0.0, 1.0));

    float twinkle = 0.78 + 0.22 * sin(uTime * 1.6 + aRand.x * 30.0);
    float depth = mix(1.0, clamp(0.6 + p.z * 0.3, 0.12, 1.0), globe);
    vAlpha = twinkle * depth * (0.25 + 0.75 * tI);
  }
`;

const FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.08, d);
    gl_FragColor = vec4(vColor, a * vAlpha * 0.9);
  }
`;

const FOV = 35;
const CAMERA_Z = 9;

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
const remap = (value: number, from: number, to: number) => clamp01((value - from) / (to - from));

function displayFont(): string {
  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-space-grotesk").trim();
  return family || "'Space Grotesk', system-ui, sans-serif";
}

/** Spell a word in particles: sample its pixels and fit it inside maxW × maxH. */
function sampleWord(
  word: string,
  family: string,
  count: number,
  maxW: number,
  maxH: number,
  centerY: number,
  out: Float32Array,
) {
  const fontSize = 260;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return;

  const setFont = () => {
    context.font = `700 ${fontSize}px ${family}`;
    if ("letterSpacing" in context) context.letterSpacing = `${-fontSize * 0.04}px`;
  };
  setFont();
  const width = Math.ceil(context.measureText(word).width) + 80;
  const height = Math.ceil(fontSize * 1.3);
  canvas.width = width;
  canvas.height = height;
  setFont();
  context.fillStyle = "#fff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(word, width / 2, height / 2);

  const data = context.getImageData(0, 0, width, height).data;
  const points: number[] = [];
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      if (data[(y * width + x) * 4 + 3] > 140) {
        points.push(x, y);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const total = points.length / 2;
  if (total === 0) return;

  const inkW = maxX - minX || 1;
  const inkH = maxY - minY || 1;
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const scale = Math.min(maxW / inkW, maxH / inkH);

  for (let i = 0; i < count; i++) {
    const j = Math.floor(Math.random() * total) * 2;
    const x = points[j] + (Math.random() - 0.5) * 2;
    const y = points[j + 1] + (Math.random() - 0.5) * 2;
    out[i * 3] = (x - midX) * scale;
    out[i * 3 + 1] = -(y - midY) * scale + centerY;
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.22;
  }
}

/** Globe: most particles on a Fibonacci sphere, the rest on two tilted orbit rings. */
function sampleGlobe(count: number, radius: number, out: Float32Array) {
  const surface = Math.floor(count * 0.78);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    let x: number;
    let y: number;
    let z: number;
    if (i < surface) {
      const k = i / (surface - 1);
      y = 1 - 2 * k;
      const r = Math.sqrt(1 - y * y);
      const phi = i * golden;
      const jitter = 1 + (Math.random() - 0.5) * 0.03;
      x = Math.cos(phi) * r * radius * jitter;
      z = Math.sin(phi) * r * radius * jitter;
      y *= radius * jitter;
    } else {
      const ring = i % 2;
      const angle = Math.random() * Math.PI * 2;
      const ringRadius = radius * (ring ? 1.62 : 1.38) * (1 + (Math.random() - 0.5) * 0.02);
      const flat = new Vector3(Math.cos(angle) * ringRadius, (Math.random() - 0.5) * 0.03, Math.sin(angle) * ringRadius);
      flat.applyAxisAngle(new Vector3(1, 0, 0), ring ? 0.55 : -0.35);
      flat.applyAxisAngle(new Vector3(0, 0, 1), ring ? -0.3 : 0.45);
      x = flat.x;
      y = flat.y;
      z = flat.z;
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
}

export default function ParticleHero() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const section = host?.closest("section");
    if (!host || !section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.dataset.webgl = "off";
      return;
    }

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch {
      section.dataset.webgl = "off";
      return;
    }

    let disposed = false;
    const compact = Math.min(window.innerWidth, window.innerHeight) < 700;
    const count = compact ? 12000 : 32000;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);

    const scene = new Scene();
    const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.set(0, 0, CAMERA_Z);

    const wordA = new Float32Array(count * 3);
    const globe = new Float32Array(count * 3);
    const wordB = new Float32Array(count * 3);
    const start = new Float32Array(count * 3);
    const rand = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 7 + Math.random() * 8;
      start[i * 3] = Math.cos(angle) * r;
      start[i * 3 + 1] = Math.sin(angle) * r * 0.6;
      start[i * 3 + 2] = -7 + Math.random() * 11;
      for (let k = 0; k < 4; k++) rand[i * 4 + k] = Math.random();
    }

    const geometry = new BufferGeometry();
    // "position" is required by three.js for bounds; the shader uses the targets.
    geometry.setAttribute("position", new BufferAttribute(new Float32Array(count * 3), 3));
    const wordAAttr = new BufferAttribute(wordA, 3);
    const globeAttr = new BufferAttribute(globe, 3);
    const wordBAttr = new BufferAttribute(wordB, 3);
    geometry.setAttribute("aWordA", wordAAttr);
    geometry.setAttribute("aSphere", globeAttr);
    geometry.setAttribute("aWordB", wordBAttr);
    geometry.setAttribute("aStart", new BufferAttribute(start, 3));
    geometry.setAttribute("aRand", new BufferAttribute(rand, 4));

    const material = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uIntro: { value: 0 },
        uMorphA: { value: 0 },
        uMorphB: { value: 0 },
        uSpin: { value: 0 },
        uCenterY: { value: 0 },
        uMouse: { value: new Vector3(99, 99, 0) },
        uMouseForce: { value: 0 },
        uRadius: { value: 1 },
        uSize: { value: compact ? 1.7 : 2.5 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
    });
    const points = new Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);

    // Layout: fit the words and globe to the current viewport.
    let visibleHeight = 1;
    const layout = () => {
      const width = host.clientWidth || window.innerWidth;
      const height = host.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      visibleHeight = 2 * Math.tan(MathUtils.degToRad(FOV / 2)) * CAMERA_Z;
      const visibleWidth = visibleHeight * camera.aspect;
      const portrait = camera.aspect < 1;
      const centerY = visibleHeight * (portrait ? 0.08 : 0.05);
      const maxW = visibleWidth * (portrait ? 0.84 : 0.72);
      const maxH = visibleHeight * (portrait ? 0.2 : 0.34);
      const family = displayFont();
      const [first, second] = hero.words;

      sampleWord(first, family, count, maxW, maxH, centerY, wordA);
      sampleWord(second, family, count, maxW, maxH, centerY, wordB);
      sampleGlobe(count, Math.min(visibleHeight * 0.24, visibleWidth * 0.28), globe);
      wordAAttr.needsUpdate = true;
      globeAttr.needsUpdate = true;
      wordBAttr.needsUpdate = true;

      material.uniforms.uCenterY.value = centerY;
      material.uniforms.uRadius.value = visibleHeight * 0.12;
      material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
    };

    // Pointer → world position on the z = 0 plane.
    const pointer = { x: 0, y: 0, active: false };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = host.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };
    if (finePointer) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.addEventListener("mouseleave", onPointerLeave);
    }
    const ray = new Vector3();
    const mouseWorld = new Vector3(99, 99, 0);

    const readProgress = () => {
      const rect = section.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      return scrollable > 0 ? clamp01(-rect.top / scrollable) : 0;
    };

    let elapsed = 0;
    let introStart = -1;
    let progress = readProgress();
    let stage = -1;
    let shown = false;

    const update = (dt: number) => {
      elapsed += dt;
      if (introStart < 0) introStart = elapsed;
      const intro = clamp01((elapsed - introStart) / 2.8);

      const target = readProgress();
      progress += (target - progress) * (1 - Math.exp(-dt * 6));

      const uniforms = material.uniforms;
      uniforms.uTime.value = elapsed;
      uniforms.uIntro.value = intro;
      uniforms.uMorphA.value = remap(progress, 0.1, 0.42);
      uniforms.uMorphB.value = remap(progress, 0.56, 0.88);
      uniforms.uSpin.value = elapsed * 0.22 + progress * 4;

      // Gentle camera parallax.
      const px = pointer.active ? pointer.x : Math.sin(elapsed * 0.25) * 0.3;
      const py = pointer.active ? pointer.y : Math.cos(elapsed * 0.2) * 0.2;
      camera.position.x += (px * 0.35 - camera.position.x) * Math.min(1, dt * 2.5);
      camera.position.y += (py * 0.22 - camera.position.y) * Math.min(1, dt * 2.5);
      camera.lookAt(0, 0, 0);

      if (pointer.active) {
        ray.set(pointer.x, pointer.y, 0.5).unproject(camera).sub(camera.position).normalize();
        const t = -camera.position.z / ray.z;
        mouseWorld.copy(camera.position).addScaledVector(ray, t);
        uniforms.uMouse.value.lerp(mouseWorld, Math.min(1, dt * 10));
      }
      uniforms.uMouseForce.value += ((pointer.active ? 1 : 0) - uniforms.uMouseForce.value) * Math.min(1, dt * 4);

      // Drive the HTML overlay: progress bar and stage captions.
      section.style.setProperty("--hero-p", progress.toFixed(3));
      const nextStage = progress < 0.3 ? 0 : progress < 0.7 ? 1 : 2;
      if (nextStage !== stage) {
        stage = nextStage;
        section.dataset.stage = String(stage);
      }
    };

    let rafId = 0;
    let running = false;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      update(dt);
      renderer.render(scene, camera);
      if (!shown) {
        shown = true;
        canvas.dataset.ready = "true";
        section.dataset.webgl = "on";
      }
      rafId = window.requestAnimationFrame(frame);
    };
    const startLoop = () => {
      if (running || disposed) return;
      running = true;
      last = performance.now();
      rafId = window.requestAnimationFrame(frame);
    };
    const stopLoop = () => {
      running = false;
      window.cancelAnimationFrame(rafId);
    };

    let inView = true;
    const visibility = () => (inView && !document.hidden ? startLoop() : stopLoop());
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? true;
      visibility();
    });
    observer.observe(section);
    document.addEventListener("visibilitychange", visibility);

    let resizeTimer = 0;
    const resizeObserver = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(layout, 150);
    });

    const onContextLost = (event: Event) => {
      event.preventDefault();
      stopLoop();
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    // Wait for the display font so the words are sampled in the right typeface.
    const family = displayFont();
    Promise.race([
      document.fonts.load(`700 120px ${family}`).catch(() => undefined),
      new Promise((resolve) => window.setTimeout(resolve, 1500)),
    ]).then(() => {
      if (disposed) return;
      layout();
      resizeObserver.observe(host);
      visibility();
    });

    return () => {
      disposed = true;
      stopLoop();
      window.clearTimeout(resizeTimer);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseleave", onPointerLeave);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      delete section.dataset.webgl;
    };
  }, []);

  return <div ref={hostRef} className="hero-gl" aria-hidden="true" />;
}
