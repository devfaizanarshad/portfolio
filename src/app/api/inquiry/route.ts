import {
  HONEYPOT_FIELD,
  inquirySubject,
  inquiryText,
  validateInquiry,
  type InquiryInput,
} from "@/lib/inquiry";

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;
const DELIVERY_TIMEOUT_MS = 8000;

/** Best-effort, per-instance limiter; enough to blunt casual form spam. */
const recentSubmissions = new Map<string, number[]>();

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "anonymous";
}

function isRateLimited(key: string, now: number): boolean {
  const recent = (recentSubmissions.get(key) ?? []).filter((time) => now - time < RATE_WINDOW_MS);
  const limited = recent.length >= RATE_LIMIT;
  if (!limited) recent.push(now);
  recentSubmissions.set(key, recent);

  if (recentSubmissions.size > 5000) {
    const oldest = recentSubmissions.keys().next().value;
    if (oldest !== undefined) recentSubmissions.delete(oldest);
  }
  return limited;
}

function filledHoneypot(payload: unknown): boolean {
  if (typeof payload !== "object" || payload === null) return false;
  const value = (payload as Record<string, unknown>)[HONEYPOT_FIELD];
  return typeof value === "string" && value.trim() !== "";
}

async function sendEmail(apiKey: string, inquiry: InquiryInput): Promise<void> {
  const to = process.env.INQUIRY_TO_EMAIL || "devfaizanarshad@gmail.com";
  const from = process.env.INQUIRY_FROM_EMAIL || "Portfolio Inquiries <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: inquiry.email,
      subject: inquirySubject(inquiry),
      text: inquiryText(inquiry),
    }),
    signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
  });

  if (!response.ok) throw new Error(`Resend responded with ${response.status}`);
}

async function postWebhook(url: string, inquiry: InquiryInput): Promise<void> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const secret = process.env.INQUIRY_WEBHOOK_SECRET;
  if (secret) headers["X-Webhook-Secret"] = secret;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ ...inquiry, source: "portfolio", submittedAt: new Date().toISOString() }),
    signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
  });

  if (!response.ok) throw new Error(`Webhook responded with ${response.status}`);
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Bots fill the hidden field. Report success so they move on.
  if (filledHoneypot(payload)) return Response.json({ ok: true });

  const result = validateInquiry(payload);
  if (!result.ok) {
    return Response.json({ ok: false, error: "invalid", fields: result.errors }, { status: 400 });
  }

  if (isRateLimited(clientKey(request), Date.now())) {
    return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const webhookUrl = process.env.INQUIRY_WEBHOOK_URL;
  if (!apiKey && !webhookUrl) {
    return Response.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const deliveries: Promise<void>[] = [];
  if (apiKey) deliveries.push(sendEmail(apiKey, result.data));
  if (webhookUrl) deliveries.push(postWebhook(webhookUrl, result.data));

  const outcomes = await Promise.allSettled(deliveries);
  if (outcomes.some((outcome) => outcome.status === "fulfilled")) {
    return Response.json({ ok: true });
  }

  console.error(
    "[inquiry] delivery failed:",
    outcomes.map((outcome) => (outcome.status === "rejected" ? String(outcome.reason) : "ok")),
  );
  return Response.json({ ok: false, error: "delivery_failed" }, { status: 502 });
}
