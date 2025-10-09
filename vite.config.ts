// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const repoName = "CarbonSense-v4"; // ✅ correct variable

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? `/${repoName}/` : "/",
  server: {
    host: "0.0.0.0",
    port: 8080,
  },
  build: {
    outDir: "docs", // ✅ ensures GitHub Pages deploys from /docs
    emptyOutDir: true, // cleans old files before each build
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
