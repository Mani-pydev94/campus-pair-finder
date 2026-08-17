DROP TABLE IF EXISTS public.questionnaire_responses;

CREATE TABLE public.questionnaire_responses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    question_id text NOT NULL,
    category text NOT NULL,
    answer text NOT NULL,
    importance text NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, question_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.questionnaire_responses TO authenticated;
GRANT ALL ON public.questionnaire_responses TO service_role;

ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own responses" 
ON public.questionnaire_responses 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);