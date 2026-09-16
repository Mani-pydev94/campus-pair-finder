import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Lightweight admin status check for user-facing pages.
 *
 * This mirrors the authorization query in `useAdminGuard()` (same `user_roles`
 * table in Supabase) but — unlike the guard — it has **no side effects**:
 * no redirect to /login, no "Access Denied" screen. It simply reports whether
 * the current session user is an admin or super admin so that user-facing UI
 * can conditionally render an admin entry-point link.
 *
 * All real authorization enforcement still lives in the database RLS policies
 * on the admin area. This front-end check is purely for hiding/revealing the
 * link based on the user_roles table.
 */
export function useAdminStatus(): {
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
} {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        if (active) {
          setLoading(false);
          setIsAdmin(false);
          setIsSuperAdmin(false);
        }
        return;
      }

      const userId = sessionData.session.user.id;

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (!active) return;

      const roles = ((data ?? []).map((r) => r.role) as Array<
        "user" | "moderator" | "admin" | "super_admin"
      >) ?? [];

      const superAdmin = roles.includes("super_admin");
      const admin = superAdmin || roles.includes("admin");

      setIsSuperAdmin(superAdmin);
      setIsAdmin(admin);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  return { loading, isAdmin, isSuperAdmin };
}
