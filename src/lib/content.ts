/**
 * Every word on the page lives here, so copy can be edited without touching
 * layout or animation code.
 */

export const site = {
  name: "Faizan Arshad",
  initials: "FA",
  role: "Full-Stack Developer",
  email: "devfaizanarshad@gmail.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://faizanarshad.com",
  github: "https://github.com/devfaizanarshad",
  linkedin: "https://www.linkedin.com/in/devfaizanarshad/",
  description:
    "Full-stack developer building websites, web apps and online tools for founders and organizations — from first idea to launch and beyond.",
} as const;

export const navLinks = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#services", label: "Services" },
  { href: "#contact", label: "Contact" },
] as const;

export const hero = {
  /** Shown as text before the particles take over, and read by screen readers. */
  title: "From idea to launch.",
  /** The two words the particles spell (keep them short: 4–6 letters). */
  words: ["IDEA", "LAUNCH"],
  stages: [
    { label: "Idea", caption: "It all starts with your idea." },
    { label: "Build", caption: "I design and build it: websites, apps, cloud." },
    { label: "Launch", caption: "Then launch it to real users, and keep it running." },
  ],
} as const;

export const stats = [
  { label: "Years of experience", value: 4, decimals: 0, suffix: "+" },
  { label: "Lower running costs", value: 90, decimals: 0, suffix: "%" },
  { label: "Uptime on live products", value: 99.9, decimals: 1, suffix: "%" },
] as const;

export interface Project {
  id: string;
  title: string;
  category: string;
  /** Short highlight shown as a badge. */
  badge: string;
  summary: string;
  image: string;
  imageAlt: string;
  /** Grid placement in the 12-column layout (websites only). */
  layout?: string;
  href?: string;
  /** Link label, defaults to "Visit site". */
  cta?: string;
  /** Natural image size, needed for phone screenshots. */
  size?: [number, number];
}

/** Websites and web apps. */
export const projects: Project[] = [
  {
    id: "judgesdesk",
    title: "JudgesDesk",
    category: "Tracking platform for dog-show judges",
    badge: "Built for AKC leadership",
    summary: "Replaced messy spreadsheets with one simple system for judge records, education credits and certificates.",
    image: "/projects/judges-desk.png",
    imageAlt: "JudgesDesk dashboard showing a judge profile",
    layout: "md:col-span-2 lg:col-span-7",
  },
  {
    id: "brandeduk",
    title: "BrandedUK",
    category: "Online shop",
    badge: "Live store",
    summary: "A branded-products shop with automatic product updates and secure online payments.",
    image: "/projects/brandeduk-homepage.png",
    imageAlt: "BrandedUK online shop homepage",
    layout: "lg:col-span-5",
    href: "https://www.brandeduk.com/",
  },
  {
    id: "chargerzilla",
    title: "Chargerzilla",
    category: "EV charging marketplace",
    badge: "75+ networks",
    summary: "Helps drivers find, compare and reserve charging points in one place.",
    image: "/projects/chargerzilla.png",
    imageAlt: "Chargerzilla EV charging website",
    layout: "lg:col-span-4",
    href: "https://chargerzilla.com",
  },
  {
    id: "househub365",
    title: "HouseHub365",
    category: "Home maintenance app",
    badge: "Web app",
    summary: "Helps homeowners track repairs, reminders and contractors in one place.",
    image: "/projects/househub.png",
    imageAlt: "HouseHub365 dashboard with maintenance calendar",
    layout: "lg:col-span-4",
    href: "https://househub365.com",
  },
  {
    id: "droppr",
    title: "DropPR.ai",
    category: "AI content tool",
    badge: "AI tool",
    summary: "Turns raw video or audio into polished, search-ready content.",
    image: "/projects/droppr.png",
    imageAlt: "DropPR.ai website",
    layout: "lg:col-span-4",
    href: "https://droppr.ai",
  },
  {
    id: "benmaps",
    title: "BenMaps",
    category: "Interactive maps",
    badge: "Alerts in 5 min, not 2 hrs",
    summary: "Makes complex location data fast and easy to explore, with about 90% lower running costs.",
    image: "/projects/openstreetmap.png",
    imageAlt: "Interactive map showing roads and a location marker",
    layout: "lg:col-span-4",
    href: "https://benmaps.fr",
  },
  {
    id: "carbon-verified",
    title: "Carbon Verified",
    category: "Sustainability website",
    badge: "Website",
    summary: "Helps organizations measure and reduce their digital footprint.",
    image: "/projects/carbon-verified.png",
    imageAlt: "Carbon Verified website",
    layout: "lg:col-span-4",
    href: "https://carbonverified.org",
  },
  {
    id: "trafikbilder",
    title: "TrafikBilder",
    category: "Photo library",
    badge: "Subscriptions",
    summary: "A specialist photo library that is easy to search and sells by subscription.",
    image: "/projects/trafikbilder.png",
    imageAlt: "TrafikBilder media library login page",
    layout: "lg:col-span-4",
    href: "https://trafikbilder.se/auth/login",
  },
  {
    id: "scholarai",
    title: "ScholarAI",
    category: "Research search",
    badge: "AI search",
    summary: "Helps researchers find and understand academic papers faster.",
    image: "/projects/scholar-ai.png",
    imageAlt: "ScholarAI academic search website",
    layout: "md:col-span-2 lg:col-span-7",
    href: "https://kfocus-academic-search.vercel.app/",
  },
  {
    id: "seohub",
    title: "SEOHub",
    category: "Marketing tools",
    badge: "Automation",
    summary: "Speeds up campaign research and the creation of location pages.",
    image: "/projects/seo-hub.png",
    imageAlt: "SEOHub automation dashboard",
    layout: "lg:col-span-5",
    href: "https://tools.digitalsearchgroup.com/",
  },
  {
    id: "medazon",
    title: "Medazon Health",
    category: "Telehealth platform",
    badge: "Healthcare",
    summary: "Helps patients get care faster and lets doctors arrive prepared.",
    image: "/projects/medazon-health.png",
    imageAlt: "Medazon Health patient panel",
    layout: "lg:col-span-5",
    href: "https://patient-panel-vercel.vercel.app/",
  },
  {
    id: "transport-teori-cms",
    title: "Transport Teori CMS",
    category: "Learning content system",
    badge: "10+ languages",
    summary: "Manages driving-theory lessons and questions in more than ten languages.",
    image: "/projects/transport-teori-cms.png",
    imageAlt: "Transport Teori content management dashboard",
    layout: "md:col-span-2 lg:col-span-7",
    href: "https://transportteori.com",
  },
];

