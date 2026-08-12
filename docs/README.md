# Documentación de desarrollo — Neurocebryl

Índice de la documentación técnica del proyecto. Esto complementa (no
reemplaza) al brief comercial/contractual en la raíz del repo padre.

| Documento | Para qué sirve |
|---|---|
| [BITACORA.md](./BITACORA.md) | Qué se ha hecho hasta ahora, en orden cronológico, con el porqué de cada decisión |
| [COMANDOS.md](./COMANDOS.md) | Comandos para levantar el sitio, compilar, y correr las utilidades de datos/fotos |
| [DEBUGGING.md](./DEBUGGING.md) | Cómo diagnosticar los problemas más comunes de este proyecto |
| [DATOS_Y_CATALOGO.md](./DATOS_Y_CATALOGO.md) | De dónde sale `productos.json`, cómo están organizadas las fotos, convención de slugs |

## Otros documentos relevantes (fuera de `web/docs/`)

- `../../PROJECT_BRIEF.md` — brief técnico de la Fase 1, alcance contractual,
  regla de contenido (sección 7), bitácora de solicitudes fuera de alcance
- `../../PIM3_actualizado_promocion.xlsx` — PIM del cliente (fuente de verdad
  de producto/precio/categoría/claims). Hoja `02 Productos` = captura manual.
  Hoja `07 Export web` = pensada para exportar a JSON pero sus fórmulas no
  están calculadas en el archivo actual (ver DEBUGGING.md).
- `../CLAUDE.md` / `../AGENTS.md` — instrucciones de arranque del dev server
  para agentes de código
- `../src/data/README.md` — advertencia corta sobre el estado placeholder de
  `productos.json` (léela si vas a tocar ese archivo)
- `../../geysoon catalogo/match_product_images.py` y
  `../../geysoon catalogo/reporte_match_fotos.csv` — script y reporte que
  emparejó las 40 fotos originales del cliente con los 20 productos del PIM

## Regla que aplica a todo lo demás

Ningún beneficio, claim o descripción de producto publicado en este sitio es
contenido final. 0 de 20 productos y 0 de 74 claims están aprobados por el
cliente en el PIM a la fecha de este documento. Ver PROJECT_BRIEF.md sección
7 y `src/data/README.md`.
