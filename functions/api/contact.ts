/**
 * Cloudflare Pages Function: POST /api/contact
 *
 * Receives the contact form, validates it and emails the clinic through Resend.
 * All logic lives in src/lib/contact.ts; this file only adapts it to the
 * Pages Functions runtime. Environment variables are set in the Cloudflare
 * dashboard (Pages > Settings > Environment variables) or in `.dev.vars` locally.
 *
 * The context is typed here rather than pulled from `@cloudflare/workers-types`:
 * those types declare globals that clash with the DOM ones the rest of the site
 * relies on, and the runtime only cares about the exported handler names.
 */
import { handleContact, type ContactEnv } from "../../src/lib/contact";

interface PagesContext<Env> {
  request: Request;
  env: Env;
}

export const onRequestPost = ({ request, env }: PagesContext<ContactEnv>): Promise<Response> =>
  handleContact(request, env);

export const onRequest = (): Response =>
  new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
