import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "client",
  server: {
    host: "0.0.0.0",
    proxy: { "/api": process.env.API_PROXY_TARGET || "http://localhost:3001" },
  },
  build: { outDir: "../dist/client", emptyOutDir: true },
});
