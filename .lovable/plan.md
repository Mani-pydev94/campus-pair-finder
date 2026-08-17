# Premium Student Compatibility Profile Implementation Plan

Create a premium, Apple-inspired AI Compatibility Profile screen for Campus Connect AI. This screen focuses on explaining the *why* behind student recommendations, prioritizing AI insights over simple percentages.

## User Review Required

> [!IMPORTANT]
> The profile will feature "Sophia Johnson" as the primary example as per the specification. Should I add logic to support multiple student profiles, or focus solely on this premium static example? (Defaulting to premium static example for maximum fidelity to specs).

## Proposed Changes

### 1. New Route: `src/routes/student-profile.tsx`
- **Header**: Back button, centered "Student Profile" title, bookmark and share icons in circular white buttons with soft shadows.
- **Profile Header**: 
    - Large circular photo of "Sophia Johnson" (using `student-1.jpg`).
    - Details: Age 21, Stanford University, Computer Science, San Francisco.
    - Verified Student badge.
- **Hero AI Insight Card**: 
    - Purple gradient rounded card.
    - AI Sparkle icon and "Why AI Recommends Sophia" title.
    - High-fidelity AI summary text explaining shared passions and professional compatibility.
- **Compatibility Score**:
    - Animated elegant circular progress ring (96%).
    - Subtitle: "Excellent Collaboration Potential".
- **Compatibility Breakdown Card**:
    - Animated colorful progress bars for Values (97%), Learning Style (95%), etc.
    - Short explanations for each category.
- **Shared Interests**: Colorful gradient chips (Python, Azure, ML, etc.).
- **AI Strengths & Potential Differences**:
    - Checklist of strengths with premium icons.
    - Balanced "complementary strengths" card (e.g., public speaking vs. planning).
- **Academic & Project Interests**:
    - Detailed card with degree, skills, favorite subjects, and certifications.
    - Project interest tags (Startup, Hackathons, etc.).
- **Mutual Communities & Ice Breakers**:
    - Shared groups list with member counts.
    - Premium AI-suggested conversation starters.
- **Actions**:
    - Primary Purple Gradient Button: "Connect with Sophia".
    - Secondary outlined buttons: Message, Save Profile, Report.
- **Bottom Navigation**: Floating nav bar with "Matches" highlighted.

### 2. Navigation Integration
- Update `src/routes/explore-matches.tsx` to link the "View Profile" button to `/student-profile`.

### 3. Visual Polish
- Implement micro-animations:
    - Profile image scale on mount.
    - Cards fade upward sequentially.
    - Progress ring and bars animation.
    - Button scale on tap.
    - Bookmark toggle animation.
- Ensure full Safe Area support and Apple-standard typography (Inter).

## Technical Details
- Using `lucide-react` for premium iconography.
- Custom Tailwind animations for sequential fade-ins and ring progress.
- Glassmorphism effects using `backdrop-blur` and semi-transparent borders.
- Responsive design tailored for mobile viewports (max-width 430px).
