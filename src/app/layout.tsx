import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { MagneticCursor } from "@/components/MagneticCursor";
import { site } from "@/lib/content";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const title = `${site.name} — ${site.role}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  keywords: [
    "Full-stack engineer",
    "System architect",
    "Next.js",
    "React",
    "Node.js",
    "PostgreSQL",
    "PostGIS",
    "AWS",
    "SaaS development",
    "JudgesDesk",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0c0e",
  colorScheme: "dark",
};

/**
 * Runs during HTML parsing, before first paint: marks the document as
 * JS-capable so scroll-reveal elements start hidden instead of flashing.
 * If the app has not taken over within 3.5s, everything is shown as-is.
 */
const revealBootstrap = `(function(){var d=document.documentElement;d.classList.add("js");window.__faRevealTimer=window.setTimeout(function(){d.classList.remove("js");window.__faRevealFallback=true;},3500);})();`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: revealBootstrap }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
        <MagneticCursor />
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
