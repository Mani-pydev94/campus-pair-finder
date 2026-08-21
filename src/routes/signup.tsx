import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useMemo, type FormEvent } from "react";
import { 
  ArrowLeft, 
  GraduationCap, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  Check, 
  X,
  Target,
  Rocket,
  BookOpen,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — Campus Connect AI" },
      {
        name: "description",
        content: "Join thousands of students discovering the right people to learn, build and grow together.",
      },
      { property: "og:title", content: "Create Account — Campus Connect AI" },
      {
        property: "og:description",
        content: "Join thousands of students discovering the right people to learn, build and grow together.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignupScreen,
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

function SignupScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordRequirements = useMemo(() => [
    { label: "Minimum 8 characters", met: formData.password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(formData.password) },
    { label: "One lowercase letter", met: /[a-z]/.test(formData.password) },
    { label: "One number", met: /[0-9]/.test(formData.password) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(formData.password) },
  ], [formData.password]);

  const passwordStrength = useMemo(() => {
    const metCount = passwordRequirements.filter(r => r.met).length;
    if (metCount === 0) return { label: "", color: "bg-line", width: "0%" };
    if (metCount <= 2) return { label: "Weak", color: "bg-danger", width: "25%" };
    if (metCount <= 3) return { label: "Fair", color: "bg-orange-400", width: "50%" };
    if (metCount <= 4) return { label: "Strong", color: "bg-brand", width: "75%" };
    return { label: "Excellent", color: "bg-mint", width: "100%" };
  }, [passwordRequirements]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
    if (errors[id]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.name.trim()) nextErrors["name"] = "Please enter your name.";
    
    const emailValue = formData.email.trim();
    if (!emailValue) nextErrors["email"] = "Please enter your college email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailValue))
      nextErrors["email"] = "Please enter a valid college email.";

    if (passwordRequirements.filter(r => !r.met).length > 0) {
      nextErrors["password"] = "Password doesn't meet security requirements.";
    }

    if (formData.confirmPassword !== formData.password) {
      nextErrors["confirmPassword"] = "Passwords do not match.";
    }

    if (!formData.agreeTerms) {
      nextErrors["agreeTerms"] = "You must agree to the terms.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          display_name: formData.name,
        },
      },
    });

    setLoading(false);

    if (error) {
      setErrors({ email: error.message });
      return;
    }

    if (data.user) {
      setSuccess(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6D5EF7", "#23C8A4", "#FFD700"],
      });
    }
  }

  async function handleSocialLogin(provider: "google" | "microsoft") {
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin + "/home",
    });

    if (result.error) {
      console.error(`${provider} login error:`, result.error);
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-6 text-center animate-in fade-in duration-500">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-mint/10 text-mint animate-in zoom-in duration-700 delay-300 fill-mode-both">
          <CheckCircle2 className="h-16 w-16" strokeWidth={1.5} />
        </div>
        <h2 className="mt-8 text-3xl font-bold tracking-tight text-ink">Welcome to Campus Connect! 🎉</h2>
        <p className="mt-4 text-base text-subtle">Your account has been created successfully.</p>
        <button
          onClick={() => router.navigate({ to: "/login" })}
          className="mt-12 flex h-14 w-full max-w-[300px] items-center justify-center rounded-2xl bg-gradient-to-r from-brand to-brand-light text-lg font-semibold text-on-brand shadow-cta transition-transform active:scale-[0.97]"
        >
          Continue to Login
        </button>
      </div>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-background px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(3.5rem,calc(env(safe-area-inset-top)+2rem))] overflow-x-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.history.back()}
          aria-label="Go back"
          className="fade-up flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-transform duration-150 active:scale-[0.94]"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="fade-up flex items-center gap-2" style={{ animationDelay: "40ms" }}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-on-brand">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-sm font-bold tracking-tight text-ink">Campus Connect AI</span>
        </div>
        <div className="w-11" /> {/* Spacer */}
      </div>

      {/* Header */}
      <div className="fade-up mt-8 flex flex-col items-center text-center" style={{ animationDelay: "80ms" }}>
        <h1 className="text-[32px] font-bold tracking-[-0.02em] text-ink">Create Your Account ✨</h1>
        <p className="mt-3 max-w-[80%] text-base font-medium leading-relaxed text-subtle">
          Join thousands of students discovering the right people to learn, build and grow together.
        </p>
      </div>

      {/* Signup Card */}
      <form
        onSubmit={onSubmit}
        noValidate
        className="fade-up mt-8 rounded-[24px] border border-line/60 bg-card p-6 shadow-[0_18px_40px_-24px_rgba(18,18,18,0.25)]"
        style={{ animationDelay: "160ms" }}
      >
        <fieldset disabled={loading} className="space-y-5 disabled:opacity-70">
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="text-sm font-medium text-ink">Full Name</label>
            <div className="relative mt-1.5">
              <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-subtle" />
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                className={cn(inputBase, errors["name"] && "border-danger focus:border-danger")}
              />
            </div>
            {errors["name"] && <p className="mt-1.5 text-xs font-medium text-danger">{errors["name"]}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-ink">Student Email</label>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-subtle" />
              <input
                id="email"
                type="email"
                placeholder="Enter your college email"
                value={formData.email}
                onChange={handleInputChange}
                className={cn(inputBase, errors["email"] && "border-danger focus:border-danger")}
              />
            </div>
            <p className="mt-1.5 text-xs text-subtle">Use your official university email for verification.</p>
            {errors["email"] && <p className="mt-1.5 text-xs font-medium text-danger">{errors["email"]}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="text-sm font-medium text-ink">Password</label>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-subtle" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
                className={cn(inputBase, "pr-12", errors["password"] && "border-danger focus:border-danger")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-subtle hover:text-ink transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-subtle">Strength</span>
                <span className={cn("text-xs font-bold", 
                  passwordStrength.label === "Weak" && "text-danger",
                  passwordStrength.label === "Fair" && "text-orange-400",
                  passwordStrength.label === "Strong" && "text-brand",
                  passwordStrength.label === "Excellent" && "text-mint",
                )}>{passwordStrength.label}</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-line">
                <div 
                  className={cn("h-full transition-all duration-500 ease-out", passwordStrength.color)}
                  style={{ width: passwordStrength.width }}
                />
              </div>
              <ul className="grid grid-cols-1 gap-1.5">
                {passwordRequirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs font-medium transition-colors">
                    <span className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border transition-all duration-300",
                      req.met ? "bg-mint border-mint text-white" : "border-line text-transparent"
                    )}>
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    <span className={cn(req.met ? "text-ink" : "text-subtle")}>{req.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            {errors["password"] && <p className="mt-2 text-xs font-medium text-danger">{errors["password"]}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="text-sm font-medium text-ink">Confirm Password</label>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-subtle" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={cn(inputBase, "pr-12", errors["confirmPassword"] && "border-danger focus:border-danger")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-subtle hover:text-ink transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors["confirmPassword"] && <p className="mt-1.5 text-xs font-medium text-danger">{errors["confirmPassword"]}</p>}
          </div>

          {/* Terms */}
          <div className="flex flex-col gap-2">
            <label htmlFor="agreeTerms" className="group flex cursor-pointer items-start gap-3">
              <div className="relative mt-0.5 flex h-5 w-5 items-center justify-center">
                <input
                  id="agreeTerms"
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  className="peer h-5 w-5 appearance-none rounded-md border border-line transition-all checked:bg-brand checked:border-brand"
                />
                <Check className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={3} />
              </div>
              <span className="text-sm leading-tight text-subtle">
                I agree to the <Link to="/signup" className="font-semibold text-brand">Terms of Service</Link> and <Link to="/signup" className="font-semibold text-brand">Privacy Policy</Link>.
              </span>
            </label>
            {errors["agreeTerms"] && <p className="text-xs font-medium text-danger">{errors["agreeTerms"]}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand to-brand-light text-[18px] font-semibold text-white shadow-cta transition-transform duration-150 active:scale-[0.97] disabled:opacity-70 disabled:active:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </fieldset>
      </form>

      {/* Divider */}
      <div className="fade-up mt-8 flex items-center gap-4 text-subtle" style={{ animationDelay: "200ms" }}>
        <span className="h-px flex-1 bg-line" />
        <span className="text-[13px] font-medium">OR</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      {/* Social Buttons */}
      <div className="fade-up mt-6 flex flex-col gap-3" style={{ animationDelay: "240ms" }}>
        <button
          type="button"
          onClick={() => handleSocialLogin("google")}
          className="flex h-[54px] w-full items-center justify-center gap-3 rounded-2xl border border-line bg-background text-[15px] font-semibold text-ink transition-transform duration-150 active:scale-[0.97]"
        >
          <GoogleIcon />
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => handleSocialLogin("microsoft")}
          className="flex h-[54px] w-full items-center justify-center gap-3 rounded-2xl border border-line bg-background text-[15px] font-semibold text-ink transition-transform duration-150 active:scale-[0.97]"
        >
          <MicrosoftIcon />
          Continue with Microsoft
        </button>
      </div>

      {/* Benefits Section */}
      <div className="fade-up mt-10 space-y-6" style={{ animationDelay: "280ms" }}>
        <h3 className="text-center text-xs font-bold uppercase tracking-widest text-subtle">Why Join Campus Connect?</h3>
        <div className="grid gap-4">
          <div className="flex items-start gap-4 rounded-2xl border border-line/40 bg-card p-4 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-[15px] font-bold text-ink">AI Student Matching</h4>
              <p className="mt-0.5 text-[13px] leading-relaxed text-subtle">Find students compatible with your goals and personality.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-2xl border border-line/40 bg-card p-4 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-400/10 text-orange-500">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-[15px] font-bold text-ink">Build Amazing Projects</h4>
              <p className="mt-0.5 text-[13px] leading-relaxed text-subtle">Meet teammates for hackathons, startups and college projects.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-2xl border border-line/40 bg-card p-4 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint/10 text-mint">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-[15px] font-bold text-ink">Learn Together</h4>
              <p className="mt-0.5 text-[13px] leading-relaxed text-subtle">Discover study partners who match your learning style.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Text */}
      <p className="fade-up mt-10 mb-4 text-center text-sm font-medium text-subtle" style={{ animationDelay: "320ms" }}>
        Already have an account?{" "}
        <Link to="/login" className="font-bold text-brand transition-colors hover:text-brand-deep">
          Login
        </Link>
      </p>
    </main>
  );
}