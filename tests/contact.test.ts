import { describe, expect, it, vi } from "vitest";
import {
  FAILURE_PATH,
  RESEND_ENDPOINT,
  SUCCESS_PATH,
  TURNSTILE_ENDPOINT,
  buildEmail,
  handleContact,
  validateSubmission,
  type ContactEnv,
} from "../src/lib/contact";

const env: ContactEnv = {
  RESEND_API_KEY: "re_test",
  CONTACT_TO_EMAIL: "clinic@example.com",
  CONTACT_FROM_EMAIL: "web@example.com",
};

const validFields = {
  name: "Marcos Galán",
  email: "marcos@example.com",
  phone: "600 000 000",
  pet: "Perro",
  message: "Quiero pedir cita para vacunar a mi perro.",
  consent: "on",
};

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

function request(fields: Record<string, string>, opts: { json?: boolean; method?: string } = {}) {
  return new Request("https://example.com/api/contact", {
    method: opts.method ?? "POST",
    body: opts.method === "GET" ? undefined : formData(fields),
    headers: opts.json ? { Accept: "application/json" } : {},
  });
}

/** fetch stub that records calls and answers Resend/Turnstile with the given status. */
function fakeFetch(overrides: Partial<Record<string, Response>> = {}) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const impl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });
    if (overrides[url]) return overrides[url]!;
    if (url === RESEND_ENDPOINT) return Response.json({ id: "email_1" }, { status: 200 });
    if (url === TURNSTILE_ENDPOINT) return Response.json({ success: true });
    return new Response("not found", { status: 404 });
  });
  return { impl: impl as unknown as typeof fetch, calls };
}

describe("validateSubmission", () => {
  it("accepts a valid submission and trims whitespace", () => {
    const result = validateSubmission(formData({ ...validFields, name: "  Marcos  " }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.name).toBe("Marcos");
  });

  it("reports every invalid field at once", () => {
    const result = validateSubmission(formData({ name: "M", email: "nope", message: "hi" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(["consent", "email", "message", "name"]);
    }
  });

  it("rejects over-long optional fields", () => {
    const result = validateSubmission(formData({ ...validFields, phone: "1".repeat(31) }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.phone).toBeDefined();
  });
});

describe("buildEmail", () => {
  it("sends to the clinic with the visitor as reply-to", () => {
    const email = buildEmail(
      { name: "Ana", email: "ana@example.com", phone: "", pet: "", message: "Hola" },
      env,
    );
    expect(email.to).toEqual(["clinic@example.com"]);
    expect(email.from).toContain("web@example.com");
    expect(email.reply_to).toBe("ana@example.com");
    expect(email.subject).toContain("Ana");
    expect(email.text).toContain("Teléfono: —");
  });
});

describe("handleContact", () => {
  it("sends the email and returns JSON ok for fetch clients", async () => {
    const { impl, calls } = fakeFetch();
    const res = await handleContact(request(validFields, { json: true }), env, impl);

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(RESEND_ENDPOINT);
    expect(calls[0].init?.headers).toMatchObject({ Authorization: "Bearer re_test" });
    const payload = JSON.parse(String(calls[0].init?.body));
    expect(payload.reply_to).toBe(validFields.email);
  });

  it("redirects to the thank-you page for no-JS clients", async () => {
    const { impl } = fakeFetch();
    const res = await handleContact(request(validFields), env, impl);
    expect(res.status).toBe(303);
    expect(res.headers.get("Location")).toBe(SUCCESS_PATH);
  });

  it("returns 422 with field errors when validation fails", async () => {
    const { impl, calls } = fakeFetch();
    const res = await handleContact(
      request({ ...validFields, email: "broken" }, { json: true }),
      env,
      impl,
    );
    expect(res.status).toBe(422);
    const body = (await res.json()) as { ok: boolean; errors: Record<string, string> };
    expect(body.ok).toBe(false);
    expect(body.errors.email).toBeDefined();
    expect(calls).toHaveLength(0);
  });

  it("redirects back to the form on validation failure without JS", async () => {
    const { impl } = fakeFetch();
    const res = await handleContact(request({ ...validFields, name: "" }), env, impl);
    expect(res.status).toBe(303);
    expect(res.headers.get("Location")).toBe(FAILURE_PATH);
  });

  it("silently drops submissions that trip the honeypot", async () => {
    const { impl, calls } = fakeFetch();
    const res = await handleContact(
      request({ ...validFields, website: "http://spam.example" }, { json: true }),
      env,
      impl,
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(calls).toHaveLength(0);
  });

  it("verifies Turnstile when a secret is configured", async () => {
    const { impl, calls } = fakeFetch();
    const withCaptcha = { ...env, TURNSTILE_SECRET_KEY: "secret" };
    const res = await handleContact(
      request({ ...validFields, "cf-turnstile-response": "token" }, { json: true }),
      withCaptcha,
      impl,
    );
    expect(res.status).toBe(200);
    expect(calls.map((c) => c.url)).toEqual([TURNSTILE_ENDPOINT, RESEND_ENDPOINT]);
  });

  it("rejects with 403 when Turnstile fails or the token is missing", async () => {
    const { impl, calls } = fakeFetch({
      [TURNSTILE_ENDPOINT]: Response.json({ success: false }),
    });
    const withCaptcha = { ...env, TURNSTILE_SECRET_KEY: "secret" };

    const missing = await handleContact(request(validFields, { json: true }), withCaptcha, impl);
    expect(missing.status).toBe(403);

    const failed = await handleContact(
      request({ ...validFields, "cf-turnstile-response": "bad" }, { json: true }),
      withCaptcha,
      impl,
    );
    expect(failed.status).toBe(403);
    expect(calls.filter((c) => c.url === RESEND_ENDPOINT)).toHaveLength(0);
  });

  it("returns 502 when the email provider fails", async () => {
    const { impl } = fakeFetch({
      [RESEND_ENDPOINT]: new Response("boom", { status: 500 }),
    });
    const res = await handleContact(request(validFields, { json: true }), env, impl);
    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({ ok: false, error: "send_failed" });
  });

  it("returns 500 when the function is not configured", async () => {
    const { impl, calls } = fakeFetch();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await handleContact(
      request(validFields, { json: true }),
      { ...env, RESEND_API_KEY: "" },
      impl,
    );
    expect(res.status).toBe(500);
    expect(calls).toHaveLength(0);
    spy.mockRestore();
  });

  it("only accepts POST", async () => {
    const res = await handleContact(request({}, { method: "GET" }), env, fakeFetch().impl);
    expect(res.status).toBe(405);
  });
});
