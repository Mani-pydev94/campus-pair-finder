-- Add question_uuid column to questionnaire_responses for real dynamic matching
--
-- The questionnaire_responses table currently stores question_id as the numeric
-- suffix of an external_id (e.g. "v1" -> "1") plus the category name. While that
-- composite (user_id, category, question_id) is unique, it is fragile for joining
-- to the canonical question rows. This migration adds a direct FK to
-- questionnaire_questions.id (the UUID) so the matching engine can join
-- responses to their canonical question metadata (options, display_order, etc.)
-- without parsing external_id strings.
--
-- Backward compatibility: `question_id` (the numeric text) is left intact so
-- existing code that reads it continues to work during the transition.

-- 1. Add the column
ALTER TABLE public.questionnaire_responses
ADD COLUMN IF NOT EXISTS question_uuid uuid REFERENCES public.questionnaire_questions(id);

-- 2. Add an index for efficient joins in the matching engine
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_question_uuid
ON public.questionnaire_responses (question_uuid);

-- 3. Backfill existing responses by joining on category + external_id
--    The question_id column stores the numeric suffix of the external_id
--    (e.g. external_id "v1" → question_id "1"). We extract the digits from
--    external_id using regexp_replace and match against question_id.
UPDATE public.questionnaire_responses r
SET question_uuid = q.id
FROM public.questionnaire_questions q
JOIN public.questionnaire_categories c ON c.id = q.category_id
WHERE r.question_uuid IS NULL
  AND c.name = r.category
  AND regexp_replace(q.external_id, '[^0-9]', '', 'g') = r.question_id;

-- 4. Add a check constraint to ensure at least one ID is present
ALTER TABLE public.questionnaire_responses
ADD CONSTRAINT IF NOT EXISTS questionnaire_responses_id_check
CHECK (question_id IS NOT NULL OR question_uuid IS NOT NULL);

-- 5. Comments for documentation
COMMENT ON COLUMN public.questionnaire_responses.question_id IS
  'Legacy: numeric suffix of external_id (e.g. "v1" -> "1"). New code should also set question_uuid.';
COMMENT ON COLUMN public.questionnaire_responses.question_uuid IS
  'Direct FK to questionnaire_questions.id for reliable joins in the matching engine.';
