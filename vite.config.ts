import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 3000,
    host: true,
    open: false, // Desabilitar auto-open para acelerar
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
  // Configuração para assets públicos
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
  // Configuração simplificada para evitar problemas de otimização
  optimizeDeps: {
    include: [
      'react', 
      'react-dom',
      '@tanstack/react-query',
      'react-router-dom',
      'lucide-react',
      '@supabase/supabase-js'
    ],
    exclude: [
      'sonner',
      '@radix-ui/react-popover',
      '@radix-ui/react-select', 
      '@radix-ui/react-avatar'
    ],
    force: false // Desabilitar força para evitar problemas
  },
  // Configurações de performance
  esbuild: {
    target: 'esnext'
  }
}));