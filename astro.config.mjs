// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import vercelAdapter from '@astrojs/vercel';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  site: "https://ayush.devian.in",
  integrations: [sitemap({
    changefreq: "daily",
    priority: 1.0,
    lastmod: new Date()
  })],
  adapter: cloudflare()
});