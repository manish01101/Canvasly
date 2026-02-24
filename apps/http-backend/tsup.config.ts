import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  outDir: "dist",
  // Bundle everything including workspace packages (@repo/*)
  // This is the key setting — it inlines all local packages into dist/index.js
  // so the runner image needs zero node_modules at runtime
  bundle: true,
  // Don't bundle heavy native/binary packages — let Node resolve these normally
  // These are kept as external so they're still resolved from node_modules
  external: [
    "bcrypt", // native addon
    "prisma",
    "@prisma/client",
  ],
  // Remove console logs and debugger statements in production
  minify: false, // keep readable for now; set true when stable
  sourcemap: false,
  clean: true, // wipe dist/ before each build
  target: "node20",
});
