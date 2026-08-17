-- Tighten permissions for questionnaire_responses
REVOKE DELETE ON public.questionnaire_responses FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.questionnaire_responses TO authenticated;

-- Ensure profiles and academic_profiles have appropriate grants
REVOKE ALL ON public.profiles FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

REVOKE ALL ON public.academic_profiles FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.academic_profiles TO authenticated;

-- Re-verify RLS is enabled on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Ensure service_role has full access for administrative functions
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.academic_profiles TO service_role;
GRANT ALL ON public.questionnaire_responses TO service_role;
