import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronDown,
  Loader2,
  User,
  X,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  BookOpen,
  Target,
  Globe,
  Heart,
  Code2,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const Route = createFileRoute('/edit-profile')({
  head: () => ({
    meta: [
      { title: "Edit Profile — Campus Connect AI" },
      {
        name: "description",
        content: "Edit your Campus Connect AI profile, academic details, and preferences.",
      },
    ],
  }),
  component: EditProfileScreen,
});

const DEGREES = ["B.Tech", "B.Sc", "B.Com", "BBA", "MBA", "M.Tech", "MCA", "BCA", "Other"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate", "Postgraduate"];
const SKILLS = ["Python", "Java", "Azure", "AWS", "Machine Learning", "Data Science", "SQL", "Cloud Computing", "UI/UX", "JavaScript", "React", "Cybersecurity"];
const INTERESTS = ["Study Partner", "Hackathons", "Startup Ideas", "Research", "Open Source", "Competitive Programming", "Certification Preparation", "Group Projects", "Networking"];
const CAREER_GOALS = ["Software Engineer", "Data Engineer", "AI Engineer", "Cloud Engineer", "Research Scientist", "Entrepreneur", "Product Manager", "Other"];
const LANGUAGES = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam"];

function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // Profile state
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  // Academic state
  const [university, setUniversity] = useState("");
  const [degree, setDegree] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [careerGoal, setCareerGoal] = useState("");

  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const [{ data: profile }, { data: academic }] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', session.user.id).single(),
          supabase.from('academic_profiles').select('*').eq('id', session.user.id).single()
        ]);

        if (profile) {
          setDisplayName(profile['display_name'] || "");
          setAge(profile['age']?.toString() || "");
          setBio(profile['bio'] || "");
          setSelectedLanguages(profile['languages'] || []);
          setProfilePhoto(profile['avatar_url'] || null);
        }

        if (academic) {
          setUniversity(academic['university'] || "");
          setDegree(academic['degree'] || "");
          setYearOfStudy(academic['year_of_study'] || "");
          setSelectedSkills(academic['skills'] || []);
          setSelectedInterests(academic['interests'] || []);
          setCareerGoal(academic['career_goal'] || "");
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setInitialLoading(false);
      }
    }
    loadData();
  }, []);

  // Profile strength calculation
  const strengthItems = [
    { label: "Name", completed: displayName.trim().length > 0 },
    { label: "Photo", completed: !!profilePhoto },
    { label: "Age", completed: age.trim().length > 0 },
    { label: "Bio", completed: bio.trim().length > 0 },
    { label: "Languages", completed: selectedLanguages.length > 0 },
    { label: "College", completed: university.trim().length > 0 },
    { label: "Degree", completed: degree.trim().length > 0 },
    { label: "Year", completed: yearOfStudy.trim().length > 0 },
    { label: "Skills", completed: selectedSkills.length > 0 },
    { label: "Interests", completed: selectedInterests.length > 0 },
    { label: "Career Goal", completed: careerGoal.trim().length > 0 },
  ];

  const completedCount = strengthItems.filter(i => i.completed).length;
  const strengthPercentage = Math.round((completedCount / strengthItems.length) * 100);

  const toggleItem = (item: string, state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>) => {
    setState(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setProfilePhoto(publicUrl);
      setShowPhotoDialog(false);
      toast.success("Profile photo updated");
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error("Failed to upload photo");
    } finally {
      setLoading(false);
    }
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    setShowPhotoDialog(false);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be signed in to save changes");
        return;
      }

      const profileData = {
        id: session.user.id,
        display_name: displayName,
        age: age ? parseInt(age) : null,
        bio,
        languages: selectedLanguages,
        avatar_url: profilePhoto,
        updated_at: new Date().toISOString(),
      };

      const academicData = {
        id: session.user.id,
        university,
        degree,
        year_of_study: yearOfStudy,
        skills: selectedSkills,
        interests: selectedInterests,
        career_goal: careerGoal,
        updated_at: new Date().toISOString(),
      };

      const [{ error: profileError }, { error: academicError }] = await Promise.all([
        supabase.from('profiles').upsert(profileData),
        supabase.from('academic_profiles').upsert(academicData)
      ]);

      if (profileError) throw profileError;
      if (academicError) throw academicError;

      setShowSuccess(true);
      toast.success("Profile updated successfully!");

      setTimeout(() => {
        setShowSuccess(false);
      }, 2500);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pb-8">
      {/* Top Bar */}
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-20 border-b border-line/50">
        <button
          onClick={() => router.history.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 border border-line hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-ink" />
        </button>

        <h2 className="font-bold text-ink">Edit Profile</h2>

        <button
          onClick={() => router.navigate({ to: "/home" })}
          className="text-brand font-semibold text-sm hover:opacity-80 transition-opacity"
        >
          Done
        </button>
      </header>

      <main className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full">
        {/* Profile Photo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <button
              onClick={() => setShowPhotoDialog(true)}
              className="w-28 h-28 rounded-full border-4 border-white shadow-xl bg-gray-50 flex items-center justify-center overflow-hidden relative transition-transform active:scale-95"
            >
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-subtle/50">
                  <User className="w-12 h-12 mb-1" strokeWidth={1.5} />
                </div>
              )}
              <div className="absolute bottom-1 right-1 p-2 bg-brand text-white rounded-full shadow-lg">
                <Camera className="w-4 h-4" />
              </div>
            </button>
          </div>
          <span className="mt-3 text-sm font-bold text-ink">{displayName || "Your Name"}</span>
          <span className="text-xs text-subtle">Tap photo to change</span>
        </div>

        {/* Profile Strength */}
        <Card className="p-5 border-none bg-brand/[0.03] rounded-3xl mb-8 flex items-center gap-5">
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-gray-100"
                strokeWidth="3"
              />
              <motion.circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-brand"
                strokeWidth="3"
                strokeDasharray="100, 100"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: 100 - strengthPercentage }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-ink">{strengthPercentage}%</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold text-ink">Profile Strength</h4>
              <span className="text-xs font-bold text-brand">{strengthPercentage}%</span>
            </div>
            <p className="text-xs text-subtle leading-relaxed">
              A complete profile helps our AI find better matches for you.
            </p>
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="p-6 border-line shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] rounded-[24px] space-y-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center">
              <User className="w-4 h-4 text-brand" />
            </div>
            <h3 className="text-base font-bold text-ink">Personal Information</h3>
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="name" className="text-sm font-bold text-ink">Name</Label>
            <Input
              id="name"
              placeholder="Your display name"
              className="h-14 rounded-2xl border-line bg-gray-50/50 focus:bg-white transition-all text-[15px]"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <Label className="text-sm font-bold text-ink">Age</Label>
              <div className="relative">
                <select
                  className="w-full h-14 rounded-2xl border border-line bg-gray-50/50 appearance-none px-4 text-[15px] focus:outline-none focus:border-brand focus:bg-white transition-all"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                >
                  <option value="" disabled>Select</option>
                  {["18", "19", "20", "21", "22", "23", "24", "25+"].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-sm font-bold text-ink">Languages</Label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
                <Input
                  placeholder="Add language"
                  className="h-14 pl-10 rounded-2xl border-line bg-gray-50/50 focus:bg-white transition-all text-[15px]"
                  value={selectedLanguages.join(", ")}
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between">
              <Label htmlFor="bio" className="text-sm font-bold text-ink">Bio</Label>
              <span className={cn(
                "text-[10px] font-bold uppercase",
                bio.length > 140 ? "text-danger" : "text-subtle"
              )}>
                {bio.length}/150
              </span>
            </div>
            <textarea
              id="bio"
              rows={4}
              maxLength={150}
              placeholder="Tell students about yourself..."
              className="w-full p-4 rounded-2xl border border-line bg-gray-50/50 focus:bg-white focus:border-brand focus:outline-none transition-all text-[15px] resize-none placeholder:text-subtle/60 leading-relaxed"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {/* Languages chips */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-ink">Languages</Label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => toggleItem(lang, selectedLanguages, setSelectedLanguages)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5",
                    selectedLanguages.includes(lang)
                      ? "bg-brand/10 border-brand/20 text-brand"
                      : "bg-white border-line text-subtle"
                  )}
                >
                  {lang}
                  {selectedLanguages.includes(lang) && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Academic Information */}
        <Card className="p-6 border-line shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] rounded-[24px] space-y-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-brand" />
            </div>
            <h3 className="text-base font-bold text-ink">Academic Information</h3>
          </div>

          <div className="space-y-2.5">
            <Label className="text-sm font-bold text-ink">College / University</Label>
            <div className="relative">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
              <Input
                placeholder="Enter your college name"
                className="h-14 pl-10 rounded-2xl border-line bg-gray-50/50 focus:bg-white transition-all text-[15px]"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <Label className="text-sm font-bold text-ink">Degree</Label>
              <div className="relative">
                <select
                  className="w-full h-14 rounded-2xl border border-line bg-gray-50/50 appearance-none px-4 text-[15px] focus:outline-none focus:border-brand focus:bg-white transition-all"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                >
                  <option value="" disabled>Select</option>
                  {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-sm font-bold text-ink">Year</Label>
              <div className="relative">
                <select
                  className="w-full h-14 rounded-2xl border border-line bg-gray-50/50 appearance-none px-4 text-[15px] focus:outline-none focus:border-brand focus:bg-white transition-all"
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                >
                  <option value="" disabled>Select</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-brand" />
              <Label className="text-sm font-bold text-ink">Skills</Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleItem(skill, selectedSkills, setSelectedSkills)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5",
                    selectedSkills.includes(skill)
                      ? "bg-brand/10 border-brand/20 text-brand"
                      : "bg-white border-line text-subtle"
                  )}
                >
                  {skill}
                  {selectedSkills.includes(skill) && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
              <button className="px-3.5 py-2 rounded-xl text-xs font-bold border border-dashed border-line text-subtle hover:bg-gray-50 flex items-center gap-1.5">
                Add <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <Label className="text-sm font-bold text-ink">Interests</Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleItem(interest, selectedInterests, setSelectedInterests)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5",
                    selectedInterests.includes(interest)
                      ? "bg-mint/10 border-mint/20 text-mint"
                      : "bg-white border-line text-subtle"
                  )}
                >
                  {interest}
                  {selectedInterests.includes(interest) && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Career Goals */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-brand" />
              <Label className="text-sm font-bold text-ink">Career Goal</Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {CAREER_GOALS.map((goal) => (
                <button
                  key={goal}
                  onClick={() => setCareerGoal(goal)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-bold transition-all border",
                    careerGoal === goal
                      ? "bg-brand border-brand text-white shadow-md shadow-brand/20"
                      : "bg-white border-line text-subtle"
                  )}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="mb-6 p-4 bg-mint/10 border border-mint/20 rounded-2xl flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-mint flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">Changes saved!</p>
                <p className="text-xs text-subtle">Your profile has been updated successfully.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-brand to-brand-light text-lg font-semibold shadow-cta hover:scale-[1.01] active:scale-[0.98] transition-all text-white"
            onClick={handleSave}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Save Changes
              </span>
            )}
          </Button>

          <Button
            variant="outline"
            disabled={loading}
            className="w-full h-14 rounded-2xl border-line text-ink font-semibold text-base hover:bg-gray-50 transition-all"
            onClick={() => router.history.back()}
          >
            Cancel
          </Button>
        </div>
      </main>

      {/* Photo Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="sm:max-w-[340px] rounded-[24px] p-0 border-none bg-white overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-center text-lg font-bold text-ink">Profile Photo</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-2 space-y-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-14 rounded-2xl bg-brand text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Camera className="w-5 h-5" />
              Upload Photo
            </button>
            {profilePhoto && (
              <button
                onClick={removePhoto}
                className="w-full h-14 rounded-2xl border border-line text-danger font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
                Remove Photo
              </button>
            )}
            <button
              onClick={() => setShowPhotoDialog(false)}
              className="w-full h-14 rounded-2xl border border-line text-ink font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handlePhotoUpload}
      />
    </div>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}
