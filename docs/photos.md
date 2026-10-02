# Photo checklist

The current images are placeholders: a stock photo (750 px wide) and a 320 px storefront shot. The design assumes real photography; these are the shots that make the biggest difference, in priority order.

General guidance: shoot in daylight or with all clinic lights on, phone camera is fine, **landscape orientation unless noted**, send originals (not WhatsApp-compressed — use "Document" in WhatsApp or email/Drive). Minimum 1600 px on the long side; 3000+ is better.

| #   | Shot                                                           | Where it goes                                 | Notes                                                                            |
| --- | -------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------- |
| 1   | Pablo in consultation with a patient (dog or cat on the table) | Home hero (`src/assets/hero-placeholder.jpg`) | The single most important photo. Natural, not posed. Subject on the right third. |
| 2   | Pablo, portrait                                                | Team page (`src/assets/team/`)                | **Portrait orientation.** Neutral background or the consultation room. Smiling.  |
| 3   | Storefront, straight on                                        | Home "Conócenos" (`src/assets/fachada.jpg`)   | Replace the current low-res one. Portrait or landscape both work.                |
| 4   | Consultation room, empty and tidy                              | Services (medicina general)                   | Wide angle from the door.                                                        |
| 5   | Operating room                                                 | Services (cirugía)                            | Wide angle; equipment visible.                                                   |
| 6   | X-ray / ultrasound equipment, or lab bench                     | Services (diagnóstico)                        |                                                                                  |
| 7   | Shop shelves (food, products)                                  | Services (tienda)                             |                                                                                  |
| 8   | Any other team member                                          | Team page                                     | Portrait orientation, same framing as #2 so they match.                          |
| 9   | Happy patient close-ups (2–3)                                  | Spare, for social / future sections           | With owner's permission if a person is recognisable.                             |

Once #4–#7 exist, the services page can show a photo per service instead of the icon tile: add an optional `image` field to `Service` in `src/data/services.ts` and render it in `src/pages/servicios.astro` in place of `.service__visual`.

Legal note: people in photos must agree to appear on the website (a WhatsApp message saying "ok" is enough to keep on file). No client's pet needs permission, but avoid visible name tags or documents.
