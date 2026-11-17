import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "Witchy Ledger",
        short_name: "Witchy",
        lang: "th",
        start_url: "/",
        display: "standalone",
        background_color: "#FAF8FF",
        theme_color: "#8E7BCB",
        icons: [
          {
            src: "/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff2,svg,png}"],
        maximumFileSizeToCacheInBytes: 4000000,
      },
    }),
  ],
});
