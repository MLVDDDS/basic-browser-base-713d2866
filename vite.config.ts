import { defineConfig } from "vite";
import path from "path";

// Keep Vite config dependency-light to avoid native/plugin install issues in this environment.
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
