# Plan: Fix Chat Navigation and Backend Integration

The user reported that the "New Chat" button is not responsive and that the backend integration is not working. We will fix the "New Chat" button by adding an interaction (like a toast or navigation) and create a new migration to handle real-time chat data, ensuring proper RLS and grants.

## User Review Required

> [!IMPORTANT]
> The backend for chat (messages and conversations) currently does not have its own tables. I will create these tables in a new migration.

## Technical Details

### Backend Changes (Migration)
1. **Create `conversations` table**:
   - Fields: `id`, `created_at`, `updated_at`, `is_group`, `name`, `gradient`, `icon`.
2. **Create `conversation_participants` table**:
   - Fields: `conversation_id`, `user_id`, `role`.
3. **Create `messages` table**:
   - Fields: `id`, `conversation_id`, `sender_id`, `content`, `created_at`, `is_read`.
4. **Grant permissions**:
   - Ensure `authenticated` users can `SELECT`, `INSERT`, and `UPDATE` their own data.
   - Ensure `service_role` has `ALL` access.
5. **Enable RLS**:
   - Policies to ensure users only see and participate in conversations they are members of.

### Frontend Changes
1. **`src/routes/chat.tsx`**:
   - Add `sonner` for toast notifications.
   - Update the "New Chat" FAB button to show a "Coming Soon" toast or open a modal (simulated for now since no full contact list is implemented yet).
   - Fix the `onClick` event for the "New Chat" button.
   - Prepare the UI to eventually fetch real data using `useQuery`.

## Verification Plan
1. **Manual Preview**: Click the "New Chat" button in the preview to confirm the toast appears.
2. **Database Verification**: Run `supabase--read_query` to confirm the new tables exist and have the correct RLS policies.
3. **Playwright Check**: Automate a click on the "New Chat" button and verify the UI response.
