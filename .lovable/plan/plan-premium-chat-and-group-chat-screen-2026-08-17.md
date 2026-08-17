---
name: create-chat-screen
description: Create a premium Chat and Group Chat screen for Campus Connect AI following Apple + Slack + Discord design language.
type: feature
---

# Plan - Premium Chat and Group Chat Screen

Create a dedicated `src/routes/chat.tsx` route that allows students to communicate with their AI matches and communities, focusing on collaboration and learning.

## User Review Required

> [!IMPORTANT]
> - The screen will be accessible at `/chat`.
> - I will implement a segmented control to switch between "Private Chats" and "Group Chats".
> - I will include a "Chat Window Preview" section within the same screen to demonstrate the messaging UI as requested.
> - I'll update the navigation bar across the app to include and link to this new Chat route.

## Proposed Changes

### Routing & Navigation
- Create `src/routes/chat.tsx`.
- Update the bottom navigation bar in `src/routes/home.tsx`, `src/routes/explore-matches.tsx`, `src/routes/communities.tsx`, and `src/routes/student-profile.tsx` to include the "Chat" icon pointing to `/chat`.

### UI Components (`src/routes/chat.tsx`)
- **Top Bar**: Back button, "Chat" title (32px bold), Search, and More options icons.
- **Segmented Control**: Animated toggle between "Private Chats" and "Group Chats".
- **Search Bar**: 52px rounded field with leading search icon.
- **Pinned Conversations**: Horizontal scroll of student cards with compatibility scores (e.g., Sophia 96% Match).
- **Conversation Lists**:
    - **Private**: Premium cards with avatars, compatibility badges, message previews, and unread counts.
    - **Group**: Community-focused cards with participant counts and active member indicators.
- **Chat Window Preview**: Example conversation between Sophia and the User about a hackathon and Azure challenge.
- **AI Conversation Starters**: Gradient card with chip-based suggestions (e.g., "Ask about their latest project").
- **Shared Files**: List of recently shared academic resources (PDFs, docs).
- **Floating Action Button**: Purple circular button labeled "New Chat".
- **Bottom Navigation**: Floating nav bar highlighting "Chat" in purple.

### Styling & Animations
- Apple-inspired minimal design with glassmorphism and soft shadows.
- Micro-animations: pulsing online indicators, scaling buttons, and sliding conversation cards.
- Typing indicators and read receipts visualization.

## Technical Details
- **Route**: `src/routes/chat.tsx`
- **Icons**: `lucide-react`
- **Components**: Framer Motion (if available) or standard Tailwind transitions for segmented control and lists.
