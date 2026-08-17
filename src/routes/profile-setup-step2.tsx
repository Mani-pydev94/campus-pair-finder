import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Book, 
  Check, 
  GraduationCap, 
  Sparkles,
  School,
  Calendar,
  Search,
  CheckCircle2,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

export const Route = createFileRoute('/profile-setup-step2')({
  head: () => ({
    meta: [
      { title: "Academic Profile — Campus Connect AI" },
      {
        name: "description",
        content: "Tell us about your studies to find the best academic matches.",
      },
    ],
  }),
  component: ProfileSetupStep2Screen,
});

const STUDY_STYLES = [
  "Visual Learner", 
  "Auditory", 
  "Kinesthetic", 
  "Late Night", 
  "Early Bird",
  "Group Study",
  "Solo Focused"
];

const INTERESTS = [
  "Tech", "Business", "Arts", "Sports", 
  "Gaming", "Music", "Reading", "Travel",
  "Design", "Science", "Fitness", "Coding"
];

const GRAD_YEARS = ["2024", "2025", "2026", "2027", "2028+"];

function ProfileSetupStep2Screen() {
  const router = useRouter();
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [careerGoal, setCareerGoal] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev => 
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleFinish = () => {
    setIsSuccess(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6D5EF7', '#A78BFA', '#F472B6']
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-10 overflow-x-hidden">
      {/* Top Bar */}
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <button 
          onClick={() => router.history.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 border border-line hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-ink" />
        </button>
        
        <h2 className="font-bold text-ink text-sm uppercase tracking-wider">Academic Profile</h2>
        
        <button 
          onClick={() => router.navigate({ to: "/home" })}
          className="text-brand font-semibold text-sm hover:opacity-80 transition-opacity"
        >
          Skip
        </button>
      </header>

      {/* Progress Indicator */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-subtle uppercase tracking-wider text-[10px]">Step 2 of 2</span>
          <span className="text-xs font-bold text-mint text-[10px]">Almost there!</span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: "50%" }}
            animate={{ width: "100%" }}
            className="h-full bg-brand rounded-full transition-all duration-1000"
          />
        </div>
      </div>

      <main className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full">
        {/* Hero Section */}
        <div className="relative h-[20vh] flex items-center justify-center mb-6">
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10"
          >
            <img 
              src="/src/assets/profile-setup-step2.png" 
              alt="Academic Setup" 
              className="h-32 w-auto object-contain"
            />
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-2 right-16 p-2 bg-white rounded-xl shadow-lg z-20"
          >
            <Book className="w-5 h-5 text-brand" />
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, 8, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-4 left-16 p-2 bg-white rounded-lg shadow-md z-20"
          >
            <Globe className="w-4 h-4 text-mint" />
          </motion.div>
        </div>

        {/* Headline */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ink mb-3 leading-tight">Focus & Goals 🎓</h1>
          <p className="text-subtle text-sm leading-relaxed px-4">
            Tell us about your academic journey to help our AI find your ideal learning partners.
          </p>
        </div>

        {/* Academic Card */}
        <Card className="p-6 border-line shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] rounded-[24px] space-y-8 mb-8">
          {/* University */}
          <div className="space-y-2.5">
            <Label className="text-sm font-bold text-ink flex items-center gap-2">
              University / College
              <span className="text-brand text-xs">*</span>
            </Label>
            <div className="relative">
              <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle/50" />
              <Input 
                placeholder="Where do you study?"
                className="h-14 pl-12 rounded-2xl border-line bg-gray-50/50 focus:bg-white transition-all text-[15px] placeholder:text-subtle/60"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Major */}
            <div className="space-y-2.5 col-span-2">
              <Label className="text-sm font-bold text-ink">Major / Field of Study</Label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle/50" />
                <Input 
                  placeholder="e.g. Computer Science"
                  className="h-14 pl-12 rounded-2xl border-line bg-gray-50/50 focus:bg-white transition-all text-[15px]"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                />
              </div>
            </div>

            {/* Graduation Year */}
            <div className="space-y-2.5 col-span-2">
              <Label className="text-sm font-bold text-ink">Expected Graduation</Label>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {GRAD_YEARS.map((year) => (
                  <button
                    key={year}
                    onClick={() => setGradYear(year)}
                    className={cn(
                      "px-5 py-3 rounded-xl text-sm font-bold transition-all border shrink-0",
                      gradYear === year 
                        ? "bg-brand border-brand text-white shadow-md shadow-brand/20" 
                        : "bg-white border-line text-subtle hover:border-brand/30"
                    )}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Study Style */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-ink">Your Study Style</Label>
            <div className="flex flex-wrap gap-2">
              {STUDY_STYLES.map((style) => (
                <button
                  key={style}
                  onClick={() => toggleStyle(style)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all border flex items-center gap-2",
                    selectedStyles.includes(style)
                      ? "bg-brand border-brand text-white shadow-sm" 
                      : "bg-white border-line text-subtle hover:bg-gray-50"
                  )}
                >
                  {style}
                  {selectedStyles.includes(style) && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Interests Card */}
        <div className="space-y-4 mb-8">
          <Label className="text-sm font-bold text-ink px-1">Interests & Hobbies</Label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={cn(
                  "px-5 py-3 rounded-2xl text-[13px] font-semibold transition-all border",
                  selectedInterests.includes(interest)
                    ? "bg-mint/10 border-mint/20 text-mint-dark" 
                    : "bg-white border-line text-subtle hover:border-mint/30"
                )}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Career Goal */}
        <div className="space-y-2.5 mb-10">
          <div className="flex justify-between items-center px-1">
            <Label className="text-sm font-bold text-ink">AI Career Goal ✨</Label>
            <span className={cn(
              "text-[10px] font-bold uppercase",
              careerGoal.length > 90 ? "text-danger" : "text-subtle"
            )}>
              {careerGoal.length}/100
            </span>
          </div>
          <textarea
            rows={3}
            maxLength={100}
            placeholder="What's your ultimate goal? e.g. To lead AI ethics at a global scale."
            className="w-full p-4 rounded-2xl border border-line bg-gray-50/50 focus:bg-white focus:border-brand focus:outline-none transition-all text-[15px] resize-none placeholder:text-subtle/60 leading-relaxed shadow-sm shadow-black/5"
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
          />
        </div>

        {/* Finish Button */}
        <Button 
          className="w-full h-15 rounded-2xl bg-gradient-to-r from-brand to-brand-light text-lg font-bold shadow-cta hover:scale-[1.01] active:scale-[0.98] transition-all"
          onClick={handleFinish}
        >
          Finish Setup
        </Button>
      </main>

      {/* Success Animation Overlay */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className="w-32 h-32 rounded-full bg-brand/10 flex items-center justify-center mb-8"
            >
              <div className="w-24 h-24 rounded-full bg-brand flex items-center justify-center shadow-xl shadow-brand/30">
                <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
            </motion.div>

            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-ink mb-4"
            >
              Setup Complete! 🎉
            </motion.h2>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-subtle mb-10 max-w-xs leading-relaxed"
            >
              Your profile is now powered by Campus AI. Ready to find your perfect study partners?
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full"
            >
              <Button 
                className="w-full h-15 rounded-2xl bg-brand text-lg font-bold shadow-lg active:scale-[0.98] transition-all"
                onClick={() => router.navigate({ to: "/questionnaire-intro" })}
              >
                Let's Go!
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
