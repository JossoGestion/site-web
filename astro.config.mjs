import { defineConfig } from 'astro/config';

// Site statique : aucune île, aucun framework UI.
// Astro sert ici de moteur de composants et de build.
export default defineConfig({
  site: 'https://www.jossogestion.com',
  build: { format: 'file' },   // /mentions-legales.html plutôt que /mentions-legales/
  compressHTML: true,
});
