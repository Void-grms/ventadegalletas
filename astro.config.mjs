import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// El puerto lo asigna Railway vía la variable de entorno PORT.
// En local cae a 4321. Aplica a `astro dev` y `astro preview`.
export default defineConfig({
  server: {
    port: Number(process.env.PORT) || 4321,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
