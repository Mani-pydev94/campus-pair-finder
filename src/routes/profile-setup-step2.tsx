import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  GraduationCap, 
  Book, 
  Laptop, 
  Rocket, 
  Lightbulb, 
  Check, 
  ChevronDown,
  Search,
  CheckCircle2,
  Sparkles,
  Plus
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
      { title: "Academic Profile Setup — Campus Connect AI" },
      {
        name: "description",
        content: "Complete your academic profile to help Campus Connect AI find your perfect study partners.",
      },
    ],
  }),
  component: AcademicProfileSetup,
});

const DEGREES = ["B.Tech", "B.Sc", "B.Com", "BBA", "MBA", "M.Tech", "MCA", "BCA", "Other"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate", "Postgraduate"];
const SKILLS = ["Python", "Java", "Azure", "AWS", "Machine Learning", "Data Science", "SQL", "Cloud Computing", "UI/UX", "JavaScript", "React", "Cybersecurity"];
const INTERESTS = ["Study Partner", "Hackathons", "Startup Ideas", "Research", "Open Source", "Competitive Programming", "Certification Preparation", "Group Projects", "Networking"];
const CAREER_GOALS = ["Software Engineer", "Data Engineer", "AI Engineer", "Cloud Engineer", "Research Scientist", "Entrepreneur", "Product Manager", "Other"];

function AcademicProfileSetup() {
  const router = useRouter();
  const [university, setUniversity] = useState("");
  const [degree, setDegree] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [careerGoal, setCareerGoal] = useState("");
  const [learningBio, setLearningBio] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const toggleItem = (item: string, state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>) => {
    setState(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleComplete = () => {
    setIsSuccess(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6D5EF7', '#23C8A4', '#FFFFFF']
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-10 overflow-x-hidden font-inter">
      {/* Top Bar */}
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-30">
        <button 
          onClick={() => router.history.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#121212]" />
        </button>
        
        <h2 className="font-semibold text-[#121212]">Academic Profile</h2>
        
        <button 
          onClick={() => router.navigate({ to: "/home" })}
          className="text-[#6D5EF7] font-semibold text-sm hover:opacity-80 transition-opacity"
        >
          Skip
        </button>
      </header>

      {/* Progress Indicator */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-[#7B7B7B] uppercase tracking-wider">Step 2 of 2</span>
          <span className="text-[10px] font-bold text-[#6D5EF7]">100% complete</span>
        </div>
        <div className="h-1.5 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: "50%" }}
            animate={{ width: "100%" }}
            className="h-full bg-[#6D5EF7] rounded-full transition-all duration-1000"
          />
        </div>
      </div>

      <main className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full">
        {/* Hero Section */}
        <div className="relative h-[25vh] flex items-center justify-center mb-8">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10"
          >
            <img 
              src="/src/assets/academic-setup-hero.png" 
              alt="Academic Setup" 
              className="h-44 w-auto object-contain"
            />
          </motion.div>
          
          {/* Floating Icons */}
          <motion.div 
            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            className="absolute top-4 right-8 p-2.5 bg-white rounded-xl shadow-lg z-20"
          >
            <GraduationCap className="w-5 h-5 text-[#6D5EF7]" />
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            className="absolute bottom-8 left-6 p-2 bg-white rounded-lg shadow-md z-20"
          >
            <Book className="w-4 h-4 text-[#23C8A4]" />
          </motion.div>

          <motion.div 
            animate={{ scale: [1, 1.1, 1], x: [0, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
            className="absolute top-1/2 left-4 p-2 bg-white rounded-lg shadow-sm z-20"
          >
            <Laptop className="w-4 h-4 text-[#6D5EF7]" />
          </motion.div>

          <motion.div 
            animate={{ y: [0, -8, 0], x: [0, -5, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute top-8 left-1/4 p-2 bg-white rounded-lg shadow-sm z-20"
          >
            <Rocket className="w-4 h-4 text-orange-400" />
          </motion.div>

          <motion.div 
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-12 right-1/4 p-2 bg-white rounded-lg shadow-sm z-20"
          >
            <Lightbulb className="w-4 h-4 text-yellow-400" />
          </motion.div>
        </div>

        {/* Headline & Description */}
        <div className="text-center mb-10">
          <h1 className="text-[32px] font-bold text-[#121212] mb-3 leading-tight">Build Your Academic Profile 🎓</h1>
          <p className="text-[#7B7B7B] text-base leading-relaxed px-2">
            Tell us about your academic journey so our AI can connect you with the right students.
          </p>
        </div>

        {/* Academic Profile Card */}
        <Card className="p-6 border-[#E5E7EB] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.06)] rounded-[24px] space-y-8 mb-8">
          {/* Field 1: College */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium text-[#121212]">College or University</Label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7B7B7B]" />
              <Input 
                placeholder="Select your college"
                className="h-14 pl-12 rounded-2xl border-[#E5E7EB] bg-gray-50/50 focus:bg-white transition-all text-[15px] placeholder:text-[#7B7B7B]/60"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
              />
            </div>
          </div>

          {/* Field 2: Degree */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium text-[#121212]">Degree</Label>
            <div className="relative">
              <select 
                className="w-full h-14 rounded-2xl border border-[#E5E7EB] bg-gray-50/50 appearance-none px-4 text-[15px] focus:outline-none focus:border-[#6D5EF7] focus:bg-white transition-all text-[#121212]"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
              >
                <option value="" disabled>Select your degree</option>
                {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B7B7B] pointer-events-none" />
            </div>
          </div>

          {/* Field 3: Field of Study */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium text-[#121212]">Field of Study</Label>
            <Input 
              placeholder="Computer Science, Electronics, etc."
              className="h-14 rounded-2xl border-[#E5E7EB] bg-gray-50/50 focus:bg-white transition-all text-[15px]"
              value={fieldOfStudy}
              onChange={(e) => setFieldOfStudy(e.target.value)}
            />
          </div>

          {/* Field 4: Year of Study */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[#121212]">Year of Study</Label>
            <div className="grid grid-cols-2 gap-2.5">
              {YEARS.map((year) => (
                <button
                  key={year}
                  onClick={() => setYearOfStudy(year)}
                  className={cn(
                    "px-4 py-3.5 rounded-xl text-sm font-semibold transition-all border text-center",
                    yearOfStudy === year 
                      ? "bg-[#6D5EF7] border-[#6D5EF7] text-white shadow-md shadow-[#6D5EF7]/20" 
                      : "bg-white border-[#E5E7EB] text-[#7B7B7B] hover:border-[#6D5EF7]/30"
                  )}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* Field 5: Skills */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[#121212]">Skills</Label>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleItem(skill, selectedSkills, setSelectedSkills)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-2",
                    selectedSkills.includes(skill)
                      ? "bg-[#6D5EF7]/10 border-[#6D5EF7]/20 text-[#6D5EF7]" 
                      : "bg-white border-[#E5E7EB] text-[#7B7B7B]"
                  )}
                >
                  {skill}
                  {selectedSkills.includes(skill) && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
              <button className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-dashed border-[#E5E7EB] text-[#7B7B7B] hover:bg-gray-50 flex items-center gap-2">
                Add Skill <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Field 6: Academic Interests */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[#121212]">Academic Interests</Label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleItem(interest, selectedInterests, setSelectedInterests)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-2",
                    selectedInterests.includes(interest)
                      ? "bg-[#23C8A4]/10 border-[#23C8A4]/20 text-[#23C8A4]" 
                      : "bg-white border-[#E5E7EB] text-[#7B7B7B]"
                  )}
                >
                  {interest}
                  {selectedInterests.includes(interest) && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Field 7: Career Goals */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[#121212]">Career Goals</Label>
            <div className="flex flex-wrap gap-2">
              {CAREER_GOALS.map((goal) => (
                <button
                  key={goal}
                  onClick={() => setCareerGoal(goal)}
                  className={cn(
                    "px-5 py-3 rounded-2xl text-[13px] font-semibold transition-all border",
                    careerGoal === goal
                      ? "bg-[#6D5EF7] border-[#6D5EF7] text-white" 
                      : "bg-white border-[#E5E7EB] text-[#7B7B7B]"
                  )}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Current Learning Card */}
        <Card className="p-6 border-[#E5E7EB] shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[24px] space-y-4 mb-8">
          <Label className="text-sm font-bold text-[#121212]">What are you currently learning?</Label>
          <textarea
            rows={3}
            placeholder="Example: Preparing for Azure certifications and improving my Python skills."
            className="w-full p-4 rounded-2xl border border-[#E5E7EB] bg-gray-50/50 focus:bg-white focus:border-[#6D5EF7] focus:outline-none transition-all text-[15px] resize-none placeholder:text-[#7B7B7B]/60 leading-relaxed"
            value={learningBio}
            onChange={(e) => setLearningBio(e.target.value)}
          />
          <p className="text-[10px] text-[#7B7B7B] italic">Optional field but helps AI matching.</p>
        </Card>

        {/* Profile Completion Card */}
        <Card className="p-6 border-none bg-gray-50/80 rounded-[24px] mb-8 flex items-center gap-6">
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-gray-200"
                strokeWidth="3"
              />
              <motion.circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-[#10B981]"
                strokeWidth="3"
                strokeDasharray="100, 100"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-[#121212]">100%</span>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-[#121212] mb-2">Your Profile Is Ready</h4>
            <div className="space-y-1">
              {[
                "Personal Information",
                "Academic Information",
                "Skills",
                "Interests"
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                  <span className="text-[10px] font-medium text-[#121212]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* AI Preview Card */}
        <Card className="p-6 border-none bg-gradient-to-br from-[#6D5EF7] to-[#A78BFA] rounded-[24px] mb-10 text-white relative overflow-hidden">
          <Sparkles className="absolute top-4 right-4 w-6 h-6 text-white/30" />
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">AI Match Engine</span>
          </div>
          <p className="text-sm font-medium mb-4">Based on your profile, we'll help you discover:</p>
          <div className="grid grid-cols-1 gap-2">
            {[
              "Study Partners",
              "Project Teammates",
              "Hackathon Teams",
              "Research Groups",
              "Future Collaborators"
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-white/70" />
                <span className="text-xs font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Primary Button */}
        <Button 
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#6D5EF7] to-[#A78BFA] text-lg font-bold text-white shadow-lg shadow-[#6D5EF7]/20 hover:scale-[1.01] active:scale-[0.98] transition-all"
          onClick={handleComplete}
        >
          Complete Profile
        </Button>
      </main>

      {/* Success Animation Overlay */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className="w-40 h-40 rounded-full bg-[#6D5EF7]/10 flex items-center justify-center mb-10"
            >
              <div className="w-28 h-28 rounded-full bg-[#6D5EF7] flex items-center justify-center shadow-2xl shadow-[#6D5EF7]/30">
                <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={3} />
              </div>
            </motion.div>

            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[32px] font-bold text-[#121212] mb-4 leading-tight"
            >
              🎉 Your Profile Is Complete!
            </motion.h2>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[#7B7B7B] text-lg mb-12 max-w-xs leading-relaxed"
            >
              Your AI profile is ready. Let's start finding students who match your goals, interests and learning style.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full"
            >
              <Button 
                className="w-full h-15 rounded-2xl bg-[#6D5EF7] text-lg font-bold text-white shadow-xl active:scale-[0.98] transition-all"
                onClick={() => router.navigate({ to: "/home" })}
              >
                Start Exploring
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
