import productosData from "../data/productos.json";

export interface Producto {
  id: string;
  slug: string;
  nombre: string;
  categoria: string;
  presentacion: string;
  precio: number;
  ancla: boolean;
  descripcion: string;
  beneficios: string[];
  imagenFrente?: string;
  imagenReverso?: string;
}

export const productos: Producto[] = productosData as Producto[];

// Curaduría editorial de "más consultados" (alternativa honesta al
// social-proof en vivo — ver PROJECT_BRIEF.md sección 3). Actualizar a mano
// según Cloudflare Web Analytics una vez publicado.
export const masConsultadosSlugs = ["compuesto", "vitagen", "aminocard", "edartryl"];

export function precioTexto(producto: Producto): string {
  return `$${producto.precio}.00 MXN`;
}

export function porCategoria(categoria: string): Producto[] {
  return productos.filter((p) => p.categoria === categoria);
}

export function relacionados(producto: Producto, limite = 4): Producto[] {
  const mismaCategoria = productos.filter(
    (p) => p.id !== producto.id && p.categoria === producto.categoria
  );
  const otras = productos.filter(
    (p) => p.id !== producto.id && p.categoria !== producto.categoria
  );
  return [...mismaCategoria, ...otras].slice(0, limite);
}

export function productosAncla(): Producto[] {
  return productos.filter((p) => p.ancla);
}
