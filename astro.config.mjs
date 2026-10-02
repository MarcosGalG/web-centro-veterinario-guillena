// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // Canonical production URL. Used for the sitemap, canonical links and Open Graph tags.
  site: "https://centroveterinarioguillena.com",
  output: "static",
  trailingSlash: "always",
  // Astro 7 strips whitespace between inline elements with JSX rules by default;
  // `true` keeps standard HTML whitespace semantics so "<b>a</b> <i>b</i>" stays readable.
  compressHTML: true,
  integrations: [
    sitemap({
      // Legal pages and the form "thank you" page add nothing to search results.
      filter: (page) => !/\/(gracias|aviso-legal|privacidad)\/$/.test(page),
    }),
  ],
});
