# Formulario de contacto: Turnstile + Resend

Guía de instalación. Sigue los pasos en orden; el 5 depende del 3 y 4.

---

## 1. Crear el widget de Turnstile

Dashboard de Cloudflare → **Turnstile** → **Add widget**

| Campo | Valor |
|---|---|
| Widget name | `geyssonmexicana-contacto` |
| Hostnames | `geyssonmexicana.com`, `www.geyssonmexicana.com`, `geysson-lab.pages.dev` |
| Widget mode | Managed |

Incluye el hostname de `.pages.dev` para poder probar en el preview antes de
mergear a producción.

Al crearlo te da dos llaves:
- **Site key** → es pública, va en el HTML
- **Secret key** → va en variables de entorno, **nunca en el repo**

---

## 2. Configurar Resend

1. Crea cuenta en resend.com (plan gratuito: 3,000 correos/mes, suficiente).
2. **Domains** → **Add Domain** → `geyssonmexicana.com`
3. Resend te da registros DNS (DKIM, SPF, DMARC). Cópialos a Cloudflare:
   dashboard del dominio → **DNS** → **Records** → agregar cada uno.
4. De vuelta en Resend, **Verify DNS Records**. Debe quedar en "Verified".
5. **API Keys** → crea una con permiso de envío. Cópiala, solo se muestra una vez.

**Por qué hace falta verificar el dominio:** el correo sale `desde`
`contacto@geyssonmexicana.com`. Sin los registros DNS, los proveedores lo
marcan como spam o lo rechazan. Este paso no es opcional.

---

## 3. Variables de entorno en Cloudflare Pages

Proyecto `geysson-lab` → **Settings** → **Environment variables**

Agrega dos, **tipo Secret** (no Plain text), en Production y Preview:

| Nombre | Valor |
|---|---|
| `TURNSTILE_SECRET_KEY` | la secret key del paso 1 |
| `RESEND_API_KEY` | la API key del paso 2 |

Después de agregarlas hay que **volver a desplegar** para que el endpoint las
vea. Un push nuevo basta.

---

## 4. Colocar el endpoint

Copia `functions/api/contacto.js` a la raíz del repo:

```
web/
├── functions/
│   └── api/
│       └── contacto.js
├── src/
├── public/
└── package.json
```

Cloudflare Pages detecta la carpeta `functions/` sola y publica el endpoint en
`/api/contacto`. No hay que configurar nada más.

---

## 5. El formulario en `contacto.astro`

Necesita tres cosas:

**a) El script de Turnstile** en el `<head>` (o antes de cerrar `<body>`):

```html
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
```

**b) El widget dentro del formulario**, con tu site key:

```html
<div class="cf-turnstile" data-sitekey="TU_SITE_KEY_AQUI"></div>
```

Al resolverse el desafío, Turnstile inyecta solo un campo oculto llamado
`cf-turnstile-response`. El endpoint lo lee de ahí.

**c) El campo honeypot** — oculto para humanos, los bots lo llenan:

```html
<div style="position:absolute;left:-9999px" aria-hidden="true">
  <label>No llenar este campo
    <input type="text" name="empresa_web" tabindex="-1" autocomplete="off">
  </label>
</div>
```

**d) Envío por JavaScript** (para no recargar la página):

```js
const form = document.getElementById("form-contacto");
const estado = document.getElementById("form-estado");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const boton = form.querySelector("button[type=submit]");
  boton.disabled = true;
  estado.textContent = "Enviando...";

  try {
    const res = await fetch("/api/contacto", {
      method: "POST",
      body: new FormData(form),
    });
    const data = await res.json();
    estado.textContent = data.ok ? data.mensaje : data.error;
    if (data.ok) form.reset();
  } catch {
    estado.textContent = "No se pudo enviar. Escríbenos por WhatsApp.";
  } finally {
    boton.disabled = false;
    if (window.turnstile) window.turnstile.reset();
  }
});
```

El `turnstile.reset()` del final importa: los tokens son de un solo uso, así que
sin eso un segundo envío falla.

---

## 6. Probar

**En preview primero.** Haz push a la rama `feat/formulario-contacto`;
Cloudflare genera una URL de preview propia.

Prueba estos casos:

| Caso | Resultado esperado |
|---|---|
| Envío normal | Llega el correo al Gmail del cliente |
| Responder ese correo | Va al visitante, no a ti (por el `reply_to`) |
| Campos vacíos | Mensaje de error, no se envía |
| Correo mal escrito (`abc@`) | Mensaje de error |
| Enviar dos veces seguidas | El segundo también funciona (por el reset) |
| Esperar 6 min sin enviar y luego enviar | Error de verificación expirada |

Cuando todo pase, merge a `main`.

---

## Errores comunes

**"Error de configuración del servidor"**
Faltan las variables de entorno, o se agregaron después del último deploy. Haz
un push nuevo.

**El correo no llega**
Revisa el log del endpoint: dashboard de Pages → **Functions** → **Real-time
logs**. Lo más común es que el dominio no esté verificado en Resend, o que el
`from` no coincida con el dominio verificado.

**"No se pudo verificar que seas una persona"**
El hostname del sitio no está en la lista del widget de Turnstile, o la secret
key no corresponde a ese widget.

**El widget no aparece**
Falta el script de `api.js`, o la site key está mal escrita.

---

## Nota sobre el remitente

El correo sale desde `contacto@geyssonmexicana.com`. Esa dirección **no necesita
existir como buzón** — solo se usa como remitente y las respuestas van al
visitante por el `reply_to`.

Si el cliente además quiere recibir correo en esa dirección, se activa con
**Email Routing** de Cloudflare (gratis), que la reenvía al Gmail. Es
independiente de esto y toma 5 minutos.
