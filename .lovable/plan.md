# Security Plan - Fix Database Permissions and RLS

The security scan (manual inspection) identified issues in the database migrations where `DELETE` permissions were granted to `authenticated` users without appropriate Row Level Security (RLS) policies or specific column-level protections. Additionally, while most tables have RLS, we should ensure all `GRANT` statements are strictly aligned with the required application logic to prevent unauthorized data manipulation.

## Technical Details

### 1. Tighten `questionnaire_responses` Permissions
The migration `20260817154411_e7a275b5-558e-4f47-9b9b-ff99df977284.sql` grants `DELETE` on `public.questionnaire_responses` to `authenticated` users. While the RLS policy `Users can manage their own responses` (using `FOR ALL`) covers this, it's safer to be explicit and ensure no other tables have excessive grants.

### 2. Verify and Standardize RLS
We will verify that `profiles` and `academic_profiles` do not have `DELETE` grants since the application doesn't currently support user-initiated account deletion through these tables directly (it's handled by `ON DELETE CASCADE` from `auth.users`).

## Proposed Changes

### Database Migrations
- Create a new migration to:
    - Revoke excessive permissions if any were found.
    - Ensure `authenticated` users can only `SELECT`, `INSERT`, and `UPDATE` their own data where appropriate.
    - Confirm `service_role` maintains `ALL` permissions for administrative tasks.

### Frontend Verification
- No frontend changes are expected as the current logic respects the ownership of data.
