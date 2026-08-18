import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — Campus Connect AI" },
      {
        name: "description",
        content: "Create a new password to secure your Campus Connect AI account.",
      },
    ],
  }),
  component: ResetPasswordScreen,
});

const inputBase =
  "h-16 w-full rounded-2xl border border-border/40 bg-secondary/20 pl-14 pr-12 text-[16px] font-medium outline-none transition-all focus:border-brand/30 focus:bg-white focus:ring-4 focus:ring-brand/5";

function ResetPasswordScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const passwordRequirements = useMemo(
    () => [
      { label: "Minimum 8 characters", met: formData.password.length >= 8 },
      { label: "One uppercase letter", met: /[A-Z]/.test(formData.password) },
      { label: "One number", met: /[0-9]/.test(formData.password) },
      { label: "One special character", met: /[^A-Za-z0-9]/.test(formData.password) },
    ],
    [formData.password]
  );

  const passwordStrength = useMemo(() => {
    const metCount = passwordRequirements.filter((r) => r.met).length;
    if (metCount === 0) return { label: "", color: "bg-border", width: "0%" };
    if (metCount === 1) return { label: "Weak", color: "bg-red-500", width: "25%" };
    if (metCount === 2) return { label: "Fair", color: "bg-orange-400", width: "50%" };
    if (metCount === 3) return { label: "Strong", color: "bg-brand", width: "75%" };
    return { label: "Excellent", color: "bg-green-500", width: "100%" };
  }, [passwordRequirements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordRequirements.some((req) => !req.met)) {
      toast.error("Please meet all password requirements");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    // Simulate password update API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#6D5EF7", "#FFD700", "#FF6B6B"],
    });

    toast.success("Password updated successfully");
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col bg-white px-6 pb-12 pt-[max(1.5rem,calc(env(safe-area-inset-top)+1.5rem))]">
      {/* Header */}
      <header className="flex items-center justify-between">
        <button
          onClick={() => router.history.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-border shadow-sm transition-transform active:scale-90"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-ink" />
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <Sparkles className="h-6 w-6" />
        </div>

        <div className="w-10" />
      </header>

      <main className="mt-12 flex flex-1 flex-col">
        {!isSuccess ? (
          <div className="contents">
            <h1 className="text-[32px] font-bold leading-tight tracking-tight text-ink">
              Create a New Password
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-subtle">
              Choose a strong password to secure your account.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
              {/* New Password */}
              <div className="group flex flex-col gap-2">
                <label className="ml-1 text-[13px] font-bold uppercase tracking-wider text-subtle/60">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-subtle transition-colors group-focus-within:text-brand" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder="Enter new password"
                    className={inputBase}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-subtle transition-colors hover:text-ink"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="group flex flex-col gap-2">
                <label className="ml-1 text-[13px] font-bold uppercase tracking-wider text-subtle/60">
                  Confirm Password
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-subtle transition-colors group-focus-within:text-brand" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    placeholder="Confirm your password"
                    className={inputBase}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-subtle transition-colors hover:text-ink"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Strength & Requirements */}
              <div className="mt-2 space-y-3 px-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-subtle/50">
                    Strength
                  </span>
                  <span
                    className={cn(
                      "text-xs font-bold",
                      passwordStrength.label === "Weak" && "text-red-500",
                      passwordStrength.label === "Fair" && "text-orange-400",
                      passwordStrength.label === "Strong" && "text-brand",
                      passwordStrength.label === "Excellent" && "text-green-500"
                    )}
                  >
                    {passwordStrength.label}
                  </span>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn("h-full transition-all duration-500 ease-out", passwordStrength.color)}
                    style={{ width: passwordStrength.width }}
                  />
                </div>

                <ul className="grid grid-cols-1 gap-2 pt-2">
                  {passwordRequirements.map((req, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-[13px] font-medium transition-colors">
                      <span
                        className={cn(
                          "flex h-4.5 w-4.5 items-center justify-center rounded-full border transition-all duration-300",
                          req.met ? "border-green-500 bg-green-500 text-white" : "border-border text-transparent"
                        )}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span className={cn(req.met ? "text-ink" : "text-subtle/70")}>{req.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "relative mt-4 flex h-16 w-full items-center justify-center overflow-hidden rounded-2xl bg-brand text-[17px] font-bold text-white shadow-lg shadow-brand/20 transition-all active:scale-[0.98] disabled:opacity-70",
                  isSubmitting && "cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-3 border-white/30 border-t-white" />
                ) : (
                  <>
                    <span>Update Password</span>
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-[32px] bg-green-50 text-green-500 shadow-sm animate-in zoom-in-50 duration-500">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="mt-8 text-[28px] font-bold tracking-tight text-ink">Password Updated</h2>
            <p className="mt-4 px-4 text-[16px] leading-relaxed text-subtle">
              ✓ Password updated successfully.
            </p>

            <Link
              to="/login"
              className="mt-12 flex h-16 w-full items-center justify-center rounded-2xl bg-brand text-[17px] font-bold text-white shadow-lg shadow-brand/20 transition-all active:scale-[0.98]"
            >
              Go to Login
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
