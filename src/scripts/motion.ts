/**
 * Motion runtime: scroll reveals, word-by-word headlines, counters and
 * magnetic buttons. Kept deliberately small and dependency-free.
 *
 * Nothing here is required to read the site — if it never runs, the page is
 * fully visible and usable. `js-motion` on <html> is what opts elements into
 * their hidden starting state, so it is only added when this code is alive.
 */

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Splits a headline into per-word spans so each can rise out of its own box. */
function splitWords(el: HTMLElement): void {
  if (el.dataset.split === "done") return;
  const text = el.textContent ?? "";
  el.textContent = "";
  const frag = document.createDocumentFragment();

  text
    .trim()
    .split(/\s+/)
    .forEach((word, index) => {
      const outer = document.createElement("span");
      outer.className = "word";
      outer.style.setProperty("--word-index", String(index));
      const inner = document.createElement("span");
      inner.textContent = word;
      outer.append(inner);
      frag.append(outer, document.createTextNode(" "));
    });

  el.append(frag);
  el.dataset.split = "done";
}

/** Counts from 0 to the element's `data-count` value while it is on screen. */
function animateCount(el: HTMLElement): void {
  const target = Number(el.dataset.count ?? "0");
  const duration = Number(el.dataset.countDuration ?? "1400");
  if (!Number.isFinite(target)) return;
  if (reduced()) {
    el.textContent = String(target);
    return;
  }

  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min((now - start) / duration, 1);
    // easeOutExpo, so the number lands softly instead of stopping dead.
    const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    el.textContent = String(Math.round(target * eased));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/**
 * Drops the per-word clipping box once the last word has landed, so the
 * finished headline is rendered exactly as it would be without any animation.
 * Timed from the stagger and duration declared in motion.css.
 */
function releaseWordClipping(el: HTMLElement): void {
  const words = el.querySelectorAll(".word").length;
  const delay = parseFloat(getComputedStyle(el).getPropertyValue("--reveal-delay")) || 0;
  const total = 950 + Math.max(words - 1, 0) * 55 + delay + 100;
  window.setTimeout(() => el.classList.add("is-done"), total);
}

function setupReveals(root: ParentNode): void {
  const targets = root.querySelectorAll<HTMLElement>("[data-reveal], .reveal-words, [data-count]");
  if (!targets.length) return;

  if (reduced() || !("IntersectionObserver" in window)) {
    targets.forEach((el) => {
      el.classList.add("is-in", "is-done");
      if (el.dataset.count) el.textContent = el.dataset.count;
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.classList.add("is-in");
        if (el.dataset.count) animateCount(el);
        if (el.classList.contains("reveal-words")) releaseWordClipping(el);
        observer.unobserve(el);
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
  );

  targets.forEach((el) => {
    if (el.classList.contains("reveal-words")) splitWords(el);
    observer.observe(el);
  });
}

/** Buttons that lean a few pixels towards the pointer. Pointer devices only. */
function setupMagnets(root: ParentNode): void {
  if (reduced() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  root.querySelectorAll<HTMLElement>(".magnetic").forEach((el) => {
    const strength = Number(el.dataset.magnetStrength ?? "0.25");

    el.addEventListener("pointermove", (event) => {
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      el.style.setProperty("--mx", `${x * strength}px`);
      el.style.setProperty("--my", `${y * strength}px`);
    });

    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--mx", "0px");
      el.style.setProperty("--my", "0px");
    });
  });
}

/**
 * Pointer parallax: children of `[data-parallax]` shift by their own
 * `data-depth`, giving the hero a sense of water between the layers.
 */
function setupParallax(root: ParentNode): void {
  if (reduced() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  root.querySelectorAll<HTMLElement>("[data-parallax]").forEach((scene) => {
    const layers = Array.from(scene.querySelectorAll<HTMLElement>("[data-depth]"));
    if (!layers.length) return;
    let frame = 0;

    scene.addEventListener("pointermove", (event) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = scene.getBoundingClientRect();
        const dx = (event.clientX - rect.left) / rect.width - 0.5;
        const dy = (event.clientY - rect.top) / rect.height - 0.5;
        for (const layer of layers) {
          const depth = Number(layer.dataset.depth ?? "10");
          layer.style.setProperty("--px", `${-dx * depth}px`);
          layer.style.setProperty("--py", `${-dy * depth}px`);
        }
      });
    });

    scene.addEventListener("pointerleave", () => {
      for (const layer of layers) {
        layer.style.setProperty("--px", "0px");
        layer.style.setProperty("--py", "0px");
      }
    });
  });
}

export function initMotion(root: ParentNode = document): void {
  document.documentElement.classList.add("js-motion");
  setupReveals(root);
  setupMagnets(root);
  setupParallax(root);
}
