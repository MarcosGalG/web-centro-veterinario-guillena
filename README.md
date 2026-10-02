# Centro Veterinario Guillena — website

Public website for [Centro Veterinario Guillena](https://centroveterinarioguillena.com), a veterinary clinic in Guillena (Seville, Spain), open since 2006.

Static site built with [Astro](https://astro.build), deployed on Cloudflare Pages, with a serverless contact form. No frameworks on the client, no cookies, no tracking.

> Site content is in Spanish (the clinic's clients are local). Code, commits and docs are in English.

## Highlights

- **Fast and free to run.** Fully static HTML/CSS; served from Cloudflare's CDN with no server to maintain and no cold starts. Only the contact form runs server-side, as a Pages Function.
- **Local SEO built in.** `schema.org/VeterinaryCare` structured data with opening hours, geo and phone; per-page meta and Open Graph tags; sitemap; canonical URLs.
- **Single source of truth for clinic data.** Address, phones, hours and social links live in [`src/data/clinic.ts`](src/data/clinic.ts) and feed every page, the footer, the structured data and the live "open now" badge.
- **Contact form done properly.** Server-side validation, honeypot, optional Cloudflare Turnstile, email via Resend, works without JavaScript (redirect flow) and with it (inline feedback). Logic is framework-agnostic and unit tested.
- **Privacy by default.** Google Maps only loads after the visitor clicks, so the site sets no third-party cookies and needs no cookie banner. Legal notice and privacy policy pages included (Spanish LSSI-CE / GDPR).
- **Accessible.** Semantic HTML, skip link, keyboard-friendly mobile nav, visible focus styles, reduced-motion support, AA colour contrast.

## Stack

| Layer          | Choice                                                    |
| -------------- | --------------------------------------------------------- |
| Site generator | Astro 7 (static output)                                   |
| Styling        | Hand-written CSS with design tokens, no framework         |
| Fonts          | Fraunces + Inter, self-hosted via `@fontsource`           |
| Icons          | Lucide (`@lucide/astro`) and Simple Icons for brand logos |
| Form backend   | Cloudflare Pages Function → Resend API                    |
| Anti-spam      | Honeypot + optional Cloudflare Turnstile                  |
| Tests          | Vitest                                                    |
| CI             | GitHub Actions: format check, type check, tests, build    |

## Project layout

```
├── functions/api/contact.ts   Cloudflare Pages Function (POST /api/contact)
├── public/                    Static files copied as-is (favicons, robots.txt, OG image)
├── src/
│   ├── assets/                Images processed by Astro (optimised to WebP at build)
│   ├── components/            Header, Footer, ContactForm, OpeningHours, MapEmbed…
│   ├── data/                  clinic.ts · services.ts · team.ts · legal.ts
│   ├── layouts/BaseLayout.astro   <head>, SEO tags, JSON-LD, shared chrome
│   ├── lib/contact.ts         Form validation + email sending (pure, testable)
│   ├── pages/                 One file per route
│   └── styles/global.css      Design tokens and base styles
├── tests/                     Unit tests
└── docs/                      Deployment guide, content editing guide, photo checklist
```

## Getting started

Requirements: Node.js 22.12+ (see `.node-version`).

```bash
npm install
npm run dev        # http://localhost:4321
```

Other scripts:

```bash
npm run build      # production build into dist/
npm run preview    # serve dist/ locally
npm run check      # Astro + TypeScript type check
npm test           # unit tests
npm run lint       # prettier --check
npm run format     # prettier --write
```

### Testing the contact form locally

`astro dev` serves the pages but not the Pages Function. To run the full stack locally:

```bash
cp .env.example .dev.vars   # then fill in real values
npm run build
npx wrangler pages dev dist
```

The site is then available at `http://localhost:8788` with `/api/contact` working.

## Deployment

See [docs/deployment.md](docs/deployment.md) for the step-by-step guide (Cloudflare Pages, Resend, domain, Google Business Profile).

## Editing content

Everything a clinic owner would want to change (hours, phones, services, team) lives in `src/data/`. See [docs/editing-content.md](docs/editing-content.md).

## License

Source code: MIT. Clinic name, logo, photos and texts belong to Centro Veterinario Guillena and may not be reused.
