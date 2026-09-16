-- ============================================================================
-- PHASE 2, STEPS 4 & 5 — Idempotent seed of permissions + role→permission maps.
-- ============================================================================
-- All writes below use ON CONFLICT DO NOTHING so the migration is safe to
-- re-apply. No existing data is deleted or modified.

-- ---------------------------------------------------------------------------
-- Step 4: initial permission catalog.
-- ---------------------------------------------------------------------------
INSERT INTO public.permissions (key, description, category) VALUES
  -- Users
  ('users.view',          'View user accounts',                         'users'),
  ('users.edit',          'Edit user account details',                  'users'),
  ('users.disable',       'Disable or ban user accounts',               'users'),
  ('users.assign_role',   'Assign and revoke user roles (super admin)', 'users'),
  -- Universities
  ('universities.view',   'View universities',                          'universities'),
  ('universities.create', 'Create universities',                        'universities'),
  ('universities.edit',   'Edit universities',                          'universities'),
  ('universities.delete', 'Delete universities',                        'universities'),
  -- Fields of study
  ('fields_of_study.view',   'View fields of study',                    'fields_of_study'),
  ('fields_of_study.create', 'Create fields of study',                  'fields_of_study'),
  ('fields_of_study.edit',   'Edit fields of study',                    'fields_of_study'),
  ('fields_of_study.delete', 'Delete fields of study',                  'fields_of_study'),
  -- Skills
  ('skills.view',   'View skills catalog',                              'skills'),
  ('skills.create', 'Create skills',                                    'skills'),
  ('skills.edit',   'Edit skills',                                      'skills'),
  ('skills.delete', 'Delete skills',                                    'skills'),
  -- Degrees
  ('degrees.view',   'View degrees',                                    'degrees'),
  ('degrees.create', 'Create degrees',                                  'degrees'),
  ('degrees.edit',   'Edit degrees',                                    'degrees'),
  ('degrees.delete', 'Delete degrees',                                  'degrees'),
  -- Interests
  ('interests.view',   'View interests',                                'interests'),
  ('interests.create', 'Create interests',                              'interests'),
  ('interests.edit',   'Edit interests',                                'interests'),
  ('interests.delete', 'Delete interests',                              'interests'),
  -- Events
  ('events.view',   'View events',                                      'events'),
  ('events.create', 'Create events',                                    'events'),
  ('events.edit',   'Edit events',                                      'events'),
  ('events.delete', 'Delete events',                                    'events'),
  -- Communities
  ('communities.view',     'View communities',                          'communities'),
  ('communities.create',   'Create communities',                        'communities'),
  ('communities.edit',     'Edit communities',                          'communities'),
  ('communities.delete',   'Delete communities',                        'communities'),
  ('communities.moderate', 'Moderate community content',                'communities'),
  -- Matching
  ('matching.view',      'View matching configuration',                 'matching'),
  ('matching.configure', 'Configure matching engine',                  'matching'),
  -- Settings
  ('settings.view', 'View application settings',                        'settings'),
  ('settings.edit', 'Edit application settings',                        'settings'),
  -- Analytics
  ('analytics.view', 'View analytics',                                  'analytics')
ON CONFLICT (key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Step 5: default role → permission mappings.
--
--   user        -> no administrative permissions.
--   moderator   -> event + community moderation.
--   admin       -> most operational permissions, but NOT users.assign_role.
--   super_admin -> every permission.
--
-- users.assign_role is intentionally granted to super_admin ONLY, so an admin
-- cannot escalate users (or themselves) into higher roles.
-- ---------------------------------------------------------------------------

-- moderator
INSERT INTO public.role_permissions (role, permission_id)
SELECT r.role, p.id
FROM (VALUES
  ('moderator'::app_role, 'events.view'),
  ('moderator'::app_role, 'events.create'),
  ('moderator'::app_role, 'events.edit'),
  ('moderator'::app_role, 'events.delete'),
  ('moderator'::app_role, 'communities.view'),
  ('moderator'::app_role, 'communities.moderate')
) AS r(role, pkey)
JOIN public.permissions p ON p.key = r.pkey
ON CONFLICT (role, permission_id) DO NOTHING;

-- admin
INSERT INTO public.role_permissions (role, permission_id)
SELECT r.role, p.id
FROM (VALUES
  ('admin'::app_role, 'users.view'),
  ('admin'::app_role, 'users.edit'),
  ('admin'::app_role, 'users.disable'),

  ('admin'::app_role, 'universities.view'),
  ('admin'::app_role, 'universities.create'),
  ('admin'::app_role, 'universities.edit'),
  ('admin'::app_role, 'universities.delete'),

  ('admin'::app_role, 'fields_of_study.view'),
  ('admin'::app_role, 'fields_of_study.create'),
  ('admin'::app_role, 'fields_of_study.edit'),
  ('admin'::app_role, 'fields_of_study.delete'),

  ('admin'::app_role, 'skills.view'),
  ('admin'::app_role, 'skills.create'),
  ('admin'::app_role, 'skills.edit'),
  ('admin'::app_role, 'skills.delete'),

  ('admin'::app_role, 'degrees.view'),
  ('admin'::app_role, 'degrees.create'),
  ('admin'::app_role, 'degrees.edit'),
  ('admin'::app_role, 'degrees.delete'),

  ('admin'::app_role, 'interests.view'),
  ('admin'::app_role, 'interests.create'),
  ('admin'::app_role, 'interests.edit'),
  ('admin'::app_role, 'interests.delete'),

  ('admin'::app_role, 'events.view'),
  ('admin'::app_role, 'events.create'),
  ('admin'::app_role, 'events.edit'),
  ('admin'::app_role, 'events.delete'),

  ('admin'::app_role, 'communities.view'),
  ('admin'::app_role, 'communities.create'),
  ('admin'::app_role, 'communities.edit'),
  ('admin'::app_role, 'communities.delete'),
  ('admin'::app_role, 'communities.moderate'),

  ('admin'::app_role, 'matching.view'),
  ('admin'::app_role, 'matching.configure'),

  ('admin'::app_role, 'settings.view'),
  ('admin'::app_role, 'settings.edit'),

  ('admin'::app_role, 'analytics.view')
) AS r(role, pkey)
JOIN public.permissions p ON p.key = r.pkey
ON CONFLICT (role, permission_id) DO NOTHING;

-- super_admin: every permission
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'super_admin'::app_role, p.id
FROM public.permissions p
ON CONFLICT (role, permission_id) DO NOTHING;
