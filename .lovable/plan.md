# Plan - Premium Create Account Screen

Create a high-fidelity "Create Account" screen for Campus Connect AI that follows the established Apple/Airbnb-inspired design language.

## Design Goals
- Premium, minimal, and welcoming UI.
- Interactive password strength validation.
- Success state with full-screen animation.
- Mobile-first approach with safe area respect.

## Proposed Changes

### Styles & Assets
- Use existing design tokens in `src/styles.css` (Brand purple, Ink, Subtle gray).
- Use Lucide icons for inputs and benefits.

### Components
- **SignupForm**: A clean, rounded card containing the multi-step validation logic.
- **PasswordStrength**: Real-time feedback component for password requirements.
- **SuccessOverlay**: Full-screen success view with an animated checkmark.

### Routing
- Create `src/routes/signup.tsx`.
- Update `src/routes/login.tsx` to link to the signup page.

## Technical Details
- **State Management**: React `useState` for form fields, validation errors, and password strength tracking.
- **Animations**: Tailwind utilities and Framer Motion (or simple CSS transitions) for smooth element entrances and state changes.
- **Validation**: Regex-based email and password strength checks.
- **Accessibility**: ARIA labels, semantic HTML, and proper focus management.

## User Review Required

> [!IMPORTANT]
> This screen includes a "Success" state that will appear after clicking "Create Account". Do you want this to be a separate route later or just a UI state on this page for now? (Defaulting to UI state for a seamless experience).
