import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: "window", // Soluciona el problema de 'global is not defined'
  },
  server: {
    allowedHosts: ["all", "localhost"],
    port: 3000,
    proxy: {
      "/api": {
        target:
          "https://serdiappback-hfe8a2f7bgcybacz.eastus-01.azurewebsites.net",
        changeOrigin: true,
      },
    },
  },
});
