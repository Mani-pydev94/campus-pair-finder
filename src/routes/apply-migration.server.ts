// Server-side function to apply migration
// This file is NOT imported by client code (tree-shaken)
import { createServerFn } from "@tanstack/react-start";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { supabase } from "@/integrations/supabase/client";
import { applyQuestionnaireResponsesMigration, verifyMigration } from "@/integrations/supabase/applyMigration.server";

export const applyMigrationFn = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth])
  .handler(async ({ context }) => {
    // The middleware attaches the user session, get user from context
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return { ok: false as const, error: "Unauthorized" };
    }

    // Check if super_admin
    const { data: isSuper } = await supabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "super_admin",
    });
    if (!isSuper) {
      return { ok: false as const, error: "Only super_admin can apply migration" };
    }

    // Apply migration
    const result = await applyQuestionnaireResponsesMigration();
    if (!result.ok) {
      return { ok: false as const, error: result.error, details: result.details };
    }

    // Verify
    const verify = await verifyMigration();
    return { ok: true as const, error: null, details: result.details, verify };
  });