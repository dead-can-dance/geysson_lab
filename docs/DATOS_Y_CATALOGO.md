# Datos y catálogo: de dónde sale todo

Este documento explica el origen de cada campo de `src/data/productos.json`
y cómo están organizadas las fotos en `public/productos/`, para que agregar
o corregir un producto no requiera adivinar el patrón.

## Origen de los datos, campo por campo

| Campo | Origen | ¿Placeholder? |
|---|---|---|
| `id` (slug) | Inventado por el desarrollador al construir el sitio, no viene del PIM (el PIM tiene una columna `Slug` pero está vacía — ver DEBUGGING.md) | No aplica |
| `nombre` | PIM, hoja `02 Productos`, columna `Producto` | No, es el nombre real |
| `categoria` | PIM, hoja `02 Productos`, columna `Categoría` | No, es la real — pero el PIM marca `Estado = Pendiente` para los 20, confirmar antes de publicar |
| `presentacion` | PIM, hoja `02 Productos`, columna `Presentación` | No |
| `precio` | PIM, hoja `02 Productos`, columna `Precio público (MXN)` | No |
| `ancla` | PIM, hoja `02 Productos`, columna `Producto ancla` (Sí/No → true/false) | No |
| `descripcion` | Redactado a mano, tono neutro, sin claims específicos | **Sí, 100% placeholder** |
| `beneficios` | Redactado a mano, 3 bullets genéricos por producto | **Sí, 100% placeholder — ver PROJECT_BRIEF.md §7** |
| `imagenFrente` / `imagenReverso` | Fotos reales del cliente, emparejadas manualmente (ver más abajo) | No — son fotos reales, aunque el layout/composición de la ficha sí puede cambiar |

**Regla dura:** aunque `categoria`/`presentacion`/`precio` sean datos reales
del PIM (no inventados), el PIM entero está en `Estado = Pendiente` y
`Listo para desarrollo` vacío para los 20 productos. Antes de la publicación
final hay que confirmar con el cliente que nada de esto cambió. Lo que
**nunca** debe pasar a producción tal cual es `descripcion`/`beneficios`.

## Convención de slugs

La mayoría de los slugs son una palabra corta derivada del nombre del
producto. Dos casos necesitaron desambiguación porque dos productos del PIM
comparten familia de nombre:

| Situación | Slugs usados |
|---|---|
| Dos variantes de "Neurocebryl Compuesto" | `compuesto` (ampolletas, P012) vs `compuesto-jarabe` (jarabe, P006) |
| Dos variantes de "HV Vitagen" | `vitagen` (Black Pill, cápsulas, P002) vs `vitagen-hv` (ampolletas, sin "Black Pill", P015) |

Si se agrega un producto nuevo cuyo nombre colisiona con un slug existente,
seguir el mismo patrón: sufijo corto que describa la diferencia
(presentación, variante), no un número ni el ID del PIM.

## Tabla completa: producto → ID del PIM → fotos fuente

Esta es la tabla de emparejamiento definitiva (salida de
`match_product_images.py` + decisiones manuales), para no tener que volver
a abrir cada foto si hace falta reconstruir o auditar algo.

