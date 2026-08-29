// SERVER-ONLY module. Do NOT import this from client-bundle code.
//
// Why a .server.ts module: the browser bundle must never see the service-role
// key. This file is tree-shaken out of the client by TanStack Start/Vite's
// `.server` convention, so `supabaseAdmin` (service role, bypasses RLS) can be
// used safely to delete a Supabase Auth user — the one operation the anon
// (RLS) client cannot perform because auth.users has no user-writable DELETE
// policy by design.
//
// Authorization is RE-CHECKED here even though the UI also gates on
// `isSuperAdmin`. Defense in depth: never trust the client. The check mirrors
// the existing role-assignment gate (users.assign_role == super_admin only),
// so role/permission security is unchanged.
import { supabaseAdmin } from "./client.server";
import { supabase } from "./client";

export async function adminDeleteUser(
  requesterId: string,
  targetUserId: string,
): Promise<{ ok: boolean; error: string | null }> {
  // 1) Authorize: requester must hold the super_admin-gated permission
  //    (users.assign_role, granted to super_admin only). has_permission() is
  //    SECURITY DEFINER and bypasses RLS on its lookup tables, so this is safe
  //    to run even though user_roles is RLS-guarded. This reuses the EXISTING
  //    role security — no new permissions are added to the database.
  const { data: canDelete, error: permErr } = await supabaseAdmin.rpc(
    "has_permission",
    { _user_id: requesterId, _permission: "users.assign_role" },
  );

  if (permErr) {
    return { ok: false, error: `Authorization check failed: ${permErr.message}` };
  }
  if (!canDelete) {
    return { ok: false, error: "Only a super admin can delete users." };
  }

  // 2) Never let an admin delete their own Auth identity from the UI.
  if (requesterId === targetUserId) {
    return { ok: false, error: "You cannot delete your own account." };
  }

  // 3) Delete the Auth user. All dependent rows in profiles,
  //    academic_profiles, user_roles, questionnaire_responses cascade away
  //    via ON DELETE CASCADE FKs on auth.users(id).
  const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(
    targetUserId,
  );

  if (delErr) {
    return { ok: false, error: `Failed to delete user: ${delErr.message}` };
  }

  return { ok: true, error: null };
}

// Client-side guard mirror (runs in the browser with the anon client).
// Returns true if the current session's user is a super admin. This drives the
// UI, but the authoritative gate is adminDeleteUser() above (service role).
export async function isSuperAdminSession(): Promise<boolean> {
  const requesterId = (await supabase.auth.getUser()).data.user?.id;
  if (!requesterId) return false;
  const { data, error } = await supabase.rpc("has_permission", {
    _user_id: requesterId,
    _permission: "users.assign_role",
  });
  if (error) return false;
  return Boolean(data);
}
