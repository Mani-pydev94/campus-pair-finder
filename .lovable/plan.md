# Plan: Implement Full Backend Integration for Campus Connect AI

I will implement a robust backend for Campus Connect AI using Lovable Cloud (Supabase). This includes user authentication, profiles, academic data, questionnaire results, and an AI-driven matching engine.

## Database Schema

### 1. `profiles`
Stores basic user information linked to auth.
- `id`: uuid (PK, references auth.users)
- `display_name`: text
- `age`: int
- `gender`: text
- `city`: text
- `languages`: text[]
- `bio`: text
- `avatar_url`: text
- `updated_at`: timestamp

### 2. `academic_profiles`
Stores student-specific academic data.
- `id`: uuid (PK, references auth.users)
- `university`: text
- `degree`: text
- `field_of_study`: text
- `year_of_study`: text
- `skills`: text[]
- `interests`: text[]
- `career_goal`: text
- `learning_bio`: text

### 3. `questionnaire_responses`
Stores compatibility data for matching.
- `id`: uuid (PK)
- `user_id`: uuid (references auth.users)
- `question_id`: int
- `answer`: text
- `importance`: text
- `category`: text

### 4. `matches` (Optional/View)
While matches are calculated on the fly, I'll provide a server function to handle the logic.

## Implementation Steps

### Phase 1: Authentication & Social Login
- Enable **Google** and **Microsoft** social auth providers.
- Implement login/signup logic using `lovable.auth.signInWithOAuth`.
- Update the email verification flow to use real Supabase auth state.

### Phase 2: Database & RLS
- Create tables with proper foreign keys to `auth.users`.
- Enable RLS and implement policies:
  - Users can read/write their own profiles.
  - Authenticated users can read other students' profiles (for explore/matching).
- Add security-definer functions for role-based access if needed.

### Phase 3: Profile Setup Integration
- Replace simulated delays with real `supabase` calls in `profile-setup` and `profile-setup-step2`.
- Handle image uploads to Lovable Cloud storage.

### Phase 4: Compatibility Engine
- Implement a server function `getMatches` that calculates compatibility scores based on shared interests, skills, and questionnaire answers.
- Update the `explore-matches` and `home` screens to fetch data from the database instead of using mocks.

### Phase 5: Routing & UX
- Add auth guards to routes like `/home`, `/explore-matches`, and `/student-profile`.
- Ensure a seamless onboarding flow (Signup -> Verify -> Profile Setup -> Questionnaire).

## Technical Details
- **Stack**: TanStack Start v1, React 19, Supabase (Lovable Cloud).
- **Security**: Row Level Security (RLS) on all tables, secure server functions.
- **AI**: Compatibility logic will run on the server for security and performance.
