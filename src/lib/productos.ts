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

export interface Tripack {
  precioUnitario: number;
  subtotal: number;
  porcentajeDescuento: number;
  descuento: number;
  precioFinal: number;
}

export function calcularTripack(producto: Producto): Tripack {
  const precioUnitarioCentavos = Math.round(producto.precio * 100);
  const subtotalCentavos = precioUnitarioCentavos * 3;
  const porcentajeDescuento = 10;
  const descuentoCentavos = Math.round((subtotalCentavos * porcentajeDescuento) / 100);

  return {
    precioUnitario: precioUnitarioCentavos / 100,
    subtotal: subtotalCentavos / 100,
    porcentajeDescuento,
    descuento: descuentoCentavos / 100,
    precioFinal: (subtotalCentavos - descuentoCentavos) / 100,
  };
}

export function precioPromocionalTexto(precio: number): string {
  const tieneCentavos = !Number.isInteger(precio);
  return `$${precio.toLocaleString("es-MX", {
    minimumFractionDigits: tieneCentavos ? 2 : 0,
    maximumFractionDigits: 2,
  })} MXN`;
}

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
