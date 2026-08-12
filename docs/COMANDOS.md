# Comandos

Todos los comandos de Astro se corren desde `web/` (raíz del proyecto Astro).
Los del script de fotos se corren desde `../geysoon catalogo/`.

## Servidor de desarrollo

Este proyecto usa el modo background del CLI de Astro (ver `CLAUDE.md` /
`AGENTS.md`) en vez de `npm run dev` directo, para poder seguir trabajando
en la misma terminal mientras el server corre.

```sh
npx astro dev --background   # levanta el server en background (puerto 4321)
npx astro dev status         # ¿está corriendo? con qué PID
npx astro dev logs           # ver logs del server
npx astro dev stop           # apagarlo
```

Si `astro` no está en el PATH (`bash: astro: instrucción no encontrada`),
usar siempre `npx astro ...` — el binario vive en `node_modules/.bin`, no
está instalado global.

## Build y preview

```sh
npm install                  # instalar dependencias (primera vez / tras cambios en package.json)
npm run build                # compila a ./dist/
npm run preview              # sirve ./dist/ como en producción, para probar el build final
npm run astro -- --help      # ayuda del CLI de Astro
npm run astro check          # type-check de los .astro/.ts
```

## Verificar rutas e imágenes sin abrir navegador

Útil para confirmar que una página o imagen responde antes de gastar tiempo
abriendo Chrome:

```sh
# ¿la página responde 200 y trae lo esperado?
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/catalogo/foretin
curl -s http://localhost:4321/catalogo | grep -oE '[0-9]+ productos'

# ¿la foto de un producto existe y se sirve?
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/productos/foretin/frente.png

# listar todos los src de imagen que renderizó una página
curl -s http://localhost:4321/catalogo | grep -o 'src="/productos/[^"]*"' | sort -u
```

Requiere el dev server corriendo (ver arriba).

## Script de emparejamiento de fotos

Desde `../geysoon catalogo/`:

```sh
python3 match_product_images.py fotos_catalogo_geysson_anverso/ fotos_catalogo_geysson_reverso/
```

Regenera `reporte_match_fotos.csv`. No mueve ni renombra las fotos
originales — solo reporta el emparejamiento sugerido. Ver
`DATOS_Y_CATALOGO.md` para cómo pasar de ese reporte a
`public/productos/<slug>/`.

Para inspeccionar el CSV resultante en la terminal, alineado en columnas:

```sh
column -s, -t reporte_match_fotos.csv | less -S
```

## Leer el PIM (`PIM3_actualizado_promocion.xlsx`)

El PIM no se lee a mano celda por celda — se usa `openpyxl` desde Python.
Ejemplo para volcar la hoja `02 Productos` (la que tiene los datos reales,
ver DEBUGGING.md):

```sh
python3 - <<'EOF'
import openpyxl
wb = openpyxl.load_workbook("PIM3_actualizado_promocion.xlsx", data_only=True)
ws = wb["02 Productos"]
rows = list(ws.iter_rows(min_row=4, max_row=25, values_only=True))
header = rows[0]
idx = {name: i for i, name in enumerate(header) if name}
for row in rows[1:]:
    if row[0]:
        print(row[idx["ID"]], row[idx["Producto"]], row[idx["Categoría"]],
              row[idx["Presentación"]], row[idx["Precio público (MXN)"]])
EOF
```

Si `openpyxl` no está instalado: `pip install openpyxl` (o revisar si ya
existe en el entorno con `python3 -c "import openpyxl"`).

## Copiar fotos a `public/productos/`

No hay comando único — se arma un `cp` por producto porque los nombres de
archivo fuente son inconsistentes (mayúsculas, espacios, extensiones
mixtas). Patrón usado (bash, arrays asociativos con slug → nombre de
archivo fuente):

```sh
SRC_F=".../fotos_catalogo_geysson_anverso"
SRC_R=".../fotos_catalogo_geysson_reverso"
DST="web/public/productos"

declare -A FRENTE=( [slug]="imageN.png" ... )
declare -A REVERSO=( [slug]="Nombre Original.jpeg" ... )

for slug in "${!FRENTE[@]}"; do
  mkdir -p "$DST/$slug"
  f_ext="${FRENTE[$slug]##*.}"; r_ext="${REVERSO[$slug]##*.}"
  cp "$SRC_F/${FRENTE[$slug]}" "$DST/$slug/frente.$f_ext"
  cp "$SRC_R/${REVERSO[$slug]}" "$DST/$slug/reverso.$r_ext"
done
```

Ver `DATOS_Y_CATALOGO.md` para la tabla slug → archivo fuente completa (los
20 productos), así no hay que reconstruirla de memoria.

## Navegador (verificación visual con Claude Code)

Cuando se necesita confirmar visualmente algo (hover, layout, que una foto
no se vea recortada/distorsionada), se usa la skill `claude-in-chrome`
dentro de la sesión de Claude Code — no hay comando de shell para esto, es
una herramienta MCP. Ver DEBUGGING.md sobre un par de comportamientos raros
de esa herramienta.
