import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/' : '/',
  server: {
    host: "::",
    port: 8081, // Change this to 8081
    proxy: {
      '/api': {
        target: `https://${process.env.VITE_API_HOST ?? 'sociodent-till-whatsapp.onrender.com'}`,
        changeOrigin: true,
        secure: true
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['twilio']
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['twilio']
    }
  }
}));
