import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.OSINT_WEB_PORT) || 5180,
    proxy: {
      // OSINT_API permet de pointer une instance jetable sans toucher aux donnees reelles
      '/api': process.env.OSINT_API || 'http://localhost:8787',
      '/files': process.env.OSINT_API || 'http://localhost:8787',
    },
  },
});