/** Phone apps, shown as screenshots on a phone-style card. */
export const mobileApps: Project[] = [
  {
    id: "attendy",
    title: "Attendy",
    category: "Attendance app",
    badge: "Mobile app",
    summary: "Faster attendance with identity and location checks.",
    image: "/projects/attendy.png",
    imageAlt: "Attendy mobile app screen",
    size: [560, 990],
    href: "https://play.google.com/store/apps/details?id=com.attendy.app",
    cta: "View app",
  },
  {
    id: "doctok",
    title: "DocTok",
    category: "Doctor consultations",
    badge: "Mobile app",
    summary: "Connects patients with doctors without long waits.",
    image: "/projects/doctok.jpg",
    imageAlt: "DocTok mobile app screen",
    size: [662, 1280],
    href: "https://play.google.com/store/apps/details?id=com.doctok.app",
    cta: "View app",
  },
  {
    id: "healthwire",
    title: "Healthwire",
    category: "Everyday healthcare",
    badge: "Mobile app",
    summary: "Medicine delivery and doctor booking in one app.",
    image: "/projects/healthwire.jpg",
    imageAlt: "Healthwire mobile app screen",
    size: [717, 1600],
    href: "https://apps.apple.com/app/healthwire",
    cta: "View app",
  },
  {
    id: "transport-teori-app",
    title: "TransportTeori App",
    category: "Driving theory practice",
    badge: "Mobile app",
    summary: "Makes driving-theory practice easier and more engaging.",
    image: "/projects/transport-teori-app.png",
    imageAlt: "TransportTeori mobile app screen",
    size: [313, 675],
    href: "https://transportteori.com",
    cta: "Visit site",
  },
];

export const about = {
  title: "Hi, I’m Faizan.",
  text: "I’m a full-stack developer who turns ideas into websites and apps that are simple to use and built to last. I work remotely with founders and teams around the world, and I stay with a project long after launch.",
  chips: [
    { value: "4+", label: "Years" },
    { value: "16", label: "Projects" },
    { value: "Global", label: "Clients" },
  ],
} as const;

export const services = [
  {
    title: "Websites & web apps",
    blurb: "Fast, good-looking sites and tools that your customers and team enjoy using.",
    items: ["Business websites", "Online stores", "Dashboards"],
  },
  {
    title: "Hosting & setup",
    blurb: "Reliable hosting, safe backups and smooth updates, so everything keeps running.",
    items: ["Cloud hosting", "Automatic backups", "Moving to a new host"],
  },
  {
    title: "Data, maps & payments",
    blurb: "Databases, live maps and online payments connected to the rest of your business.",
    items: ["Online payments", "Maps & locations", "Reports & records"],
  },
] as const;

export const contact = {
  headline: "Have a project in mind?",
  sub: "Tell me what you need and I’ll reply within one business day.",
  timezoneNote: "Remote · works with clients worldwide",
  replyNote: "Replies within one business day",
} as const;
