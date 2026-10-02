import type { ImageMetadata } from "astro";
import { clinic } from "./clinic";

/**
 * People shown on /equipo/. Add a new entry per team member; `photo` is optional
 * (a neutral placeholder is rendered when missing). Photos live in src/assets/team/.
 */
export interface TeamMember {
  name: string;
  role: string;
  /** Short paragraph, first person plural is avoided: written about the person. */
  bio: string;
  /** e.g. "Colegiado nº 1385 (Sevilla)". */
  credentials?: string;
  photo?: ImageMetadata;
}

export const team: TeamMember[] = [
  {
    name: "Pablo Galán Garrido",
    role: "Veterinario y director",
    credentials: "Colegiado nº 1385 · Colegio Oficial de Veterinarios de Sevilla",
    bio: `Al frente del Centro Veterinario Guillena desde que abrió sus puertas, hace más de ${clinic.foundedYearsAgo} años. Medicina general, cirugía y un trato directo y honesto: explicar qué le pasa a tu mascota, qué opciones hay y qué haría él en tu lugar.`,
  },
  {
    name: "Miriam Reyes Gómez Rodríguez",
    role: "Auxiliar de clínica",
    bio: "En la clínica desde el primer día, junto a Pablo. Es quien recibe a la mayoría de los pacientes, prepara las consultas y acompaña a los animales antes, durante y después de cada intervención. Si has traído aquí a tu mascota, ya la conoces.",
  },
  // Add more team members here. To include a photo, import it at the top of this file:
  //   import nombrePhoto from "../assets/team/nombre.jpg";
  // {
  //   name: "Nombre Apellido",
  //   role: "Auxiliar técnico veterinario",
  //   bio: "...",
  //   photo: nombrePhoto,
  // },
];
