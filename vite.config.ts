import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), react(), cloudflare()],
  server: { port: 5173 },
  environments: {
    client: {
      build: {
        rollupOptions: { input: { main: 'index.html', offline: 'offline.html' } },
      },
    },
  },
});
