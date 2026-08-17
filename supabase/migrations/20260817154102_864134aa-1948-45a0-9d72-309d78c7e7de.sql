-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    age INTEGER,
    gender TEXT,
    city TEXT,
    languages TEXT[] DEFAULT '{}',
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create academic_profiles table
CREATE TABLE public.academic_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    university TEXT,
    degree TEXT,
    field_of_study TEXT,
    year_of_study TEXT,
    skills TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    career_goal TEXT,
    learning_bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create questionnaire_responses table
CREATE TABLE public.questionnaire_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    question_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    answer TEXT NOT NULL,
    importance TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.academic_profiles TO authenticated;
GRANT ALL ON public.academic_profiles TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.questionnaire_responses TO authenticated;
GRANT ALL ON public.questionnaire_responses TO service_role;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can view other student profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Policies for academic_profiles
CREATE POLICY "Users can view their own academic profile"
ON public.academic_profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own academic profile"
ON public.academic_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own academic profile"
ON public.academic_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can view other student academic profiles"
ON public.academic_profiles FOR SELECT
TO authenticated
USING (true);

-- Policies for questionnaire_responses
CREATE POLICY "Users can view their own responses"
ON public.questionnaire_responses FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own responses"
ON public.questionnaire_responses FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);