# Security Plan - Fix Database Permissions and RLS

The security scan results identified potential risks in the database schema where permissions and Row Level Security (RLS) policies were not strictly applied to all tables. While previous migrations addressed `profiles` and `questionnaire_responses`, new tables like `conversations`, `conversation_participants`, and `messages` require similar tightening.

## Technical Details

### 1. Tighten Chat System Permissions
The chat tables (`conversations`, `conversation_participants`, `messages`) need explicit `GRANT` statements and robust RLS policies to ensure:
- Users can only see conversations they are part of.
- Users can only send messages to conversations they are participants in.
- `authenticated` users have limited permissions (no `DELETE` on messages or conversations unless specified).
- `anon` users have NO access to chat data.

### 2. Standardize Grants
We will ensure every table in the `public` schema has explicit `REVOKE ALL` and `GRANT` statements to follow the principle of least privilege.

## Proposed Changes

### Database Migrations
- Create a new migration to:
    - Revoke all permissions from `anon` for chat-related tables.
    - Grant `SELECT`, `INSERT`, `UPDATE` to `authenticated` users on `conversations`, `conversation_participants`, and `messages` with ownership-based RLS.
    - Ensure `service_role` maintains `ALL` permissions.
    - Verify RLS is enabled on all these tables.

### Frontend Verification
- No frontend changes are expected as the current chat logic already assumes these permissions.
