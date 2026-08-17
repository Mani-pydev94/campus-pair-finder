-- Final security tightening migration
-- Revoke any unintended public access
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.academic_profiles TO anon;

-- Tighten authenticated grants
REVOKE DELETE ON public.questionnaire_responses FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.questionnaire_responses TO authenticated;

REVOKE DELETE ON public.profiles FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

REVOKE DELETE ON public.academic_profiles FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.academic_profiles TO authenticated;

-- Ensure service_role is privileged
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Re-assert RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;