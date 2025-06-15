import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
   server: {
    host: '0.0.0.0',     // 👈 bind to all interfaces
    port: 4173,          // optional, default is 5173
  },
});
