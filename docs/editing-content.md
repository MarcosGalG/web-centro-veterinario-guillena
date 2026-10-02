# Editing content

All clinic-specific content lives in `src/data/`. Change a value there, push to `main`, and Cloudflare rebuilds the site in about a minute.

| What                                     | File                   |
| ---------------------------------------- | ---------------------- |
| Opening hours, phones, address, socials  | `src/data/clinic.ts`   |
| Services (titles, descriptions, bullets) | `src/data/services.ts` |
| Team members                             | `src/data/team.ts`     |
| Legal owner details (NIF, dates)         | `src/data/legal.ts`    |
| Page copy (headlines, paragraphs)        | `src/pages/*.astro`    |
| Images                                   | `src/assets/`          |

## Opening hours

```ts
hours: {
  mon: [
    { open: "09:30", close: "13:00" },
    { open: "17:30", close: "20:30" },
  ],
  sat: [{ open: "10:30", close: "13:30" }],
  sun: [],   // empty array = closed
}
```

Times are 24h `"HH:MM"` in Madrid time. Consecutive days with identical hours are grouped automatically ("Lunes – Viernes"). The "Abierto ahora" badge, the footer, the contact page and the structured data Google reads all update from this one place.

**Holidays or a temporary closure:** there is no special field yet; the simplest option is to edit the affected day(s) and revert afterwards.

## Services

Each entry in `services.ts`:

```ts
{
  slug: "cirugia",               // URL anchor: /servicios/#cirugia — don't change once live
  title: "Cirugía y hospitalización",
  summary: "One sentence for the card on the home page.",
  description: "A short paragraph for the services page.",
  items: ["Bullet", "Bullet", "Bullet"],
  icon: "scissors",              // one of the names in IconName (services.ts)
  featured: true,                // show on the home page
}
```

To add an icon not in the list: import it in `src/components/ServiceIcon.astro` (any icon from [lucide.dev](https://lucide.dev/icons)) and add its name to `IconName`.

## Team

```ts
import anaPhoto from "../assets/team/ana.jpg";

{
  name: "Ana García",
  role: "Auxiliar técnico veterinario",
  bio: "Two or three sentences.",
  photo: anaPhoto,     // optional; initials are shown when missing
}
```

Photos: portrait orientation, at least 800×1000 px, JPG. Astro resizes and converts them at build time.

## Images

- `src/assets/hero-placeholder.jpg` — home page hero. Replace with a real photo and keep the filename, or update the import in `src/pages/index.astro`.
- `src/assets/fachada.jpg` — storefront photo in the "Conócenos" section.
- `public/og-image.jpg` — 1200×630 image shown when the link is shared on WhatsApp/Facebook. Regenerate if the logo or tagline changes.

See [photos.md](photos.md) for the full wish list.

## Legal texts

`src/pages/aviso-legal.astro` and `src/pages/privacidad.astro` pull the owner details from `src/data/legal.ts`. Update `lastUpdated` whenever you change the texts.
