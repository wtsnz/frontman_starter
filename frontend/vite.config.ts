import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";

const backend = process.env.BACKEND_URL || "http://127.0.0.1:4000";
export default defineConfig({
  plugins: [
    tailwind(),
    tanstackStart(),
    nitro({
      preset: "node-server",
      devProxy: {
        "/rpc/**": { target: backend, changeOrigin: true },
        "/auth/**": { target: backend, changeOrigin: true },
        "/health/**": { target: backend, changeOrigin: true },
      },
    }),
    react(),
  ],
  environments: {
    client: {
      optimizeDeps: {
        // Start's excluded packages expose these imports during hydration.
        // Bundle them up front so the first page doesn't trigger a reload.
        include: [
          "@tanstack/history",
          "@tanstack/router-core",
          "@tanstack/router-core/ssr/client",
          "@tanstack/router-core/ssr/server",
          "h3-v2",
          "seroval",
        ],
      },
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
});
