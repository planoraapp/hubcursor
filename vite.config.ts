import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 3000,
    host: true,
    open: false,
    cors: true,
    hmr: {
      port: 3000
    },
    fs: {
      allow: ['..']
    }
  },
  plugins: [
    react({
      fastRefresh: true
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  publicDir: 'public',
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', '@tanstack/react-query'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  },
  // Configuração simplificada para desenvolvimento
  optimizeDeps: {
    include: [
      'react', 
      'react-dom',
      '@tanstack/react-query',
      'react-router-dom'
    ]
  },
  // Configurações de performance
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode)
  }
}));