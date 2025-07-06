import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const buildForExtension = process.env.BUILD_FOR_EXTENSION === "1";

// https://vite.dev/config/
export default defineConfig({
  base: buildForExtension ? "/toolkit/" : "/",
  plugins: [react(), tailwindcss()],
  define: {
    "process.env": JSON.stringify({}),
    "process.stdout": JSON.stringify({}),
    "process.stderr": JSON.stringify({}),
    "process.platform": JSON.stringify("browser"),
    'process.argv': JSON.stringify([]),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
