-- Tighten permissions for chat-related tables
-- Revoke all permissions from anon
REVOKE ALL ON public.conversations FROM anon;
REVOKE ALL ON public.conversation_participants FROM anon;
REVOKE ALL ON public.messages FROM anon;

-- Tighten authenticated grants (no DELETE by default)
REVOKE ALL ON public.conversations FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;

REVOKE ALL ON public.conversation_participants FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.conversation_participants TO authenticated;

REVOKE ALL ON public.messages FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;

-- Ensure service_role has full access
GRANT ALL ON public.conversations TO service_role;
GRANT ALL ON public.conversation_participants TO service_role;
GRANT ALL ON public.messages TO service_role;

-- Re-verify RLS is enabled
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
