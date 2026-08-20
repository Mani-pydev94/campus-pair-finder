import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Sparkles, 
  GraduationCap, 
  CheckCircle2, 
  RefreshCcw, 
  AlertCircle,
  Clock,
  ExternalLink,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import confetti from 'canvas-confetti';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import verificationHeaderAsset from '@/assets/verification-header-v2.png.asset.json';
import verificationHeroAsset from '@/assets/verification-hero.png.asset.json';

export const Route = createFileRoute('/verify-email')({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search['email'] === 'string' ? (search['email'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Verify Your Email — Campus Connect AI" },
      {
        name: "description",
        content: "One final step to join the most compatible student community.",
      },
      { property: "og:title", content: "Verify Your Email — Campus Connect AI" },
      {
        property: "og:description",
        content: "One final step to join the most compatible student community.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VerifyEmailScreen,
});

function VerifyEmailScreen() {
  const router = useRouter();
  const search = Route.useSearch();
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState<string>(search.email ?? '');
  const [otpCode, setOtpCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    async function getSession() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
        if (data.session.user.email) setEmail(data.session.user.email);
        if (data.session.user.email_confirmed_at) {
          setIsVerified(true);
        }
      }
    }
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        if (session.user.email_confirmed_at) {
          setIsVerified(true);
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [timeLeft]);

  const handleVerify = async () => {
    if (otpCode.length !== 6) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }

    setIsVerifying(true);
    const targetEmail = email || user?.email || search.email;

    if (!targetEmail) {
      toast.error("Email address not found. Please try signing up again.");
      setIsVerifying(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: targetEmail,
        token: otpCode,
        type: 'signup',
      });

      if (error) throw error;

      if (data.user) {
        setIsVerified(true);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6D5EF7', '#23C8A4', '#FFD700']
        });
        toast.success("Email verified successfully!");
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 4000);
      toast.error(error.message || "Invalid or expired verification code.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    const target = email || user?.email;
    if (!target) {
      toast.error('We need your email address to resend the link. Please sign in again.');
      return;
    }
    setIsResending(true);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: target,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });

    setIsResending(false);
    if (!error) {
      setTimeLeft(60);
      toast.success(`Verification email sent to ${target}`);
    } else {
      setShowError(true);
      setTimeout(() => setShowError(false), 4000);
      toast.error(error.message || 'Could not resend the email. Please try again.');
    }
  };


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className="w-24 h-24 bg-brand rounded-full flex items-center justify-center mb-8 relative"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-brand rounded-full"
          />
          <Check className="w-12 h-12 text-white" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-ink mb-4"
        >
          You're Verified! 🎉
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-subtle text-lg mb-12 max-w-xs"
        >
          Your account is now active. Let's build your student profile.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm"
        >
          <Button 
            asChild
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-brand to-brand-light text-lg font-semibold shadow-cta hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Link to="/profile-setup">Continue</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Bar */}
      <header className="px-6 py-4 flex flex-col items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="w-full flex items-center justify-between mb-4">
          <Link 
            to="/signup"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 border border-line hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-ink" />
          </Link>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-ink">Campus Connect AI</span>
          </div>
          
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* New Top Image */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-20 h-20 mb-2"
        >
          <img 
            src={verificationHeaderAsset.url} 
            alt="Verification Header" 
            className="w-full h-full object-contain rounded-full shadow-sm"
          />
        </motion.div>
      </header>

      <main className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full">
        {/* Hero Illustration */}
        <div className="relative h-[30vh] flex items-center justify-center mb-8">
          <motion.div
            animate={{ 
              y: [0, -10, 0],
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="relative z-10"
          >
            <img 
              src={verificationHeroAsset.url} 
              alt="Verify Email Illustration" 
              className="h-48 w-auto object-contain rounded-3xl shadow-xl"
            />
          </motion.div>
          
          {/* Floating Icons */}
          <motion.div 
            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-10 right-10 p-3 bg-white rounded-2xl shadow-lg z-20"
          >
            <Mail className="w-6 h-6 text-brand" />
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-10 left-10 p-2.5 bg-white rounded-xl shadow-md z-20"
          >
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </motion.div>

          <div className="absolute inset-0 bg-brand/5 rounded-full blur-3xl opacity-50" />
        </div>

        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center text-ink mb-3"
        >
          Verify Your Email 📩
        </motion.h1>

        {/* Description */}
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-subtle text-center mb-8 leading-relaxed"
        >
          We've sent a 6-digit verification code to your email address. Please enter it below to activate your account.
        </motion.p>

        {/* Email Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-5 border-line shadow-sm rounded-3xl mb-8 overflow-hidden relative group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-subtle mb-0.5 uppercase tracking-wider">Verification email sent to:</p>
                <p className="text-base font-bold text-ink">{email || user?.email || search.email || "student@university.edu"}</p>
              </div>
              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5 font-semibold shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Sent
              </Badge>
            </div>
          </Card>
        </motion.div>

        {/* Actions */}
        <div className="space-y-6 mb-8">
          <div className="flex flex-col items-center gap-4">
            <label className="text-sm font-semibold text-ink uppercase tracking-wider">Verification Code</label>
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={(value) => setOtpCode(value)}
              render={({ slots }) => (
                <InputOTPGroup className="gap-2 sm:gap-3">
                  {slots.map((slot, index) => (
                    <InputOTPSlot 
                      key={index} 
                      {...slot} 
                      className="w-12 h-14 sm:w-14 sm:h-16 text-xl font-bold rounded-2xl border-line bg-gray-50/50 shadow-sm focus:bg-white focus:border-brand transition-all"
                    />
                  ))}
                </InputOTPGroup>
              )}
            />
          </div>
          
          <Button 
            onClick={handleVerify}
            disabled={otpCode.length !== 6 || isVerifying}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-brand to-brand-light text-lg font-semibold shadow-cta hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
          >
            {isVerifying ? (
              <RefreshCcw className="w-5 h-5 animate-spin mr-2" />
            ) : null}
            {isVerifying ? "Verifying..." : "Verify Account"}
          </Button>

          <Button 
            variant="outline"
            disabled={timeLeft > 0 || isResending}
            onClick={handleResend}
            className="w-full h-14 rounded-2xl border-line text-ink font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-50"
          >
            {isResending ? (
              <RefreshCcw className="w-5 h-5 animate-spin" />
            ) : (
              <ExternalLink className="w-5 h-5 text-subtle" />
            )}
            Resend Verification Email
          </Button>

          {timeLeft > 0 && (
            <p className="text-center text-sm text-subtle flex items-center justify-center gap-1.5">
              <Clock className="w-4 h-4" />
              You can resend another email in <span className="font-bold text-brand">{formatTime(timeLeft)}</span>
            </p>
          )}
        </div>

        {/* Error State */}
        <AnimatePresence>
          {showError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-8"
            >
              <Card className="p-4 border-red-100 bg-red-50/50 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-900">Verification Pending</p>
                  <p className="text-xs text-red-700">We couldn't verify your status yet. Please click the link in your email.</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleVerify}
                  className="text-xs font-bold text-red-600 hover:bg-red-100"
                >
                  Try Again
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Section */}
        <Card className="p-6 bg-gray-50 border-none rounded-3xl">
          <h3 className="font-bold text-ink mb-4">Didn't receive the email?</h3>
          <ul className="space-y-3">
            {[
              "Check your spam folder.",
              "Make sure your email address is correct.",
              "Wait a few minutes.",
              "Try resending the email."
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-subtle">
                <div className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand" />
                </div>
                {text}
              </li>
            ))}
          </ul>
        </Card>
      </main>
      
      {/* Safe Area Padding */}
      <div className="h-8" />
    </div>
  );
}
