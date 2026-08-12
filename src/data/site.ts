// Configuración central del sitio.
// Los valores marcados "pendiente" están listados en PROJECT_BRIEF.md sección 8
// y deben confirmarse con el cliente antes de publicar.

export const site = {
  nombre: "Neurocebryl",
  razonSocial: "Geysson",
  // Pendiente: número real de WhatsApp receptor (brief sección 8)
  whatsapp: "5215555555555",
  correoContacto: "", // pendiente
  facebook: "", // pendiente
  instagram: "", // pendiente
  dominio: "geyssonmexicana.com", // sugerido por el cliente, por confirmar
} as const;

export const categorias = [
  "Articulaciones y Huesos",
  "Energía y Vitalidad",
  "Infantil",
  "Metabolismo y Control de Peso",
  "Rendimiento Deportivo",
  "Respiratorio",
  "Salud Cognitiva",
  "Salud Masculina",
  "Vitaminas y Minerales",
] as const;

export function linkWhatsApp(mensaje: string): string {
  const numero = site.whatsapp.replace(/[^0-9]/g, "");
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
