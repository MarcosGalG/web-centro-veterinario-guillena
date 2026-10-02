/**
 * Contact form handling, framework-agnostic so it can be unit tested.
 *
 * The Cloudflare Pages Function in `functions/api/contact.ts` is a thin wrapper
 * around `handleContact`. Everything here uses only Web standard APIs
 * (Request, Response, FormData, fetch), which run identically in Workers,
 * Node 18+ and the test runner.
 */

export interface ContactEnv {
  RESEND_API_KEY: string;
  CONTACT_TO_EMAIL: string;
  CONTACT_FROM_EMAIL: string;
  /** Optional. When set, submissions must carry a valid Turnstile token. */
  TURNSTILE_SECRET_KEY?: string;
}

export interface ContactSubmission {
  name: string;
  email: string;
  phone: string;
  pet: string;
  message: string;
}

export type ValidationErrors = Partial<Record<keyof ContactSubmission | "consent", string>>;

export type ValidationResult =
  { ok: true; data: ContactSubmission } | { ok: false; errors: ValidationErrors };

const LIMITS = {
  name: { min: 2, max: 80 },
  message: { min: 10, max: 2000 },
  phone: { max: 30 },
  pet: { max: 40 },
} as const;

// Deliberately permissive: the goal is to catch typos, not to enforce RFC 5322.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Path the browser is sent to after a successful no-JS submission. */
export const SUCCESS_PATH = "/gracias/";
/** Path (with error flag) for a failed no-JS submission. */
export const FAILURE_PATH = "/contacto/?error=1#formulario";

export const RESEND_ENDPOINT = "https://api.resend.com/emails";
export const TURNSTILE_ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

function text(value: FormDataEntryValue | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Validates raw form fields and returns a clean submission or per-field errors. */
export function validateSubmission(form: FormData): ValidationResult {
  const errors: ValidationErrors = {};

  const name = text(form.get("name"));
  const email = text(form.get("email"));
  const phone = text(form.get("phone"));
  const pet = text(form.get("pet"));
  const message = text(form.get("message"));
  const consent = form.get("consent");

  if (name.length < LIMITS.name.min || name.length > LIMITS.name.max) {
    errors.name = `Escribe tu nombre (entre ${LIMITS.name.min} y ${LIMITS.name.max} caracteres).`;
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    errors.email = "Revisa el correo electrónico, parece incorrecto.";
  }
  if (phone.length > LIMITS.phone.max) {
    errors.phone = "El teléfono es demasiado largo.";
  }
  if (pet.length > LIMITS.pet.max) {
    errors.pet = "Ese texto es demasiado largo.";
  }
  if (message.length < LIMITS.message.min || message.length > LIMITS.message.max) {
    errors.message = `Cuéntanos qué necesitas (entre ${LIMITS.message.min} y ${LIMITS.message.max} caracteres).`;
  }
  if (consent !== "on" && consent !== "true" && consent !== "1") {
    errors.consent = "Necesitamos tu consentimiento para responderte.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, data: { name, email, phone, pet, message } };
}

/** True when the hidden honeypot field was filled in, i.e. almost certainly a bot. */
export function isHoneypotTripped(form: FormData): boolean {
  return text(form.get("website")).length > 0;
}

export function buildEmail(data: ContactSubmission, env: ContactEnv) {
  const lines = [
    `Nombre: ${data.name}`,
    `Email: ${data.email}`,
    `Teléfono: ${data.phone || "—"}`,
    `Mascota: ${data.pet || "—"}`,
    "",
    "Mensaje:",
    data.message,
    "",
    "—",
    "Enviado desde el formulario de contacto de la web.",
  ];

  return {
    from: `Web Centro Veterinario Guillena <${env.CONTACT_FROM_EMAIL}>`,
    to: [env.CONTACT_TO_EMAIL],
    reply_to: data.email,
    subject: `Nueva consulta desde la web: ${data.name}`,
    text: lines.join("\n"),
  };
}

async function verifyTurnstile(
  token: string,
  secret: string,
  ip: string | null,
  fetchImpl: typeof fetch,
): Promise<boolean> {
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);

  const res = await fetchImpl(TURNSTILE_ENDPOINT, { method: "POST", body });
  if (!res.ok) return false;
  const json = (await res.json()) as { success?: boolean };
  return json.success === true;
}

async function sendViaResend(
  payload: ReturnType<typeof buildEmail>,
  apiKey: string,
  fetchImpl: typeof fetch,
): Promise<boolean> {
  const res = await fetchImpl(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return res.ok;
}

function wantsJson(request: Request): boolean {
  const accept = request.headers.get("accept") ?? "";
  return accept.includes("application/json");
}

function respond(
  request: Request,
  status: number,
  body: { ok: boolean; errors?: ValidationErrors; error?: string },
): Response {
  if (wantsJson(request)) {
    return Response.json(body, { status });
  }
  // Progressive enhancement: without JS the browser follows a redirect instead.
  const location = body.ok ? SUCCESS_PATH : FAILURE_PATH;
  return new Response(null, { status: 303, headers: { Location: location } });
}

/**
 * Handles a POST from the contact form.
 *
 * @param fetchImpl injectable for tests; defaults to the global fetch.
 */
export async function handleContact(
  request: Request,
  env: ContactEnv,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return respond(request, 400, { ok: false, error: "bad_request" });
  }

  // Bots that fill every field get a fake success so they don't retry.
  if (isHoneypotTripped(form)) {
    return respond(request, 200, { ok: true });
  }

  const result = validateSubmission(form);
  if (!result.ok) {
    return respond(request, 422, { ok: false, errors: result.errors });
  }

  if (env.TURNSTILE_SECRET_KEY) {
    const token = text(form.get("cf-turnstile-response"));
    const ip = request.headers.get("CF-Connecting-IP");
    const human = token && (await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, ip, fetchImpl));
    if (!human) {
      return respond(request, 403, { ok: false, error: "captcha" });
    }
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL || !env.CONTACT_FROM_EMAIL) {
    console.error("Contact form is not configured: missing RESEND/CONTACT env vars.");
    return respond(request, 500, { ok: false, error: "not_configured" });
  }

  const sent = await sendViaResend(buildEmail(result.data, env), env.RESEND_API_KEY, fetchImpl);
  if (!sent) {
    return respond(request, 502, { ok: false, error: "send_failed" });
  }

  return respond(request, 200, { ok: true });
}
