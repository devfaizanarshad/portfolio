# Faizan Arshad — Portfolio

Portfolio for Faizan Arshad, Full-Stack Engineer & System Architect. Built to be shared at the end of webinars and turn visitors into project inquiries quickly.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Three.js · GSAP + ScrollTrigger · Lenis · lucide-react

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build      # production build (also type-checks)
npm run start      # serve the production build
npm run typecheck  # TypeScript only
```

## Editing content

All copy (hero, stats, JudgesDesk case study, projects, stack, contact notes) lives in [`src/lib/content.ts`](src/lib/content.ts). Edit the text there; components only handle layout and motion.

## Project inquiries

The form posts to `/api/inquiry`, which validates the brief, rejects bot submissions (hidden honeypot field), rate-limits repeat senders, and delivers it through whichever channel is configured:

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Send each inquiry as an email via [Resend](https://resend.com). |
| `INQUIRY_TO_EMAIL` | Recipient (defaults to `devfaizanarshad@gmail.com`). |
| `INQUIRY_FROM_EMAIL` | Sender on a domain verified in Resend. |
| `INQUIRY_WEBHOOK_URL` | POST each inquiry as JSON to a webhook (n8n, Make, Zapier…). |
| `INQUIRY_WEBHOOK_SECRET` | Optional; sent as the `X-Webhook-Secret` header. |
| `NEXT_PUBLIC_SITE_URL` | Public URL used for canonical and Open Graph links. |

Copy `.env.example` to `.env.local` and fill in at least one delivery channel. If none is configured, the form still works: it opens the visitor's email app with the brief pre-filled, so no lead is lost.

## Deployment

Deploy to any Node.js host; Vercel works with zero configuration. The inquiry endpoint runs server-side, so a static export (`output: "export"`) is not supported. Set the environment variables above in your hosting dashboard.

## Structure

```
src/
  app/
    layout.tsx            fonts, metadata, cursor spotlight, grain
    page.tsx              section order
    globals.css           design tokens, components, keyframes
    api/inquiry/route.ts  form delivery (Resend / webhook)
    opengraph-image.tsx   generated social preview image
  components/
    HeroCanvas.tsx        Three.js core, orbiting nodes, particle field
    MagneticCursor.tsx    pointer spotlight + [data-magnetic] snapping
    ScrollChoreography.tsx Lenis + ScrollTrigger reveals, counters, anchors
    JudgesDeskSpotlight.tsx / ArchitectureDiagram.tsx
    ProjectCard.tsx       3D tilt + border highlight shell
    ContactSection.tsx / InquiryForm.tsx / CopyEmailButton.tsx
  lib/
    content.ts            all site copy
    inquiry.ts            shared validation for form and API
```

## Behaviour notes

- **Motion:** honours `prefers-reduced-motion` (no smooth scrolling, reveals, tilt or magnetic pull; static 3D frame).
- **Touch devices:** the cursor spotlight, magnetic snapping and card tilt are disabled.
- **Performance:** Three.js loads only on the client, renders only while the hero is on screen, and disposes of everything on unmount.
- **No WebGL:** the hero falls back to its CSS grid and glow.
