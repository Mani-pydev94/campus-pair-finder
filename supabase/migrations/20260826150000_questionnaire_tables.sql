-- Phase 1: Database Only - Questionnaire Categories and Questions Tables
-- This migration creates the database-driven questionnaire system while preserving
-- exact compatibility with existing questionnaire_responses table

-- ============================================
-- 1. questionnaire_categories table
-- ============================================
CREATE TABLE public.questionnaire_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    description text,
    display_order integer NOT NULL DEFAULT 0,
    emoji text,
    tone text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Index for ordered retrieval
CREATE INDEX idx_questionnaire_categories_display_order
ON public.questionnaire_categories (display_order);

-- ============================================
-- 2. questionnaire_questions table
-- ============================================
CREATE TABLE public.questionnaire_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id text NOT NULL UNIQUE,
    category_id uuid NOT NULL REFERENCES public.questionnaire_categories(id) ON DELETE RESTRICT,
    question_text text NOT NULL,
    description text,
    question_type text NOT NULL DEFAULT 'multiple_choice',
    options jsonb,
    display_order integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    is_required boolean NOT NULL DEFAULT true,
    ai_insight text,
    emoji text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Index for category + order retrieval
CREATE INDEX idx_questionnaire_questions_category_order
ON public.questionnaire_questions (category_id, display_order);

-- Index for external_id lookups (used by existing response mapping)
CREATE INDEX idx_questionnaire_questions_external_id
ON public.questionnaire_questions (external_id);

-- ============================================
-- 3. RLS Policies
-- ============================================

-- questionnaire_categories RLS
ALTER TABLE public.questionnaire_categories ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read active categories (for questionnaire UI)
CREATE POLICY "Authenticated users can view active categories"
ON public.questionnaire_categories FOR SELECT
TO authenticated
USING (is_active = true);

-- Super admins can manage all categories
CREATE POLICY "Super admins can manage categories"
ON public.questionnaire_categories FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- questionnaire_questions RLS
ALTER TABLE public.questionnaire_questions ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read active questions for active categories (for questionnaire UI)
CREATE POLICY "Authenticated users can view active questions"
ON public.questionnaire_questions FOR SELECT
TO authenticated
USING (
    is_active = true
    AND EXISTS (
        SELECT 1 FROM public.questionnaire_categories c
        WHERE c.id = category_id AND c.is_active = true
    )
);

-- Super admins can manage all questions
CREATE POLICY "Super admins can manage questions"
ON public.questionnaire_questions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- ============================================
-- 4. Seed the 7 Categories (exact order and names from hardcoded data)
-- ============================================
INSERT INTO public.questionnaire_categories (name, description, display_order, emoji, tone) VALUES
('Values', 'Help us understand what matters most to you.', 1, '❤️', 'bg-brand/10 text-brand'),
('Personality', 'Tell us how you think, work and interact with others.', 2, '🧠', 'bg-rose-100 text-rose-500'),
('Communication', 'Describe how you prefer to communicate and collaborate.', 3, '💬', 'bg-sky-100 text-sky-600'),
('Learning Style', 'Tell us how you learn best.', 4, '📚', 'bg-amber-100 text-amber-600'),
('Career Goals', 'Help us understand your future ambitions.', 5, '🎯', 'bg-mint/15 text-mint'),
('Lifestyle', 'Tell us about your daily habits and preferences.', 6, '🌍', 'bg-emerald-100 text-emerald-600'),
('Interests & Hobbies', 'Share your hobbies and interests.', 7, '🎨', 'bg-violet-100 text-violet-600');

-- ============================================
-- 5. Seed the EXACT 40 Questions with original external_id values
-- ============================================

-- Values (6 questions) - v1 through v6
INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'v1', c.id, 'How important is honesty in your friendships and project teams?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 1, true, true, 'This answer helps us understand how you build trust and collaborate with others.', '❤️'
FROM public.questionnaire_categories c WHERE c.name = 'Values';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'v2', c.id, 'Do you believe in strict adherence to deadlines over project quality?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 2, true, true, 'We match you with people who share your standards for excellence and timing.', '❤️'
FROM public.questionnaire_categories c WHERE c.name = 'Values';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'v3', c.id, 'How much do you value personal growth compared to academic success?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 3, true, true, 'Helps us find partners who prioritize self-improvement as much as you do.', '❤️'
FROM public.questionnaire_categories c WHERE c.name = 'Values';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'v4', c.id, 'Do you prefer working with people who share your political views?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 4, true, true, 'Aligns your social environment with your core belief systems.', '❤️'
FROM public.questionnaire_categories c WHERE c.name = 'Values';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'v5', c.id, 'Is social responsibility a major factor in your career choices?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 5, true, true, 'Matches you with purpose-driven individuals who want to make an impact.', '❤️'
FROM public.questionnaire_categories c WHERE c.name = 'Values';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'v6', c.id, 'How important is family and tradition in your daily life decisions?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 6, true, true, 'Connects you with others who share similar cultural or familial priorities.', '❤️'
FROM public.questionnaire_categories c WHERE c.name = 'Values';

