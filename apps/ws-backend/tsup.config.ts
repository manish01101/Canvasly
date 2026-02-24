import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  outDir: "dist",
  // Bundle everything including workspace packages (@repo/*)
  // This inlines all local packages into dist/index.js
  bundle: true,
  // Keep native/binary packages external so Node resolves them from node_modules
  external: [
    "ws", // has native fallbacks, safer to keep external
    "@prisma/client",
    "prisma",
  ],
  minify: false,
  sourcemap: false,
  clean: true,
  target: "node20",
});
