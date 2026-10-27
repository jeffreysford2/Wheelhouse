import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // The pipeline writes to the repo-level public/ folder (see the plan's
  // layout), so the site serves its static files from there.
  publicDir: "../public",
  server: { port: 5173 },
});
