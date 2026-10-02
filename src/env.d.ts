/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Cloudflare Turnstile site key. Optional; enables the CAPTCHA widget when set. */
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
