/**
 * Services offered by the clinic. Rendered on the home page (featured ones) and in
 * full on /servicios/. `slug` doubles as the anchor id on the services page.
 */

export type IconName =
  | "stethoscope"
  | "syringe"
  | "microscope"
  | "scissors"
  | "hospital"
  | "shopping-bag"
  | "house"
  | "scan-heart";

export interface Service {
  slug: string;
  title: string;
  /** One sentence used on cards. */
  summary: string;
  /** Longer copy used on the services page. */
  description: string;
  /** Concrete items the client can expect. */
  items: string[];
  icon: IconName;
  /** Shown on the home page. */
  featured?: boolean;
}

export const services: Service[] = [
  {
    slug: "medicina-general",
    title: "Medicina general y preventiva",
    summary:
      "Consultas, vacunaciones, desparasitaciones y chequeos para que tu mascota crezca sana.",
    description:
      "La prevención es la base de una vida larga y sana. En cada consulta revisamos el estado general de tu mascota, actualizamos su calendario de vacunas y te asesoramos sobre alimentación, higiene y cuidados en cada etapa de su vida.",
    items: [
      "Consulta general y revisiones periódicas",
      "Vacunación y calendario personalizado",
      "Desparasitación interna y externa",
      "Identificación con microchip y pasaporte",
      "Asesoramiento en nutrición y cuidados",
    ],
    icon: "stethoscope",
    featured: true,
  },
  {
    slug: "diagnostico",
    title: "Diagnóstico por imagen y laboratorio",
    summary: "Radiografía, ecografía y analíticas en la propia clínica para un diagnóstico rápido.",
    description:
      "Disponemos de medios diagnósticos en el propio centro, lo que nos permite obtener resultados con rapidez y empezar el tratamiento cuanto antes, sin desplazamientos innecesarios.",
    items: [
      "Radiografía digital",
      "Ecografía",
      "Analíticas de sangre, orina y heces",
      "Citologías y biopsias",
    ],
    icon: "microscope",
    featured: true,
  },
  {
    slug: "cirugia",
    title: "Cirugía y hospitalización",
    summary:
      "Quirófano equipado y seguimiento cercano antes, durante y después de la intervención.",
    description:
      "Contamos con quirófano completamente equipado y monitorización durante toda la intervención. Tras la cirugía, tu mascota permanece bajo observación el tiempo necesario y te explicamos con detalle los cuidados en casa.",
    items: [
      "Esterilizaciones y castraciones",
      "Cirugía de tejidos blandos",
      "Anestesia monitorizada",
      "Hospitalización y cuidados postoperatorios",
    ],
    icon: "scissors",
    featured: true,
  },
  {
    slug: "odontologia",
    title: "Salud dental",
    summary: "Limpiezas dentales con ultrasonidos para prevenir sarro, dolor y pérdida de piezas.",
    description:
      "Las enfermedades bucodentales son de las más frecuentes en perros y gatos y a menudo pasan desapercibidas. Una limpieza a tiempo evita dolor, mal aliento e infecciones que pueden afectar a otros órganos.",
    items: [
      "Limpieza dental con ultrasonidos",
      "Extracciones",
      "Revisión bucodental en cada consulta",
    ],
    icon: "scan-heart",
    featured: true,
  },
  {
    slug: "tienda",
    title: "Tienda y nutrición",
    summary:
      "Alimentación premium, dietas veterinarias y accesorios con asesoramiento personalizado.",
    description:
      "En la clínica encontrarás alimentación de calidad y dietas de prescripción veterinaria para cada necesidad, además de accesorios y productos de higiene. Te ayudamos a elegir lo que mejor se adapta a tu mascota.",
    items: [
      "Alimentación premium para perros y gatos",
      "Dietas de prescripción veterinaria",
      "Antiparasitarios y productos de higiene",
      "Accesorios y complementos",
    ],
    icon: "shopping-bag",
    featured: true,
  },
  {
    slug: "domicilio",
    title: "Servicio a domicilio",
    summary: "Nos desplazamos a tu casa en Guillena y alrededores cuando venir supone un problema.",
    description:
      "Hay situaciones en las que el desplazamiento es un estrés para el animal o un inconveniente para ti: animales mayores, con movilidad reducida o varios animales en casa. En esos casos, vamos nosotros.",
    items: [
      "Consultas y vacunaciones en tu domicilio",
      "Guillena, Las Pajanosas, Torre de la Reina y alrededores",
      "Con cita previa por teléfono o WhatsApp",
    ],
    icon: "house",
    featured: true,
  },
];

export const featuredServices = services.filter((s) => s.featured);
