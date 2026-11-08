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
    // three.js alone is ~700 kB minified; the chunks below are split on purpose
    chunkSizeWarningLimit: 800,
    rolldownOptions: {
      output: {
        // Libraries go in their own long-lived chunks, so a deploy that only changes app code
        // doesn't make returning visitors download three.js and React again (assets are cached immutably).
        codeSplitting: {
          groups: [
            {
              name: 'three',
              test: /node_modules[\\/]three[\\/]/,
              priority: 2,
            },
            {
              name: 'vendor',
              // The Gaussian splat viewer is loaded on demand; keep it out of the up-front chunk
              test: (id: string) => /node_modules[\\/]/.test(id) && !/gaussian-splats-3d/.test(id),
              priority: 1,
            },
          ],
        },
      },
    },
  },
});
