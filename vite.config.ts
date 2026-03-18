import fs from "node:fs";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

function readEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};
  const result: Record<string, string> = {};
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    if (!rawLine || rawLine.trimStart().startsWith("#")) continue;
    const eqIndex = rawLine.indexOf("=");
    if (eqIndex < 1) continue;
    const key = rawLine.slice(0, eqIndex).trim();
    let value = rawLine.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, path.resolve(__dirname, ".."), "");
  const frontendLocalEnv = readEnvFile(
    path.resolve(__dirname, "../config/env/local/.env.frontend.local")
  );
  const mergedEnv = {
    ...rootEnv,
    ...frontendLocalEnv,
  };
  const defineEnv = Object.fromEntries(
    Object.entries(mergedEnv)
      .filter(([key]) => key.startsWith("VITE_"))
      .map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)])
  );

  return {
    server: {
      host: "::",
      port: 8899,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: defineEnv,
    build: {
      chunkSizeWarningLimit: 800,
    },
  };
});
