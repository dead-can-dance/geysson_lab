# Debugging

Problemas reales con los que ya nos topamos en este proyecto, y cómo se
diagnosticaron/resolvieron. Antes de investigar desde cero, revisa si ya
está aquí.

## `astro: instrucción no encontrada`

Astro no está instalado global, solo como dependencia del proyecto. Usar
`npx astro ...` en vez de `astro ...` directo, o los scripts de
`package.json` (`npm run dev`, etc.). Ver `COMANDOS.md`.

## Una foto no aparece / la tarjeta muestra el placeholder de rayas

1. Confirma que el producto tiene `imagenFrente`/`imagenReverso` en
   `src/data/productos.json` — si el campo falta, `ProductCard.astro` y
   `[slug].astro` caen automáticamente al placeholder (es el comportamiento
   esperado, no un bug).
2. Confirma que el archivo existe físicamente en
   `public/productos/<slug>/frente.<ext>` (o `reverso.<ext>`) y que la
   extensión coincide con la que está escrita en el JSON — es fácil que no
   coincidan porque las fotos fuente vienen en `.png`, `.jpg` y `.jpeg`
   mezclados.
3. Con el dev server corriendo, verifica con `curl` que la ruta responde 200
   y no 404 (ver `COMANDOS.md` sección "Verificar rutas e imágenes"). Astro
   sirve todo lo que está en `public/` tal cual, con la misma ruta relativa.

## El PIM (`.xlsx`) devuelve `None` en todas las celdas con `data_only=True`

La hoja `07 Export web` está **100% basada en fórmulas** (dice literalmente
"Hoja 100% calculada" en su fila 2) que jalan de `02 Productos`. Si el
archivo no se ha abierto y recalculado en Excel/LibreOffice después de la
última edición, `openpyxl` con `data_only=True` devuelve el valor cacheado
de la fórmula — que es `None` si nunca se calculó. Esto pasó exactamente así
con `PIM3_actualizado_promocion.xlsx`: `07 Export web` venía vacía.

**Solución:** leer `02 Productos` directamente — es la hoja de "captura
manual" (dice "Azul = captura manual" en su leyenda), tiene los valores
reales sin depender de fórmulas. Confirma cualquier lectura cruzando contra
los datos que ya conocías (en este caso, los 10 productos que ya estaban en
`productos.json` coincidían exactamente con `02 Productos`, lo cual validó
que era la hoja correcta a usar para el resto).

Si en algún momento alguien abre el `.xlsx` en Excel/LibreOffice y lo
resguarda, `07 Export web` sí tendría valores cacheados y sería la hoja
"oficial" a usar según el flujo que describe `src/data/README.md`
("regenerar este JSON desde la hoja 07 Export web").

## El emparejamiento automático de fotos falla o marca todo como `REVISAR`

`match_product_images.py` solo puede emparejar automáticamente si el nombre
del archivo trae información reconocible (un ID `P0XX` o texto parecido al
nombre del producto). Las fotos "anverso" del cliente (`image1.png` …
`image20.png`) no traen nada de eso — **no hay forma de automatizarlo**, se
tiene que ver cada foto e identificar el producto a ojo, y codificar el
resultado en `MANUAL_FRENTE` dentro del script. Si llegan fotos nuevas con
nombres igual de genéricos, hay que repetir ese proceso manual, no
confiar en que el script las va a reconocer solo.

Para el lado "reverso" (nombres libres pero con texto del producto), el
matcher usa `difflib` con cutoff `0.55`. Si un nombre de archivo es mucho
más corto que el nombre completo del producto (ej. `Suketyl.jpeg` vs
"Suketyl Balsámico Jarabe"), la similitud cae debajo del cutoff aunque el
match sea obviamente correcto a ojo. No hay que bajar el cutoff global (eso
generaría falsos positivos con otros productos) — se agrega el caso puntual
a `ALIAS_REVERSO`.

Cualquier fila `REVISAR` en `reporte_match_fotos.csv` **debe confirmarse
viendo la foto real**, no asumirse. En la práctica, hasta ahora todas las
que salieron `REVISAR` (coincidencia aproximada) resultaron correctas al
revisarlas — el script es conservador, no dio falsos positivos, pero
tampoco hay que confiar ciegamente en eso la próxima vez.

## Herramienta de navegador (`claude-in-chrome`) — comportamientos raros observados

- **`hover` no siempre dispara el efecto CSS `:hover` a la primera.** Pasó
  al probar el hover de `[slug].astro`: la primera llamada a `hover` +
  `screenshot` no mostró cambio visual, pero repetir `hover` en una
  coordenada ligeramente distinta sí lo disparó. Si un hover "no funciona"
  en la herramienta pero el CSS se ve correcto al leer el código, probar de
  nuevo antes de asumir que el código está mal.
- **Un `hover` puede terminar haciendo click en un elemento flotante
  superpuesto.** El botón flotante de WhatsApp ("¿Dudas? Escríbenos") está
  fijo en la esquina inferior derecha con z-index alto; si la coordenada de
  `hover`/`screenshot` cae encima de él, puede abrir una pestaña nueva hacia
  `wa.me` y/o navegar la pestaña actual a otra ruta sin que se haya pedido
  explícitamente. Si después de una acción la URL de la pestaña cambió sola,
  revisa si la coordenada usada coincidía con el botón flotante, cierra la
  pestaña extra que haya abierto, y repite en una coordenada distinta.
- Después de cambios de layout (una foto real es más alta/ancha que el
  placeholder de rayas), la página puede hacer scroll/reflow entre una
  captura y otra — las coordenadas de un `screenshot` anterior pueden ya no
  apuntar al mismo elemento en el siguiente. Volver a tomar `screenshot`
  antes de calcular la siguiente coordenada, no reutilizar coordenadas
  viejas a ciegas.

## El proyecto no es un repo git

`web/` (y el resto de `neurocedryl/`) no está inicializado como repositorio
git todavía. No hay `git log`/`git blame` que consultar para historial —
esta carpeta `docs/` es, por ahora, la única fuente de historial de
decisiones. Si en algún punto se inicializa git, vale la pena hacer el
primer commit con un mensaje que referencie esta bitácora.
