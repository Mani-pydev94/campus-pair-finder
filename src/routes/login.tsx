import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, GraduationCap, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Campus Connect AI" },
      {
        name: "description",
        content: "Sign in to Campus Connect AI to continue discovering compatible students.",
      },
      { property: "og:title", content: "Login — Campus Connect AI" },
      {
        property: "og:description",
        content: "Sign in to continue discovering compatible students.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginScreen,
});

const inputBase =
  "h-14 w-full rounded-2xl border border-line bg-background pl-12 pr-4 text-[15px] text-ink outline-none transition-all duration-200 placeholder:text-subtle focus:border-brand focus:shadow-[0_6px_18px_-8px_color-mix(in_oklab,var(--color-brand)_60%,transparent)]";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2.5 24 .5 14.6.5 6.5 5.9 2.6 13.8l7.8 6c1.9-5.6 7.2-10.3 13.6-10.3z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17.3z" />
      <path fill="#FBBC05" d="M10.4 28.2a14.6 14.6 0 0 1 0-8.4l-7.8-6a23.5 23.5 0 0 0 0 20.4l7.8-6z" />
      <path fill="#34A853" d="M24 47.5c6.2 0 11.5-2 15.4-5.6l-7.5-5.8c-2.1 1.4-4.8 2.2-7.9 2.2-6.4 0-11.7-4.3-13.6-10.1l-7.8 6C6.5 42.1 14.6 47.5 24 47.5z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="#F25022" d="M2 2h9.5v9.5H2z" />
      <path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
      <path fill="#00A4EF" d="M2 12.5h9.5V22H2z" />
      <path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
    </svg>
  );
}

function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: { email?: string; password?: string } = {};
    const value = email.trim();
    if (!value) next.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value))
      next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      router.navigate({ to: "/home" });
    }, 1600);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-background px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(3.5rem,calc(env(safe-area-inset-top)+2rem))]">
      <button
        type="button"
        onClick={() => router.history.back()}
        aria-label="Go back"
        className="fade-up flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-transform duration-150 active:scale-[0.94]"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <div className="fade-up mt-8 flex flex-col items-center" style={{ animationDelay: "60ms" }}>
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-deep shadow-cta">
          <GraduationCap className="h-8 w-8 text-on-brand" />
        </span>
        <h1 className="mt-6 text-[32px] font-bold tracking-[-0.02em] text-ink">Welcome Back 👋</h1>
        <p className="mt-2 max-w-[85%] text-center text-base font-medium leading-[1.5] text-subtle">
          Sign in to continue discovering compatible students.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        noValidate
        className="fade-up mt-8 rounded-[20px] border border-line/60 bg-card p-6 shadow-[0_18px_40px_-24px_rgba(18,18,18,0.25)]"
        style={{ animationDelay: "140ms" }}
      >
        <fieldset disabled={loading} className="space-y-5 disabled:opacity-70">
          <div>
            <label htmlFor="email" className="text-sm font-semibold text-ink">
              Email Address
            </label>
            <div className="relative mt-2">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-subtle" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={inputBase + (errors.email ? " border-danger" : "")}
              />
            </div>
            {errors.email && <p className="mt-2 text-[13px] text-danger">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-semibold text-ink">
              Password
            </label>
            <div className="relative mt-2">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-subtle" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={inputBase + " pr-12" + (errors.password ? " border-danger" : "")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-subtle transition-colors hover:text-ink"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-2 text-[13px] text-danger">{errors.password}</p>}
          </div>

          <div className="flex justify-end">
            <button type="button" className="text-sm font-semibold text-brand">
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand to-brand-light text-[18px] font-semibold text-on-brand shadow-cta transition-transform duration-150 active:scale-[0.97]"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {loading ? "Signing In..." : "Login"}
          </button>
        </fieldset>
      </form>

      <div className="fade-up mt-8 flex items-center gap-4" style={{ animationDelay: "220ms" }}>
        <span className="h-px flex-1 bg-line" />
        <span className="text-[13px] font-medium text-subtle">OR</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="fade-up mt-6 space-y-3" style={{ animationDelay: "280ms" }}>
        <button
          type="button"
          className="flex h-[54px] w-full items-center justify-center gap-3 rounded-[14px] border border-line bg-background text-[15px] font-semibold text-ink transition-transform duration-150 active:scale-[0.97]"
        >
          <GoogleIcon />
          Continue with Google
        </button>
        <button
          type="button"
          className="flex h-[54px] w-full items-center justify-center gap-3 rounded-[14px] border border-line bg-background text-[15px] font-semibold text-ink transition-transform duration-150 active:scale-[0.97]"
        >
          <MicrosoftIcon />
          Continue with Microsoft
        </button>
      </div>

      <p
        className="fade-up mt-auto pt-10 text-center text-[15px] text-subtle"
        style={{ animationDelay: "340ms" }}
      >
        Don't have an account?{" "}
        <Link to="/signup" className="font-semibold text-brand">
          Create Account
        </Link>
      </p>
    </main>
  );
}
