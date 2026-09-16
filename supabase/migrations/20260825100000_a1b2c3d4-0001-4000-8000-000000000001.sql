-- ============================================================================
-- PHASE 2, STEP 1 — Add the `super_admin` role to the existing app_role enum.
-- ============================================================================
-- This migration is intentionally STANDALONE. PostgreSQL restricts ALTER TYPE
-- ... ADD VALUE: it cannot be combined with other operations in the same
-- transaction, and a freshly-added enum value cannot be referenced inside the
-- same transaction that created it. Keeping it isolated makes the migration
-- safe and re-runnable.
--
-- We reuse the existing public.app_role enum (user / moderator / admin) and
-- only ADD a new value. Existing enum values are preserved; nothing is dropped.

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
