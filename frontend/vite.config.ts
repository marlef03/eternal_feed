import fs from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "file-giver",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith("/media")) {
            const filePath = path.resolve(req.url);

            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              const fileContent = fs.readFileSync(filePath);
              res.writeHead(200);
              res.end(fileContent);
              return;
            }
          }
          next();
        });
      },
    },
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: true,
    },
    proxy: {
      "/api": {
        target: "http://backend:8000",
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      allow: ["/media", "."],
    },
  },
});
