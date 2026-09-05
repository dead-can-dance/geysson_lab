/**
 * Endpoint del formulario de contacto — geyssonmexicana.com
 *
 * Ruta pública: POST /api/contacto
 * (Cloudflare Pages mapea functions/api/contacto.js -> /api/contacto)
 *
 * Flujo:
 *   1. Verifica que sea POST
 *   2. Revisa el honeypot (campo oculto que solo los bots llenan)
 *   3. Valida el token de Turnstile contra el Siteverify de Cloudflare
 *   4. Valida los campos del formulario
 *   5. Envía el correo vía Resend
 *
 * Variables de entorno necesarias (Cloudflare Pages > Settings > Environment variables):
 *   TURNSTILE_SECRET_KEY  (secret)
 *   RESEND_API_KEY        (secret)
 *
 * NUNCA poner estos valores en el código ni en el repo.
 */

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const RESEND_URL = "https://api.resend.com/emails";

// Remitente: debe ser un dominio verificado en Resend.
const FROM = "Formulario web <contacto@geyssonmexicana.com>";
// Destinatario: donde el cliente recibe los mensajes.
const TO = "geyssonmexicana33@gmail.com";

const MAX = { nombre: 100, correo: 150, telefono: 30, mensaje: 3000 };

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

/** Escapa HTML para que el contenido del mensaje no pueda inyectar markup en el correo. */
function esc(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function onRequestPost({ request, env }) {
  // --- Leer el cuerpo (acepta form-data o JSON) ---
  let campos;
  try {
    const tipo = request.headers.get("content-type") || "";
    if (tipo.includes("application/json")) {
      campos = await request.json();
    } else {
      const form = await request.formData();
      campos = Object.fromEntries(form.entries());
    }
  } catch {
    return json({ ok: false, error: "No se pudo leer el formulario." }, 400);
  }

  const nombre = (campos.nombre || "").toString().trim();
  const correo = (campos.correo || "").toString().trim();
  const telefono = (campos.telefono || "").toString().trim();
  const mensaje = (campos.mensaje || "").toString().trim();
  const token = (campos["cf-turnstile-response"] || "").toString();
  const honeypot = (campos.empresa_web || "").toString().trim();

  // --- Honeypot: los humanos no ven este campo, los bots sí lo llenan ---
  // Responde 200 a propósito, para que el bot crea que funcionó y no reintente.
  if (honeypot) {
    return json({ ok: true, mensaje: "Gracias por tu mensaje." });
  }

  // --- Validación de campos ---
  if (!nombre || !correo || !mensaje) {
    return json({ ok: false, error: "Faltan datos obligatorios." }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return json({ ok: false, error: "El correo no parece válido." }, 400);
  }
  if (
    nombre.length > MAX.nombre ||
    correo.length > MAX.correo ||
    telefono.length > MAX.telefono ||
    mensaje.length > MAX.mensaje
  ) {
    return json({ ok: false, error: "Alguno de los campos es demasiado largo." }, 400);
  }

  // --- Validación de Turnstile (obligatoria: el widget solo no protege nada) ---
  if (!env.TURNSTILE_SECRET_KEY) {
    console.error("Falta TURNSTILE_SECRET_KEY en las variables de entorno");
    return json({ ok: false, error: "Error de configuración del servidor." }, 500);
  }
  if (!token) {
    return json({ ok: false, error: "Falta la verificación anti-spam." }, 400);
  }

  const verificacion = new FormData();
  verificacion.append("secret", env.TURNSTILE_SECRET_KEY);
  verificacion.append("response", token);
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) verificacion.append("remoteip", ip);

  let resultado;
  try {
    const r = await fetch(SITEVERIFY_URL, { method: "POST", body: verificacion });
    resultado = await r.json();
  } catch (e) {
    console.error("Error llamando a siteverify:", e);
    return json({ ok: false, error: "No se pudo verificar el envío. Intenta de nuevo." }, 502);
  }

  if (!resultado.success) {
    // timeout-or-duplicate = token expirado (5 min) o ya usado
    const codigos = resultado["error-codes"] || [];
    const expirado = codigos.includes("timeout-or-duplicate");
    return json(
      {
        ok: false,
        error: expirado
          ? "La verificación expiró. Recarga la página e intenta de nuevo."
          : "No se pudo verificar que seas una persona. Intenta de nuevo.",
      },
      403
    );
  }

  // --- Enviar el correo ---
  if (!env.RESEND_API_KEY) {
    console.error("Falta RESEND_API_KEY en las variables de entorno");
    return json({ ok: false, error: "Error de configuración del servidor." }, 500);
  }

  const html = `
    <h2>Nuevo mensaje desde geyssonmexicana.com</h2>
    <p><strong>Nombre:</strong> ${esc(nombre)}</p>
    <p><strong>Correo:</strong> ${esc(correo)}</p>
    ${telefono ? `<p><strong>Teléfono:</strong> ${esc(telefono)}</p>` : ""}
    <hr>
    <p><strong>Mensaje:</strong></p>
    <p style="white-space:pre-wrap">${esc(mensaje)}</p>
  `;

  try {
    const envio = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: correo, // así el cliente puede responder directo al visitante
        subject: `Contacto web: ${nombre}`,
        html,
      }),
    });

    if (!envio.ok) {
      const detalle = await envio.text();
      console.error("Resend respondió con error:", envio.status, detalle);
      return json(
        { ok: false, error: "No se pudo enviar el mensaje. Escríbenos por WhatsApp." },
        502
      );
    }
  } catch (e) {
    console.error("Error enviando con Resend:", e);
    return json(
      { ok: false, error: "No se pudo enviar el mensaje. Escríbenos por WhatsApp." },
      502
    );
  }

  return json({ ok: true, mensaje: "Gracias por tu mensaje. Te contactaremos pronto." });
}

/** Cualquier método que no sea POST. */
export async function onRequest({ request }) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Método no permitido." }, 405);
  }
}
