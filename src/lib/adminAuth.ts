import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "user" | "moderator" | "admin" | "super_admin";

export type AdminGuardState = {
  checking: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  roles: AppRole[];
  userId: string | null;
  adminName: string | null;
  adminAvatar: string | null;
};

const initial: AdminGuardState = {
  checking: true,
  isAdmin: false,
  isSuperAdmin: false,
  roles: [],
  userId: null,
  adminName: null,
  adminAvatar: null,
};

export const AdminContext = createContext<AdminGuardState | null>(null);

/**
 * Read the current admin context. Must be called inside <AdminLayout>.
 */
export function useAdmin(): AdminGuardState {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within <AdminLayout>");
  return ctx;
}

/**
 * Front-end authorization guard for admin areas.
 *
 * This only decides what UI to show. All real enforcement still lives in the
 * database RLS policies (user_roles writes require the `users.assign_role`
 * permission = super_admin). A non-admin is shown an access-denied screen and
 * a non-authenticated visitor is redirected to /login. We never weaken RLS or
 * attempt writes that the policy would reject silently.
 */
export function useAdminGuard(): AdminGuardState {
  const navigate = useNavigate();
  const [state, setState] = useState<AdminGuardState>(initial);

  useEffect(() => {
    let active = true;

    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        navigate({ to: "/login" });
        return;
      }

      const userId = sessionData.session.user.id;

      const [rolesRes, profileRes] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", userId),
        supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("id", userId)
          .maybeSingle(),
      ]);

      if (!active) return;

      const roles = ((rolesRes.data ?? []).map((r) => r.role) as AppRole[]) ?? [];
      const isSuperAdmin = roles.includes("super_admin");
      const isAdmin = isSuperAdmin || roles.includes("admin");

      setState({
        checking: false,
        isAdmin,
        isSuperAdmin,
        roles,
        userId,
        adminName: profileRes.data?.display_name ?? null,
        adminAvatar: profileRes.data?.avatar_url ?? null,
      });
    })();

    return () => {
      active = false;
    };
  }, [navigate]);

  return state;
}
