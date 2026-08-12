// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Dominio sugerido por el cliente, aún por confirmar registro/DNS
// (PROJECT_BRIEF.md sección 8). Actualizar antes de publicar.
const SITE_URL = 'https://geyssonmexicana.com';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()]
  }
});