# Content review — claims to verify with the clinic

The copy was written from the v1 site and general knowledge of small-animal practice. Everything below is a **factual claim that Pablo should confirm or correct before launch**. Items marked ⚠ are inferred and were not in the original material.

## Services (`src/data/services.ts`)

- Medicina general: consultas, vacunación, desparasitación, microchip, ⚠ pasaporte, asesoramiento nutrición.
- Diagnóstico: radiografía ⚠ _digital_, ecografía, analíticas de sangre/orina/heces, citologías, biopsias.
- Cirugía: ⚠ esterilizaciones y castraciones, ⚠ cirugía de tejidos blandos, ⚠ anestesia monitorizada, hospitalización.
- Salud dental: limpieza con ultrasonidos, ⚠ extracciones.
- Tienda: alimentación premium, dietas de prescripción, ⚠ antiparasitarios, accesorios, higiene.
- Domicilio: ⚠ Las Pajanosas, ⚠ Torre de la Reina (v1 said "Guillena y la Sierra Norte de Sevilla"). Adjust `serviceArea` in `clinic.ts` to match reality.

## Home page (`src/pages/index.astro`)

- ⚠ Opening year: Pablo says the clinic opened in **2006** ("creo que era"), so `FOUNDED_YEAR` in `clinic.ts` is 2006 and every "más de N años" derives from it. Confirm the exact year — if it is later than 2006 the figure overstates.
- ⚠ "Muchos de los animales que atendemos hoy son hijos y nietos de los primeros que pasaron por consulta." — flavour text; delete if it feels off.
- ⚠ "Presupuesto claro antes de cualquier intervención." — only keep if it is the actual policy.
- ⚠ "Un solo veterinario de referencia" — remove if there is more than one vet.
- ⚠ "sin esperas innecesarias" / "Siempre con cita previa" — confirm walk-ins policy.

## Team page (`src/pages/equipo.astro`, `src/data/team.ts`)

- "Veterinario y director" and the bio text.
- Miriam Reyes Gómez Rodríguez: ⚠ listed as **"Auxiliar de clínica"**. If she holds the ATV
  qualification, change the role to "Auxiliar técnica veterinaria (ATV)"; the generic wording
  was chosen so the site does not claim a title she may not have. Her bio is also inferred
  (receiving patients, preparing consultations, assisting in surgery) — have her correct it.
- ⚠ Any other staff to list.

## Contact data (`src/data/clinic.ts`)

- Which phone is the landline and which is the WhatsApp number (currently 955 784 891 landline, 629 084 442 mobile/WhatsApp).
- Email `packsev@hotmail.com` — is this the inbox that should receive web messages?
- Hours (copied from v1): Mon–Fri 09:30–13:00 / 17:30–20:30, Sat 10:30–13:30, Sun closed.
- Facebook and Instagram URLs.

## Legal (`src/data/legal.ts`)

- NIF.
- Whether the business is Pablo as self-employed or a company (affects the "Titular" line).
