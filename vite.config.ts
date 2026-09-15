import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    // Kept as "build" (CRA's output dir) so existing Vercel project settings keep working
    outDir: 'build',
  },
});
