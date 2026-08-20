import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { 
  ArrowLeft, 
  Mail, 
  CheckCircle2, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — Campus Connect AI" },
      {
        name: "description",
        content: "Reset your password to get back to finding your perfect study partner.",
      },
    ],
  }),
  component: ForgotPasswordScreen,
});

function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        setIsSuccess(true);
        toast.success("Reset link sent!");
        // The user specifically asked for an alert box as well
        alert("✓ reset link has been sent");
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col bg-white px-6 pb-12 pt-[max(1.5rem,calc(env(safe-area-inset-top)+1.5rem))]">
      {/* Header Navigation */}
      <header className="fade-up flex items-center justify-between">
        <button 
          onClick={() => router.history.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-border shadow-sm transition-transform active:scale-90"
        >
          <ArrowLeft className="h-5 w-5 text-ink" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <main className="mt-12 flex flex-1 flex-col">
        {!isSuccess ? (
          <div className="fade-up contents">
            <h1 className="text-[32px] font-bold leading-tight tracking-tight text-ink">
              Forgot your password?
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-subtle">
              Don't worry. Enter your email address and we'll send you a password reset link.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
              <div className="group flex flex-col gap-2">
                <label className="ml-1 text-[13px] font-bold uppercase tracking-wider text-subtle/60">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-subtle transition-colors group-focus-within:text-brand" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-16 w-full rounded-2xl border border-border/40 bg-secondary/20 pl-14 pr-6 text-[16px] font-medium outline-none transition-all focus:border-brand/30 focus:bg-white focus:ring-4 focus:ring-brand/5"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "relative flex h-16 w-full items-center justify-center overflow-hidden rounded-2xl bg-brand text-[17px] font-bold text-white shadow-lg shadow-brand/20 transition-all active:scale-[0.98] disabled:opacity-70",
                  isSubmitting && "cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-3 border-white/30 border-t-white" />
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-auto pt-8 text-center">
              <Link 
                to="/login"
                className="text-[15px] font-bold text-subtle transition-colors hover:text-brand active:scale-95"
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="fade-up flex flex-1 flex-col items-center justify-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-[32px] bg-brand/10 text-brand animate-in zoom-in-50 duration-500">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="mt-8 text-[24px] font-bold tracking-tight text-ink">
              Check your inbox
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-subtle px-4">
              ✓ Password reset link sent successfully. Please follow the instructions in the email.
            </p>
            
            <button
              onClick={() => setIsSuccess(false)}
              className="mt-10 text-[15px] font-bold text-brand active:scale-95"
            >
              Didn't receive the email? Try again
            </button>

            <Link
              to="/login"
              className="mt-12 flex h-16 w-full items-center justify-center rounded-2xl bg-secondary text-[17px] font-bold text-ink transition-transform active:scale-[0.98]"
            >
              Back to Login
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
