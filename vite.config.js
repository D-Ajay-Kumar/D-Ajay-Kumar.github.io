import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: [
        resolve(__dirname, "index.html"),
        resolve(__dirname, "blog.html"),
        resolve(__dirname, "projects.html"),
        resolve(__dirname, "resume.html"),
        resolve(__dirname, "skills.html"),
      ],
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
