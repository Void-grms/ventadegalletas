import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// El puerto lo asigna Railway vía la variable de entorno PORT.
// En local cae a 4321. Aplica a `astro dev` y `astro preview`.
export default defineConfig({
  server: {
    port: Number(process.env.PORT) || 4321,
  },
  vite: {
    // El servidor `preview` de Vite bloquea hosts desconocidos (anti DNS-rebinding).
    // Solo servimos archivos estáticos de dist/, así que permitimos cualquier host
    // para que funcione tras el dominio de Railway (o un dominio propio).
    preview: {
      allowedHosts: true,
    },
    plugins: [tailwindcss()],
  },
});
