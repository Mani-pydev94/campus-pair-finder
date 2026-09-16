-- Fix questionnaire_responses unique constraint to include category
-- This resolves the data-integrity issue where different questions across categories
-- with the same numeric suffix (e.g., v1=1, p1=1, c1=1) would collide on
-- UNIQUE(user_id, question_id) because the frontend extracts only the numeric suffix.
--
-- The fix adds category to the unique constraint so users can answer v1 (Values)
-- and p1 (Personality) independently while preserving all existing data.

-- 1. Drop existing unique constraint
ALTER TABLE public.questionnaire_responses
DROP CONSTRAINT IF EXISTS questionnaire_responses_user_id_question_id_key;

-- 2. Add new composite unique constraint (user_id, category, question_id)
-- This allows the same numeric question_id across different categories
-- while preventing duplicate answers for the same question within a category.
ALTER TABLE public.questionnaire_responses
ADD CONSTRAINT questionnaire_responses_user_id_category_question_id_key
UNIQUE (user_id, category, question_id);

-- 3. Verify the constraint exists and existing data is valid
-- This will fail if any existing duplicate (user_id, category, question_id) exists,
-- which should not happen since the original constraint was only (user_id, question_id)
-- and category was always supplied.