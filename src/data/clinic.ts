/**
 * Single source of truth for the clinic's public information.
 *
 * Every page, the footer, the JSON-LD structured data and the "open now" badge read
 * from here. To change a phone number or an opening time, edit this file only.
 */

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface TimeRange {
  /** 24h "HH:MM" local time (Europe/Madrid). */
  open: string;
  close: string;
}

/**
 * Year the clinic opened. Everything that talks about "más de N años" derives
 * from this, so the copy keeps itself honest instead of going stale.
 */
const FOUNDED_YEAR = 2006;

/** Completed years since the clinic opened, resolved when the site is built. */
const yearsOpen = new Date().getFullYear() - FOUNDED_YEAR;

export const clinic = {
  name: "Centro Veterinario Guillena",
  shortName: "Centro Vet. Guillena",
  tagline: `Tu veterinario de confianza en Guillena desde hace más de ${yearsOpen} años.`,
  foundedYear: FOUNDED_YEAR,
  foundedYearsAgo: yearsOpen,
  vet: {
    name: "Pablo Galán Garrido",
    licenseNumber: "1385",
    licenseBody: "Ilustre Colegio Oficial de Veterinarios de Sevilla",
  },
  address: {
    street: "Calle San Juan Bautista, 4",
    postalCode: "41210",
    city: "Guillena",
    province: "Sevilla",
    country: "ES",
  },
  geo: { lat: 37.54765, lng: -6.05551 },
  phones: {
    landline: { display: "955 784 891", e164: "+34955784891" },
    mobile: { display: "629 084 442", e164: "+34629084442" },
  },
  email: "packsev@hotmail.com",
  whatsapp: {
    e164: "34629084442",
    defaultMessage: "Hola, me gustaría pedir cita en el Centro Veterinario Guillena.",
  },
  social: {
    facebook: "https://www.facebook.com/Pabloveterinario/",
    instagram: "https://www.instagram.com/c.veterinarioguillena/",
  },
  maps: {
    /** Google Maps place page (used for "Cómo llegar"). */
    placeUrl: "https://www.google.com/maps/search/?api=1&query=Centro+Veterinario+Guillena",
    directionsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=Centro+Veterinario+Guillena,+Calle+San+Juan+Bautista+4,+41210+Guillena",
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d665.0049808255746!2d-6.0555104273673335!3d37.547650678991864!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd1240bd7c26eb11%3A0xada92572a17cdf5!2sCentro%20Veterinario%20Guillena!5e0!3m2!1ses!2ses!4v1782007093837!5m2!1ses!2ses",
  },
  /** Weekly opening hours. An empty array means closed that day. */
  hours: {
    mon: [
      { open: "09:30", close: "13:00" },
      { open: "17:30", close: "20:30" },
    ],
    tue: [
      { open: "09:30", close: "13:00" },
      { open: "17:30", close: "20:30" },
    ],
    wed: [
      { open: "09:30", close: "13:00" },
      { open: "17:30", close: "20:30" },
    ],
    thu: [
      { open: "09:30", close: "13:00" },
      { open: "17:30", close: "20:30" },
    ],
    fri: [
      { open: "09:30", close: "13:00" },
      { open: "17:30", close: "20:30" },
    ],
    sat: [{ open: "10:30", close: "13:30" }],
    sun: [],
  } satisfies Record<Weekday, TimeRange[]>,
  timeZone: "Europe/Madrid",
  /** Area covered by the home-visit service, used in copy and structured data. */
  serviceArea: ["Guillena", "Las Pajanosas", "Torre de la Reina", "Sierra Norte de Sevilla"],
} as const;

export const weekdayLabels: Record<Weekday, string> = {
  mon: "Lunes",
  tue: "Martes",
  wed: "Miércoles",
  thu: "Jueves",
  fri: "Viernes",
  sat: "Sábado",
  sun: "Domingo",
};

export const whatsappUrl = `https://wa.me/${clinic.whatsapp.e164}?text=${encodeURIComponent(
  clinic.whatsapp.defaultMessage,
)}`;

export const fullAddress = `${clinic.address.street}, ${clinic.address.postalCode} ${clinic.address.city}, ${clinic.address.province}`;

/**
 * Groups consecutive days with identical hours so the UI can print
 * "Lunes – Viernes" instead of five identical rows.
 */
export function groupedHours(): { label: string; ranges: readonly TimeRange[] }[] {
  const order: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const groups: { days: Weekday[]; ranges: readonly TimeRange[] }[] = [];

  for (const day of order) {
    const ranges = clinic.hours[day];
    const last = groups.at(-1);
    if (last && JSON.stringify(last.ranges) === JSON.stringify(ranges)) {
      last.days.push(day);
    } else {
      groups.push({ days: [day], ranges });
    }
  }

  return groups.map(({ days, ranges }) => ({
    label:
      days.length === 1
        ? weekdayLabels[days[0]]
        : `${weekdayLabels[days[0]]} – ${weekdayLabels[days.at(-1)!]}`,
    ranges,
  }));
}
