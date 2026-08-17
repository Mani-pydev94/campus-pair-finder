---
name: create-communities-screen
description: Create a premium Communities screen for Campus Connect AI following Apple + Discord + Spotify + Notion design language.
type: feature
---

# Plan - Premium Communities Screen

Create a dedicated `src/routes/communities.tsx` route that allows students to discover AI-recommended communities, explore categories, and manage their joined groups.

## User Review Required

> [!IMPORTANT]
> - The screen will be accessible at `/communities`.
> - I will use the existing `profiles` and `academic_profiles` tables to power "recommended" logic if needed, but for now, the UI will focus on high-fidelity layout and interactions as requested.
> - I'll update the navigation bar in `src/routes/home.tsx` and other relevant screens to link to this new route.

## Proposed Changes

### Assets
- Generate relevant community cover images and realistic student avatars for the activity feed if not already present.

### Routing & Navigation
- Create `src/routes/communities.tsx`.
- Update the bottom navigation bar across the app (in `src/routes/home.tsx`, `src/routes/explore-matches.tsx`, etc.) to point the "Communities" icon to `/communities`.

### UI Components (`src/routes/communities.tsx`)
- **Top Bar**: Logo, "Communities" title, and a notification bell with a pulse badge.
- **Search Bar**: 52px rounded field with filter icon.
- **AI Recommendation Card**: Purple gradient card (24px radius) highlighting 12 recommended communities.
- **Category Chips**: Horizontal scroll of chips (Technology, Hackathons, AI, etc.) with active states.
- **Featured Communities**: Large horizontal cards with cover images, icons, member counts, and Join/Preview buttons.
- **My Communities**: Vertical list of joined communities with activity indicators (unread counts, online members).
- **Trending This Week**: Growth-focused cards showing popular topics like "AI Agents".
- **Community Activity Preview**: A feed-style card showing recent posts (e.g., "New hackathon announced") with student avatars.
- **Floating Action Button**: Purple circular "+" button labeled "Create".
- **Bottom Navigation**: Reusable floating nav bar highlighting "Communities" in purple.

### Styling & Animations
- Implement "fade-up" animations for sections.
- Add scale-on-tap micro-interactions for buttons.
- Use glassmorphism for background elements where appropriate.
- Ensure 32px bold headings and 22px semi-bold section titles as specified.

## Technical Details
- **Route**: `src/routes/communities.tsx`
- **Data**: Mock data initially to match the specific "Featured" and "Trending" examples, with hooks for real Supabase integration later.
- **Icons**: `lucide-react`
- **Animations**: Tailwind `fade-up` utility and `framer-motion` if available (or standard CSS transitions).
