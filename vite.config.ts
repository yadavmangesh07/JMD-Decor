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
    // 1. Increase the limit slightly so it's less sensitive
    chunkSizeWarningLimit: 800, 
    
    rollupOptions: {
      output: {
        // 2. Advanced Chunk Splitting
        manualChunks(id) {
          // Group Lucide icons into their own file
          if (id.includes('lucide-react')) {
            return 'ui-icons';
          }
          // Group Framer Motion (heavy) into its own file
          if (id.includes('framer-motion')) {
            return 'animations';
          }
          // Group core React vendor files
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});