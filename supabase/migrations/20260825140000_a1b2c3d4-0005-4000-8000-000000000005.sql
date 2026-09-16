-- ============================================================================
-- PHASE 2, STEP 8 — Restrict role assignment to super_admin.
-- ============================================================================
-- Current state (from investigation):
--   * "Authenticated users can view roles"  USING (true)   -> SELECT (kept)
--   * "Admins can manage roles"             has_role(..,'admin') -> ALL
--
-- Intended final behavior:
--   user / moderator : cannot manage roles
--   admin            : cannot assign roles (no users.assign_role)
--   super_admin      : can assign roles
--
-- We REPLACE the "Admins can manage roles" ALL-policy with one that requires
-- permission 'users.assign_role', which (per the seed above) is granted to
-- super_admin ONLY. This prevents privilege escalation by ordinary admins and
-- stops any user from modifying their own role, while preserving the existing
-- SELECT policy that the application relies on for role reads.
--
-- The existing "Admins can manage roles" policy is dropped and immediately
-- replaced — this is a policy REPLACEMENT, not an unprotected DROP.
-- Existing event policies still use has_role(auth.uid(),'admin') and are
-- intentionally left untouched (see Step 9).

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Super admins can manage roles"
ON public.user_roles FOR ALL TO authenticated
USING     (public.has_permission(auth.uid(), 'users.assign_role'))
WITH CHECK (public.has_permission(auth.uid(), 'users.assign_role'));
