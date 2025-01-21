import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import path from "path";
import mkcert from "vite-plugin-mkcert";

const now = new Date();

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact(), mkcert()],
  server: {
    host: "tms-dev.local",
    port: 443,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    COPYRIGHT: JSON.stringify(
      `v${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}${now.getHours()}${now.getMinutes()}`
    ),
  },
});
