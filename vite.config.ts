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
    // Increased to 1500 to stop the nagging warning while we optimize
    chunkSizeWarningLimit: 1500, 
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 1. Core Framework
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('react-router')) {
            return 'framework';
          }
          
          // 2. Lucide Icons (Often a major bloat factor in Shadcn apps)
          if (id.includes('node_modules/lucide-react')) {
            return 'ui-icons';
          }

          // 3. UI & Radix (The bones of your components)
          if (id.includes('@radix-ui') || id.includes('class-variance-authority') || id.includes('clsx')) {
            return 'ui-vendor';
          }
          
          // 4. Heavy Animations
          if (id.includes('framer-motion')) {
            return 'animations';
          }

          // 5. PDF Generation or Heavy Utilities (Targeting the 1.9MB remainder)
          // If you use libraries like jspdf, date-fns, or axios, this pulls them out
          if (id.includes('jspdf') || id.includes('date-fns') || id.includes('axios') || id.includes('tanstack')) {
            return 'utils';
          }

          // 6. General Vendor (The catch-all for remaining small libs)
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});