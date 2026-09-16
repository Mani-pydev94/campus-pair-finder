-- ============================================================================
-- PHASE 2, STEPS 2 & 3 — permissions + role_permissions schema.
-- ============================================================================
-- We reuse the existing foundation (public.app_role enum, public.user_roles).
-- We do NOT create a second role/assignment table. The flow is:
--
--   user_roles (role)  ->  role_permissions (permission_id)  ->  permissions
--
-- Application authorization should eventually check permissions (via
-- public.has_permission) rather than scattering `role = 'admin'` checks.

-- ---------------------------------------------------------------------------
-- permissions: explicit catalog of permission records (not a generic JSON blob).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.permissions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text NOT NULL UNIQUE,
  description text,
  category    text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- role_permissions: maps each application role (from app_role) to permissions.
-- `role` references the EXISTING app_role enum — no second role table.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role          public.app_role NOT NULL,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role, permission_id)
);

-- ---------------------------------------------------------------------------
-- Grants. Authenticated clients may read definitions; only service_role may
-- write. Ordinary users never get INSERT/UPDATE/DELETE on these tables.
-- ---------------------------------------------------------------------------
GRANT SELECT ON public.permissions TO authenticated;
GRANT ALL   ON public.permissions TO service_role;

GRANT SELECT ON public.role_permissions TO authenticated;
GRANT ALL   ON public.role_permissions TO service_role;

-- ---------------------------------------------------------------------------
-- RLS. Enable on both tables.
-- ---------------------------------------------------------------------------
ALTER TABLE public.permissions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- NOTE: No SELECT policy is created here on purpose.
-- With RLS enabled and no SELECT policy, Postgres denies ALL reads for
-- authenticated users by default (a secure-by-default posture). The
-- application does NOT query permissions / role_permissions directly (verified
-- by code search), so there is no reason to expose the full role→permission
-- mapping to every authenticated user. Authorization should go through
-- public.has_permission(...).
--
-- The restricted read policy (super_admin only, via 'users.assign_role') is
-- added in the migration that defines has_permission() (the 0004 file),
-- because a policy cannot safely reference a function that does not yet exist
-- in the same applied order.
