import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'build/client',  // Tell Vite to output files to build/client
    emptyOutDir: true        // Clean the output directory before each build
  },
});