-- Personality (8 questions) - p1 through p8
INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'p1', c.id, 'Do you feel energized after spending time with a large group of people?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 1, true, true, 'Helps us balance team dynamics between introverts and extroverts.', '🧠'
FROM public.questionnaire_categories c WHERE c.name = 'Personality';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'p2', c.id, 'Do you tend to follow a strict schedule rather than being spontaneous?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 2, true, true, 'Finds partners who match your organizational style and pace.', '🧠'
FROM public.questionnaire_categories c WHERE c.name = 'Personality';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'p3', c.id, 'Do you consider yourself a creative thinker more than a logical one?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 3, true, true, 'Balances teams with a mix of innovative and analytical minds.', '🧠'
FROM public.questionnaire_categories c WHERE c.name = 'Personality';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'p4', c.id, 'How do you handle high-pressure situations or tight deadlines?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 4, true, true, 'Ensures your study group can remain calm and productive under stress.', '🧠'
FROM public.questionnaire_categories c WHERE c.name = 'Personality';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'p5', c.id, 'Are you more focused on the big picture than the small details?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 5, true, true, 'Pairs detail-oriented students with visionary thinkers.', '🧠'
FROM public.questionnaire_categories c WHERE c.name = 'Personality';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'p6', c.id, 'Do you enjoy being the center of attention in social settings?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 6, true, true, 'Refines your social compatibility with different personality types.', '🧠'
FROM public.questionnaire_categories c WHERE c.name = 'Personality';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'p7', c.id, 'Do you often rely on your intuition when making important decisions?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 7, true, true, 'Connects you with others who trust their gut feelings similarly.', '🧠'
FROM public.questionnaire_categories c WHERE c.name = 'Personality';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'p8', c.id, 'Are you easily affected by the emotions of those around you?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 8, true, true, 'Matches you with empathetic or steady partners based on your needs.', '🧠'
FROM public.questionnaire_categories c WHERE c.name = 'Personality';

-- Communication (6 questions) - c1 through c6
INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'c1', c.id, 'Do you prefer written updates over verbal meetings for project progress?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 1, true, true, 'Aligns your team with your preferred collaboration channels.', '💬'
FROM public.questionnaire_categories c WHERE c.name = 'Communication';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'c2', c.id, 'How comfortable are you with giving direct, critical feedback?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 2, true, true, 'Matches you with people who share your communication transparency.', '💬'
FROM public.questionnaire_categories c WHERE c.name = 'Communication';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'c3', c.id, 'Do you prefer to resolve conflicts immediately as they arise?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 3, true, true, 'Ensures your group has a healthy approach to disagreement resolution.', '💬'
FROM public.questionnaire_categories c WHERE c.name = 'Communication';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'c4', c.id, 'Are you a frequent user of emojis and informal language in professional chats?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 4, true, true, 'Synchronizes your digital communication style with others.', '💬'
FROM public.questionnaire_categories c WHERE c.name = 'Communication';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'c5', c.id, 'Do you prefer one-on-one deep conversations over group discussions?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 5, true, true, 'Finds the best setting for you to voice your ideas effectively.', '💬'
FROM public.questionnaire_categories c WHERE c.name = 'Communication';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'c6', c.id, 'How often do you check your messages during a typical study session?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 6, true, true, 'Aligns response time expectations within your match group.', '💬'
FROM public.questionnaire_categories c WHERE c.name = 'Communication';

-- Learning Style (5 questions) - l1 through l5
INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'l1', c.id, 'Do you learn better by doing (hands-on) than by reading theory?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 1, true, true, 'Finds study partners who process information like you do.', '📚'
FROM public.questionnaire_categories c WHERE c.name = 'Learning Style';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'l2', c.id, 'Do you prefer visual aids like charts and diagrams over text?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 2, true, true, 'Matches your learning preferences for better collaborative studying.', '📚'
FROM public.questionnaire_categories c WHERE c.name = 'Learning Style';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'l3', c.id, 'Do you find it easier to remember information that you hear?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 3, true, true, 'Identifies if you benefit from auditory learning or discussions.', '📚'
FROM public.questionnaire_categories c WHERE c.name = 'Learning Style';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'l4', c.id, 'Do you like to study in complete silence without any distractions?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 4, true, true, 'Connects you with partners who respect your need for a quiet space.', '📚'
FROM public.questionnaire_categories c WHERE c.name = 'Learning Style';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'l5', c.id, 'Do you enjoy teaching others what you have just learned?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 5, true, true, 'Finds partners who benefit from the ''protégé effect'' with you.', '📚'
FROM public.questionnaire_categories c WHERE c.name = 'Learning Style';

