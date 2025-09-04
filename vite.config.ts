import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    // Configuração para servir assets estáticos corretamente
    fs: {
      allow: ['..']
    },
    // Configuração para servir arquivos estáticos
    middlewareMode: false,
    // Headers para CORS
    cors: true
  },
  plugins: [
    react(),
    // Reabilitar componentTagger em desenvolvimento
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
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
        assetFileNames: 'assets/[name].[hash][extname]'
      }
    }
  },
  // Configuração para servir arquivos estáticos em desenvolvimento
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
}));