| Slug | ID PIM | Nombre | Ancla | Foto anverso (fuente) | Foto reverso (fuente) |
|---|---|---|---|---|---|
| `neurovigor` | P001 | Neurovigor SX | No | `image15.png` | `Neurovigor SX.png` |
| `vitagen` | P002 | HV Vitagen Black Pill | No | `image20.png` | `Vitagen BlackPill.png` |
| `edartryl` | P003 | Edartryl 3 en 1 | No | `image11.png` | `Edartryl.png` |
| `vitampol` | P004 | Vitampol Fuerte | No | `image12.png` | `Vitampol Fuerte.jpeg` |
| `carnachof` | P005 | L-Carnachof Rhodiola | No | `image13.png` | `Carnachof.jpeg` |
| `compuesto-jarabe` | P006 | Neurocebryl Compuesto Jarabe | **Sí** | `image10.png` | `Neuro Jarabe.jpeg` |
| `foretin` | P007 | Neurocebryl Foretin | **Sí** | `image9.png` | `Neurocebryl Foretin.jpeg` |
| `infantil` | P008 | Vitampol Infantil | No | `image3.png` | `Vitampol Infantil.jpeg` |
| `tableta` | P009 | Neurocebryl Tableta | **Sí** | `image4.png` | `Neurocebryl Tableta.jpeg` |
| `hierrovit` | P010 | Hierrovit con Calcio | No | `image5.png` | `Hierrovit.jpeg` |
| `suketyl` | P011 | Suketyl Balsámico Jarabe | No | `image17.png` | `Suketyl.jpeg` (alias manual, ver DEBUGGING.md) |
| `compuesto` | P012 | Neurocebryl Compuesto | **Sí** | `image16.jpg` | `Neurocebryl Compuesto.jpeg` |
| `fortalex` | P013 | Fortalex TS | No | `image7.png` | `Fortalex.jpeg` |
| `campolonet` | P014 | Campolonet B12 | No | `image1.png` | `Campolonet B12.jpeg` |
| `vitagen-hv` | P015 | HV Vitagen | No | `image6.png` | `Vitagen.jpeg` |
| `bacalciferol` | P016 | Bacalciferol | No | `image19.png` | `Bacalciferol.jpeg` |
| `hgc3` | P017 | HGC3 | No | `image18.png` | `HGC3.jpeg` |
| `ginkgotiamin` | P018 | Ginkgotiamin GL | No | `image8.png` | `Ginkgotiamin.jpeg` |
| `aminocard` | P019 | Aminocard Sport | No | `image2.png` | `Aminocard.jpeg` |
| `taurilaif` | P020 | Taurilaif | No | `image14.png` | `Taurilaif.jpeg` |

Las 20 fotos `image1.png`…`image20.png` y las 20 fotos de reverso se usan
cada una exactamente una vez — si alguna vez los números no cuadran (por
ejemplo al recibir fotos nuevas), es señal de que algo quedó sin asignar o
duplicado.

## Organización de `public/productos/`

```
public/productos/<slug>/frente.<ext>
public/productos/<slug>/reverso.<ext>
```

- `<ext>` se conserva tal cual venía el archivo fuente (mezcla real de
  `.png`, `.jpg`, `.jpeg` — no se re-encodificaron las imágenes).
- `frente` = foto de caja/frasco vista principal. `reverso` = foto con
  ingredientes/modo de uso/tabla nutrimental (lo que se muestra al hacer
  hover).
- Si un producto no tiene fotos, simplemente no se le agregan los campos
  `imagenFrente`/`imagenReverso` en `productos.json` — `ProductCard.astro` y
  `[slug].astro` están preparados para eso y muestran el placeholder de
  rayas automáticamente (no hace falta ningún flag adicional).

## Cómo agregar un producto nuevo (paso a paso)

1. Buscar sus datos reales en `PIM3_actualizado_promocion.xlsx`, hoja
   `02 Productos` (no en `07 Export web`, ver DEBUGGING.md).
2. Elegir un slug siguiendo la convención de arriba.
3. Si hay fotos nuevas del cliente: identificarlas a ojo si no traen
   nombre/ID reconocible (ver limitación de `match_product_images.py` en
   DEBUGGING.md), copiarlas a
   `public/productos/<slug>/frente.<ext>` y `reverso.<ext>`.
4. Agregar la entrada a `productos.json` en su posición según ID del PIM
   (el archivo está ordenado P001→P020, mantener el orden ayuda a diffear).
   `descripcion`/`beneficios`: redactar placeholder neutro, sin claims
   específicos no aprobados — no copiar texto de la caja del producto ni de
   ninguna fuente externa como si fuera aprobado.
5. No hace falta tocar `ProductCard.astro`, `[slug].astro`,
   `catalogo/index.astro` ni `neurocebryl.astro` — todos leen de
   `productos.json` dinámicamente. Sí revisar `src/data/site.ts` si la
   categoría del producto nuevo no está en la lista `categorias` (los chips
   de filtro del catálogo).
