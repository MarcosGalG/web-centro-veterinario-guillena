# Deployment guide

Target setup: **Cloudflare Pages** (hosting + contact form function) and **Resend** (email delivery). Both have free tiers that comfortably cover a clinic website. The only cost is the domain (~10 €/year).

## 1. Cloudflare Pages

1. Create a free account at [dash.cloudflare.com](https://dash.cloudflare.com).
2. **Workers & Pages → Create → Pages → Connect to Git** and pick the `web-centro-veterinario-guillena` repository.
3. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version is read from `.node-version` automatically.
4. Save and deploy. You get a `*.pages.dev` URL in a minute or two. Every push to `main` redeploys; every pull request gets its own preview URL.

The `functions/` directory is picked up automatically, so `/api/contact` works on the first deploy — it will just return `not_configured` until step 2 is done.

## 2. Resend (contact form email)

1. Create an account at [resend.com](https://resend.com) (free tier: 3,000 emails/month).
2. **Domains → Add domain** with the site domain (e.g. `centroveterinarioguillena.com`) and add the DNS records Resend shows you. If the domain is on Cloudflare, this is two clicks.
3. **API Keys → Create** with "Sending access" only. Copy it — it is shown once.
4. In Cloudflare: **Pages project → Settings → Environment variables → Production**, add:

   | Variable             | Value                                          |
   | -------------------- | ---------------------------------------------- |
   | `RESEND_API_KEY`     | the key from step 3 (mark as **Secret**)       |
   | `CONTACT_TO_EMAIL`   | the clinic's inbox, e.g. `packsev@hotmail.com` |
   | `CONTACT_FROM_EMAIL` | `web@centroveterinarioguillena.com`            |

5. Redeploy (Deployments → Retry) so the function picks up the variables.
6. Send a test message from `/contacto/` and check the inbox (and spam folder the first time).

## 3. Optional: Turnstile (anti-spam)

The honeypot already blocks naive bots. If spam still gets through:

1. Cloudflare dashboard → **Turnstile → Add site**, widget mode "Managed".
2. Add `PUBLIC_TURNSTILE_SITE_KEY` (site key) and `TURNSTILE_SECRET_KEY` (secret, mark as Secret) to the Pages environment variables.
3. Redeploy. The widget appears in the form and the function verifies each submission.

## 4. Custom domain

1. Buy `centroveterinarioguillena.com` (Cloudflare Registrar sells at cost, or any registrar).
2. If the domain is elsewhere, point its nameservers to Cloudflare (**Websites → Add a site**).
3. **Pages project → Custom domains → Set up a custom domain**. Add both `centroveterinarioguillena.com` and `www.centroveterinarioguillena.com`; Cloudflare configures DNS and HTTPS.
4. Make the `www` variant redirect to the apex: **Rules → Redirect Rules** (or a Bulk Redirect) from `www.centroveterinarioguillena.com/*` to `https://centroveterinarioguillena.com/$1`, 301.
5. If `site` in `astro.config.mjs` ever changes, update `public/robots.txt` too.

When the old `.es` domain becomes available, buy it and add a redirect rule to the `.com`.

## 5. Google Business Profile

Once the domain resolves:

1. Open the clinic's Google Business Profile (the panel that manages the Google Maps listing).
2. **Edit profile → Website** → paste `https://centroveterinarioguillena.com/`.
3. Check that the opening hours in Google match `src/data/clinic.ts`. The site's structured data uses the same hours, and consistency helps local ranking.
4. Optional: [Google Search Console](https://search.google.com/search-console) → add the domain → submit `https://centroveterinarioguillena.com/sitemap-index.xml`.

## 6. Before going live — checklist

- [ ] Replace `[NIF]` in `src/data/legal.ts`.
- [ ] Have Pablo read every service description in `src/data/services.ts` and correct anything the clinic does not actually offer (see [content-review.md](content-review.md)).
- [ ] Swap placeholder photos (see [photos.md](photos.md)).
- [ ] Confirm the email address that should receive form messages.
- [ ] Send a real test message through the form and reply to it (checks the `Reply-To` works).
- [ ] Open the site on a phone and tap every button: call, WhatsApp, directions.

## Alternatives considered

- **PythonAnywhere / Render free tier (Django, the v1 approach):** the process sleeps after inactivity and the first visitor waits 30–60 s. Unacceptable for a site people open from Google Maps on the street.
- **Netlify / Vercel:** equivalent to Cloudflare Pages for a static site; Cloudflare was chosen because the domain, DNS, hosting, functions and Turnstile live in one dashboard.
- **Formspree / Web3Forms for the form:** simpler, but free tiers cap submissions and the data flows through a third party. A 60-line function under our control costs nothing.
