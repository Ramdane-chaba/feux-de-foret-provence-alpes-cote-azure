import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// base relative : le dossier dist/ s'ouvre depuis n'importe quel sous-dossier d'un serveur statique.
export default defineConfig({
  base: "./",
  plugins: [react()],
  server: { port: 5173 },
});
