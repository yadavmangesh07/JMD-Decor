import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    chunkSizeWarningLimit: 1000, // Bump to 1000 to be safe
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 1. Separate React core (The biggest part of the vendor)
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-core';
          }
          // 2. Separate UI libraries (Radix, Shadcn dependencies)
          if (id.includes('@radix-ui') || id.includes('lucide-react')) {
            return 'ui-kit';
          }
          // 3. Separate Framer Motion
          if (id.includes('framer-motion')) {
            return 'animations';
          }
          // 4. Everything else in node_modules goes to 'vendor'
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});