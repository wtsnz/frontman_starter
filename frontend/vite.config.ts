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
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
});
