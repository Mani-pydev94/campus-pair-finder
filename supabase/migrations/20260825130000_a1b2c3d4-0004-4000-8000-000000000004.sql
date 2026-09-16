-- ============================================================================
-- PHASE 2, STEP 6 — public.has_permission(_user_id, _permission).
-- ============================================================================
-- Returns true when the user holds the requested permission through any of
-- their assigned roles (user_roles -> role_permissions -> permissions).
--
-- Safe pattern mirrors the existing public.has_role():
--   * LANGUAGE sql, STABLE          (pure read, no writes)
--   * SECURITY DEFINER             (runs as the table owner, bypasses RLS so
--                                  the joins below do NOT trigger recursive
--                                  RLS evaluation against role_permissions /
--                                  user_roles / permissions)
--   * SET search_path = public     (no schema-injection via search_path)
--
-- Because the function is SECURITY DEFINER and owned by the database owner,
-- the internal SELECT bypasses RLS on the referenced tables. This is exactly
-- how the existing has_role() safely queries user_roles from within a policy
-- on user_roles — so there is NO circular RLS/function dependency.

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    JOIN public.permissions p       ON p.id  = rp.permission_id
    WHERE ur.user_id = _user_id
      AND p.key      = _permission
  )
$$;

-- ---------------------------------------------------------------------------
-- Privilege hardening: the function must never be callable by anon/public.
-- Mirror the existing has_role grant/revoke migration.
-- ---------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Restricted READ access for permissions / role_permissions.
--
-- The application authorizes through has_permission() and does NOT need to read
-- these tables directly (confirmed by code search: no frontend references
-- "permissions" or "role_permissions"). Rather than exposing the full
-- role→permission mapping to every authenticated user, SELECT is limited to
-- administrators who hold 'users.assign_role' — i.e. super_admin ONLY.
--
-- No recursion: has_permission() is SECURITY DEFINER and bypasses RLS on the
-- tables it joins (user_roles, role_permissions, permissions), so evaluating
-- this policy does not re-trigger RLS on role_permissions/permissions.
-- ---------------------------------------------------------------------------
CREATE POLICY "Super admins can view permissions"
ON public.permissions FOR SELECT TO authenticated
USING (public.has_permission(auth.uid(), 'users.assign_role'));

CREATE POLICY "Super admins can view role permissions"
ON public.role_permissions FOR SELECT TO authenticated
USING (public.has_permission(auth.uid(), 'users.assign_role'));
