-- Add RLS read access for compatibility matching (explore-matches).
--
-- Context:
-- The explore-matches page needs to compare the current user's questionnaire
-- responses against other users' responses to compute a real compatibility score.
-- The existing RLS setup only lets a user read their OWN responses, so indirect
-- comparisons are impossible.
--
-- This policy is deliberately narrow and mirrors the EXISTING read model already
-- used by `profiles` and `academic_profiles`, where authenticated users can read
-- every user's row (policy "Authenticated users can view other student profiles"
-- / "...academic profiles", both `USING (true)`). Questionnaire responses contain
-- opinion/preference choices only — no email, no auth identity, no contact
-- details — and are no more sensitive than the other users' profile data the
-- matching page already surfaces (skills, interests, university, bio). So a
-- SELECT-only policy here keeps the app's data-sharing model consistent without
-- exposing anything a matching product would not already show.
--
-- This does NOT disable or weaken RLS. WRITE access stays restricted to the row
-- owner (`auth.uid() = user_id`), so no user can alter another user's answers.

-- Existing OWN-row policies stay untouched (they already grant the owner full
-- control via "Users can manage their own responses" / "Users can view their
-- own responses"). We ADDITIONALLY grant a read-only policy over other users'
-- rows, scoped to SELECT only.

DO $$
BEGIN
  -- Add read access over all questionnaire response rows for matching.
  -- SELECT only: no user can INSERT/UPDATE/DELETE another user's responses.
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'questionnaire_responses'
      AND policyname = 'Authenticated users can read responses for matching'
  ) THEN
    CREATE POLICY "Authenticated users can read responses for matching"
    ON public.questionnaire_responses FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;