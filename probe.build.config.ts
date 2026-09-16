import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@/integrations/supabase/client": path.resolve("src/components/admin/__mock_supabase.ts"),
    },
  },
  build: {
    outDir: "probe-dist",
    rollupOptions: {
      input: path.resolve("probe-standalone.html"),
    },
  },
});
