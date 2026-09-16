import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import path from "node:path";

export default defineConfig({
  tanstackStart: { server: { entry: "server" } },
  resolve: {
    alias: {
      "@/integrations/supabase/client": path.resolve("src/components/admin/__mock_supabase.ts"),
    },
  },
  server: { port: 5181 },
});
