# Plan: Email Verification with 6-Digit Code

The user wants to replace the current email verification logic (which uses a link) with a 6-digit code (OTP) system. This involves updating the UI to include a code input field and changing the backend calls to use Supabase's `verifyOtp` method.

## User Review Required

> [!IMPORTANT]
> The Supabase project must be configured to support OTP-based email verification. If it is currently set to link-based verification, the code sent by email might not be recognized as an OTP unless the Supabase Auth settings are updated. I will implement the logic assuming OTP is enabled or will be used.

## Proposed Changes

### 1. Verification UI Update (`src/routes/verify-email.tsx`)
- Replace the "I've Verified My Email" button logic with a 6-digit code input field.
- Add a new state for the code input.
- Update the `handleVerify` function to use `supabase.auth.verifyOtp`.
- Adjust the layout to accommodate the input field while maintaining the premium design.

### 2. Form Logic & API Integration
- Implement `supabase.auth.verifyOtp({ email, token, type: 'signup' })`.
- Handle verification success (redirect to profile setup) and failure (show error message).
- Update the resend logic to ensure it supports OTP if necessary (though `supabase.auth.resend({ type: 'signup', email })` usually works for both).

## Technical Details

- **Input Component**: Will use a segmented 6-digit input UI or a single input with character spacing for a premium feel.
- **Supabase Integration**:
  ```typescript
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'signup'
  })
  ```
- **Error Handling**: Provide clear feedback for incorrect or expired codes.

## Verification Plan

### Manual Verification
- Navigate to `/verify-email`.
- Enter a dummy 6-digit code and observe the error handling.
- Verify the "Resend Code" functionality and timer.
- Ensure the UI matches the premium "Apple + Airbnb + Spotify" aesthetic of the rest of the app.

### Automated Testing
- Use Playwright to simulate entering a code and clicking verify.
- Test the validation of the 6-digit input (ensure only numbers are allowed).
