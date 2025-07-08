// @ts-check
import { defineConfig } from 'astro/config';

import solidJs from '@astrojs/solid-js';

import tailwindcss from '@tailwindcss/vite';


import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  integrations: [solidJs()],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.tsx', '.json']
    }
  },

  adapter: vercel(),
});