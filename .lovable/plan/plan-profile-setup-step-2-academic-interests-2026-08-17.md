# Plan: Profile Setup Step 2 (Academic & Interests)

Implement the second step of the premium Profile Setup experience for Campus Connect AI. This screen focuses on academic background, professional goals, and personal interests to refine the AI matching algorithm.

## Technical Details
- **Route**: `src/routes/profile-setup-step2.tsx`
- **Styling**: Tailwind CSS with custom tokens (brand purple, mint, soft shadows).
- **Icons**: `lucide-react` for semantic indicators.
- **Animations**: `framer-motion` for layout transitions, sequential fade-ins, and progress bar updates.
- **Components**: shadcn/ui for `Card`, `Label`, `Input`, `Button`, and custom chip selectors.

## Proposed Changes

### Assets
- Download/reference `src/assets/profile-setup-step2.png` for the hero illustration.

### New Route: `src/routes/profile-setup-step2.tsx`
- **Header**: Back arrow (points to `/profile-setup`), "Academic Profile" title, and "Skip" button.
- **Progress Indicator**: Step 2 of 2 (100% progress state).
- **Hero Section**: New illustration with floating academic icons (Book, Globe).
- **Academic Card (24px radius)**:
    - **University/College**: Autocomplete or text input with institution icon.
    - **Major/Field of Study**: Searchable input with graduation cap icon.
    - **Expected Graduation**: Year dropdown.
    - **Study Style**: Chips for "Visual Learner", "Auditory", "Kinesthetic", "Late Night", "Early Bird".
- **Interests Section**:
    - Multi-select chips for categories like "Tech", "Business", "Arts", "Sports", "Gaming", etc.
- **AI Career Goal**:
    - Text area (100 chars max) for "What do you want to achieve?".
- **Actions**:
    - "Finish Setup" button (links to `/questionnaire-intro`).
    - Full-screen "Success" overlay with animated checkmark and "Let's Go!" button.

### Navigation Updates
- Update `src/routes/profile-setup.tsx` (Step 1) to navigate to `/profile-setup-step2` on "Continue".