-- Career Goals (5 questions) - g1 through g5
INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'g1', c.id, 'Are you more interested in joining a large corporation than starting your own business?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 1, true, true, 'Connects you with others moving in the same career direction.', '🎯'
FROM public.questionnaire_categories c WHERE c.name = 'Career Goals';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'g2', c.id, 'Is financial stability your primary motivation for your career choice?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 2, true, true, 'Aligns your professional drive with like-minded individuals.', '🎯'
FROM public.questionnaire_categories c WHERE c.name = 'Career Goals';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'g3', c.id, 'Do you plan to pursue further studies (Master''s, PhD) after graduation?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 3, true, true, 'Finds long-term academic partners who share your educational path.', '🎯'
FROM public.questionnaire_categories c WHERE c.name = 'Career Goals';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'g4', c.id, 'How important is work-life balance in your future career plans?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 4, true, true, 'Matches you with others who share your professional lifestyle values.', '🎯'
FROM public.questionnaire_categories c WHERE c.name = 'Career Goals';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'g5', c.id, 'Are you interested in working in a different country in the future?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 5, true, true, 'Connects you with global-minded students and potential travelers.', '🎯'
FROM public.questionnaire_categories c WHERE c.name = 'Career Goals';

-- Lifestyle (5 questions) - s1 through s5
INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 's1', c.id, 'Are you a morning person who prefers to study before 9 AM?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 1, true, true, 'Finds partners who are active during your peak productivity hours.', '🌍'
FROM public.questionnaire_categories c WHERE c.name = 'Lifestyle';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 's2', c.id, 'Do you lead an active lifestyle with regular exercise and sports?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 2, true, true, 'Matches you with students who balance health and academics.', '🌍'
FROM public.questionnaire_categories c WHERE c.name = 'Lifestyle';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 's3', c.id, 'How much time do you spend on social media on a daily basis?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 3, true, true, 'Helps manage distractions within your potential study group.', '🌍'
FROM public.questionnaire_categories c WHERE c.name = 'Lifestyle';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 's4', c.id, 'Do you prefer to keep your study space strictly organized?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 4, true, true, 'Ensures physical or digital workspace compatibility with partners.', '🌍'
FROM public.questionnaire_categories c WHERE c.name = 'Lifestyle';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 's5', c.id, 'Do you enjoy traveling and exploring new cultures and cuisines?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 5, true, true, 'Connects you through shared lifestyle interests and curiosity.', '🌍'
FROM public.questionnaire_categories c WHERE c.name = 'Lifestyle';

-- Interests & Hobbies (5 questions) - h1 through h5
INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'h1', c.id, 'Do you enjoy participating in competitive hackathons?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 1, true, true, 'Matches you based on shared passions and hobbies.', '🎨'
FROM public.questionnaire_categories c WHERE c.name = 'Interests & Hobbies';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'h2', c.id, 'Are you interested in video games or competitive e-sports?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 2, true, true, 'Finds community through shared gaming and digital entertainment.', '🎨'
FROM public.questionnaire_categories c WHERE c.name = 'Interests & Hobbies';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'h3', c.id, 'Do you enjoy reading fiction or non-fiction books in your free time?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 3, true, true, 'Connects you with fellow book lovers and intellectual peers.', '🎨'
FROM public.questionnaire_categories c WHERE c.name = 'Interests & Hobbies';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'h4', c.id, 'Are you a fan of attending live music concerts or festivals?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 4, true, true, 'Matches your social energy and taste in entertainment.', '🎨'
FROM public.questionnaire_categories c WHERE c.name = 'Interests & Hobbies';

INSERT INTO public.questionnaire_questions (external_id, category_id, question_text, description, question_type, options, display_order, is_active, is_required, ai_insight, emoji)
SELECT 'h5', c.id, 'Do you enjoy outdoor activities like hiking, camping, or cycling?', null, 'multiple_choice', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]'::jsonb, 5, true, true, 'Finds adventure-minded partners for off-campus activities.', '🎨'
FROM public.questionnaire_categories c WHERE c.name = 'Interests & Hobbies';

-- ============================================
-- 6. Grants for service_role (for admin operations)
-- ============================================
GRANT ALL ON public.questionnaire_categories TO service_role;
GRANT ALL ON public.questionnaire_questions TO service_role;
GRANT SELECT ON public.questionnaire_categories TO authenticated;
GRANT SELECT ON public.questionnaire_questions TO authenticated;