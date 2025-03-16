/// <reference types="vitest" />
import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
    environment: "jsdom",
    include: ["app/**/*.test.{ts,tsx}"],
    setupFiles: "./vitest.setup.ts",
    env: {
      SPOTIFY_CLIENT_ID: "SPOTIFY_CLIENT_ID",
    },
  },
});
