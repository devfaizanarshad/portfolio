/** Shared by the inquiry form (client) and /api/inquiry (server). */

export const PROJECT_TYPES = [
  "Website or web app",
  "Hosting & setup",
  "Data or maps",
  "Ongoing support",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export interface InquiryInput {
  name: string;
  email: string;
  projectType: ProjectType;
  brief: string;
}

export type InquiryField = keyof InquiryInput;
export type InquiryErrors = Partial<Record<InquiryField, string>>;

export type InquiryValidation =
  | { ok: true; data: InquiryInput }
  | { ok: false; errors: InquiryErrors };

export const INQUIRY_LIMITS = {
  nameMax: 120,
  emailMax: 254,
  briefMin: 10,
  briefMax: 4000,
} as const;

/** Name of the hidden field bots tend to fill in. */
export const HONEYPOT_FIELD = "company_website";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function readString(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  return typeof value === "string" ? value.trim() : "";
}

function isProjectType(value: string): value is ProjectType {
  return (PROJECT_TYPES as readonly string[]).includes(value);
}

export function validateInquiry(raw: unknown): InquiryValidation {
  const source = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  const name = readString(source, "name").replace(/\s+/g, " ");
  const email = readString(source, "email");
  const projectType = readString(source, "projectType");
  const brief = readString(source, "brief");
  const errors: InquiryErrors = {};

  if (name.length < 2) {
    errors.name = "Please enter your name.";
  } else if (name.length > INQUIRY_LIMITS.nameMax) {
    errors.name = `Please keep your name under ${INQUIRY_LIMITS.nameMax} characters.`;
  }

  if (email.length > INQUIRY_LIMITS.emailMax || !EMAIL_PATTERN.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!isProjectType(projectType)) {
    errors.projectType = "Please choose an option.";
  }

  if (brief.length < INQUIRY_LIMITS.briefMin) {
    errors.brief = `Please add a few words — at least ${INQUIRY_LIMITS.briefMin} characters.`;
  } else if (brief.length > INQUIRY_LIMITS.briefMax) {
    errors.brief = `Please keep the brief under ${INQUIRY_LIMITS.briefMax} characters.`;
  }

  if (!isProjectType(projectType) || Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data: { name, email, projectType, brief } };
}

export function inquirySubject(input: Pick<InquiryInput, "name" | "projectType">): string {
  return `Project inquiry — ${input.projectType} — ${input.name}`;
}

export function inquiryText(input: InquiryInput): string {
  return [
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Project type: ${input.projectType}`,
    "",
    "Project brief:",
    input.brief,
  ].join("\n");
}

/** Used when server-side delivery is not configured. */
export function inquiryMailto(to: string, input: InquiryInput): string {
  const subject = encodeURIComponent(inquirySubject(input));
  const body = encodeURIComponent(inquiryText(input));
  return `mailto:${to}?subject=${subject}&body=${body}`;
}
