import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  server: {
    port: 3000,
    allowedHosts: true,
    cors: true,
    strictPort: false,
    // Same-origin API: cookies the gateway sets land on the page's own host
    // (localhost vs company.<id>.localhost), which the session model relies on.
    proxy: {
      "/api": {
        target: "http://localhost:7000",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
