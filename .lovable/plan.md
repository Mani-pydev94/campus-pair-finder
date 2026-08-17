# Plan: Implement Full Backend Integration for Campus Connect AI

I will implement a robust backend for Campus Connect AI using Lovable Cloud. This includes user authentication, student profiles, academic data, questionnaire results, and an AI-driven matching engine.

## User Experience Improvements

- **Real Auth**: Users can sign up, log in, and verify their university emails for real.
- **Persistent Profiles**: All student data, including academic interests and learning styles, will be saved securely.
- **Dynamic Matching**: The "Top Matches" on your dashboard will reflect real students based on shared values and goals.
- **Smart Onboarding**: The app will remember your progress, guiding you through verification and profile setup.

## Technical Implementation

### 1. Authentication & Security
- Activate **Google** and **Microsoft** social login providers.
- Configure Supabase Auth for email/password and university email verification.
- Implement **Row Level Security (RLS)** to ensure students can only edit their own data while allowing them to discover others.

### 2. Data Architecture
- **Profiles Table**: Linked to authentication, storing display names, bios, and avatars.
- **Academic Table**: Stores university details, skills (Python, UI/UX, etc.), and career goals.
- **Responses Table**: Captures questionnaire data to power the compatibility engine.

### 3. Smart Matching Engine
- Create a **Server Function** to calculate compatibility scores (e.g., 96%) between students.
- Logic factors: Shared skills, aligned career goals, and matching personality traits from the questionnaire.

### 4. Application Integration
- Replace all mock data and "simulated delays" with real database queries.
- Connect the frontend screens (`/signup`, `/login`, `/profile-setup`, `/explore-matches`) to the new backend.
- Set up **Cloud Storage** for profile photos.

## Security & Reliability
- All sensitive operations will happen on the server.
- Database triggers will handle data consistency (e.g., creating a profile automatically on signup).
- SEO-optimized routes with proper metadata.
