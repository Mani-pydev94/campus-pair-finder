-- ============================================================================
-- Admin user-profile editing — minimum RLS policies.
--
-- Background: the existing UPDATE / INSERT policies on profiles and
-- academic_profiles are scoped to the row owner (USING/WITH CHECK auth.uid() = id).
-- An admin editing ANOTHER user's profile therefore fails the ownership check and
-- the write is silently blocked by RLS. This admin feature needs an admin-specific
-- write path.
--
-- We reuse the project's established authorization primitive:
--   public.has_permission(auth.uid(), 'users.edit')
-- which mirrors exactly how 'users.assign_role' gates role writes. The permission
-- 'users.edit' is already seeded to the 'admin' role (and super_admin inherits
-- every permission), so this grants precisely the set of authorized editors the
-- app's role model already defines — NO new roles, NO weakening of existing
-- security, and user_roles / events are left entirely untouched.
--
-- Granted: UPDATE + INSERT (so an admin can also create a missing academic row).
-- NOT granted: DELETE. RLS stays enabled on both tables.
-- ============================================================================

CREATE POLICY "Admins can edit any user's profile"
ON public.profiles FOR UPDATE TO authenticated
USING     (public.has_permission(auth.uid(), 'users.edit'))
WITH CHECK (public.has_permission(auth.uid(), 'users.edit'));

CREATE POLICY "Admins can create profile rows for users"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (public.has_permission(auth.uid(), 'users.edit'));

CREATE POLICY "Admins can edit any user's academic profile"
ON public.academic_profiles FOR UPDATE TO authenticated
USING     (public.has_permission(auth.uid(), 'users.edit'))
WITH CHECK (public.has_permission(auth.uid(), 'users.edit'));

CREATE POLICY "Admins can create academic profile rows for users"
ON public.academic_profiles FOR INSERT TO authenticated
WITH CHECK (public.has_permission(auth.uid(), 'users.edit'));
