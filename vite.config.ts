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
    },
    // Proxy para resolver CORS com dados oficiais do Habbo
    proxy: {
      '/api/habbo': {
        target: 'https://www.habbo.com.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/habbo/, ''),
        // Logs removidos para melhor performance em desenvolvimento
      }
    },
    // OTIMIZAÇÃO: Não assistir arquivos estáticos pesados
    watch: {
      ignored: [
        '**/public/handitems/**',
        '**/public/assets/pets-sprites/**',
        '**/node_modules/**',
        '**/.git/**'
      ]
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
  // OTIMIZAÇÃO: Configuração para desenvolvimento
  optimizeDeps: {
    include: [
      'react', 
      'react-dom',
      '@tanstack/react-query',
      'react-router-dom'
    ],
    // Forçar pré-bundling de dependências pesadas
    force: false,
    // Não escanear node_modules desnecessariamente
    entries: ['./src/main.tsx']
  },
  // OTIMIZAÇÃO: Configurações de performance
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode)
  },
  // OTIMIZAÇÃO: Cache agressivo em desenvolvimento
  cacheDir: '.vite'
}));