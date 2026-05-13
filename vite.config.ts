import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 3000,
    open: false,
  },

  build: {
    // Raise the warning threshold slightly — we track bundle size manually
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core framework — changes never, cache forever
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Server state
          "vendor-query": ["@tanstack/react-query"],
          // Animation
          "vendor-motion": ["framer-motion"],
          // ── Future chunks — uncomment when the phase installs the package ──
          // Phase 11: "vendor-charts": ["recharts"],
          // Phase 13: "vendor-livekit": ["livekit-client", "@livekit/components-react"],
          // Phase 13: "vendor-stream":  ["stream-chat", "stream-chat-react"],
        },
      },
    },
  },

  // Suppress Vite's default overlay for TypeScript errors in dev
  // We use the terminal + IDE instead
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
});
