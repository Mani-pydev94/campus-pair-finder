import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Camera, 
  MapPin, 
  Check, 
  Plus, 
  Sparkles, 
  GraduationCap, 
  User,
  Info,
  ChevronDown,
  X,
  Image as ImageIcon,
  Trash2,
  Loader2,
  CheckCircle2 as LucideCheckCircle2
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
import profileSetupHeroAsset from '@/assets/profile-setup-hero.png.asset.json';

export const Route = createFileRoute('/profile-setup')({
  head: () => ({
    meta: [
      { title: "Profile Setup — Campus Connect AI" },
      {
        name: "description",
        content: "Tell us a bit about yourself to get better student matches.",
      },
    ],
  }),
  component: ProfileSetupScreen,
});

const GENDERS = ["Male", "Female", "Non-Binary", "Prefer Not To Say"];
const LANGUAGES = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam"];
const AGES = ["18", "19", "20", "21", "22", "23", "24", "25+"];

function ProfileSetupScreen() {
  const router = useRouter();
  const [step] = useState(1);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [bio, setBio] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setDisplayName(profile['display_name'] || "");
          setAge(profile['age']?.toString() || "");
          setGender(profile['gender'] || "");
          setCity(profile['city'] || "");
          setSelectedLanguages(profile['languages'] || []);
          setBio(profile['bio'] || "");
          setProfilePhoto(profile['avatar_url'] || null);
        } else if (session.user.user_metadata?.['display_name']) {
          setDisplayName(session.user.user_metadata['display_name']);
        }
      }
    }
    loadProfile();
  }, []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Strength Calculation
  const strengthItems = [
    { label: "Display Name", completed: displayName.trim().length > 0 },
    { label: "City", completed: city.trim().length > 0 },
    { label: "Languages", completed: selectedLanguages.length > 0 },
    { label: "Profile Photo", completed: !!profilePhoto },
    { label: "Bio", completed: bio.trim().length > 0 },
  ];
  
  const completedCount = strengthItems.filter(i => i.completed).length;
  const strengthPercentage = (completedCount / strengthItems.length) * 100;

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
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
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setLoading(false);
    }
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    setShowPhotoDialog(false);
  };

  const handleContinue = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          display_name: displayName,
          age: age ? parseInt(age) : null,
          gender,
          city,
          languages: selectedLanguages,
          bio,
          avatar_url: profilePhoto,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      router.navigate({ to: "/profile-setup-step2" });
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-10">
      {/* Top Bar */}
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <button 
          onClick={() => router.history.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 border border-line hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-ink" />
        </button>
        
        <h2 className="font-bold text-ink">Profile Setup</h2>
        
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
          <span className="text-xs font-bold text-subtle uppercase tracking-wider">Step {step} of 2</span>
          <span className="text-xs font-bold text-brand">{Math.round(strengthPercentage)}% complete</span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(strengthPercentage, 10)}%` }}
            className="h-full bg-brand rounded-full transition-all duration-500"
          />
        </div>
      </div>

      <main className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full">
        {/* Hero Section */}
        <div className="relative h-[22vh] flex items-center justify-center mb-6">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10"
          >
            <img 
              src={profileSetupHeroAsset.url} 
              alt="Profile Setup" 
              className="h-36 w-auto object-contain rounded-2xl shadow-lg"
            />
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            className="absolute top-4 right-12 p-2.5 bg-white rounded-xl shadow-md z-20"
          >
            <User className="w-5 h-5 text-brand" />
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, 10, 0], rotate: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            className="absolute bottom-4 left-12 p-2 bg-white rounded-lg shadow-sm z-20"
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </motion.div>
        </div>

        {/* Headline & Description */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ink mb-3">Tell Us About Yourself 👋</h1>
          <p className="text-subtle text-sm leading-relaxed">
            Let's create your profile so we can recommend students who match your personality, interests and goals.
          </p>
        </div>

        {/* Profile Photo Upload */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group">
            <button 
              onClick={() => setShowPhotoDialog(true)}
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-50 flex items-center justify-center overflow-hidden relative transition-transform active:scale-95"
            >
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-subtle/50">
                  <User className="w-12 h-12 mb-1" strokeWidth={1.5} />
                  <Camera className="w-6 h-6 absolute bottom-2 right-2 p-1.5 bg-brand text-white rounded-full shadow-lg" />
                </div>
              )}
            </button>
          </div>
          <span className="mt-3 text-xs font-bold text-subtle uppercase tracking-widest">Add Profile Photo</span>
          <span className="text-[10px] text-subtle/60 mt-1 italic">Optional but recommended</span>
        </div>

        {/* Profile Card */}
        <Card className="p-6 border-line shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] rounded-[24px] space-y-8 mb-8">
          {/* Display Name */}
          <div className="space-y-2.5">
            <Label htmlFor="display-name" className="text-sm font-bold text-ink flex items-center gap-2">
              Display Name
              <span className="text-brand text-xs">*</span>
            </Label>
            <Input 
              id="display-name"
              placeholder="How should other students see your name?"
              className="h-14 rounded-2xl border-line bg-gray-50/50 focus:bg-white transition-all text-[15px] placeholder:text-subtle/60"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Age */}
            <div className="space-y-2.5">
              <Label className="text-sm font-bold text-ink">Age</Label>
              <div className="relative">
                <select 
                  className="w-full h-14 rounded-2xl border border-line bg-gray-50/50 appearance-none px-4 text-[15px] focus:outline-none focus:border-brand focus:bg-white transition-all"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                >
                  <option value="" disabled>Select Age</option>
                  {AGES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle pointer-events-none" />
              </div>
            </div>

            {/* City */}
            <div className="space-y-2.5">
              <Label className="text-sm font-bold text-ink">City</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
                <Input 
                  placeholder="Enter city"
                  className="h-14 pl-10 rounded-2xl border-line bg-gray-50/50 focus:bg-white transition-all text-[15px]"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-ink">Gender</Label>
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-bold transition-all border",
                    gender === g 
                      ? "bg-brand border-brand text-white shadow-md shadow-brand/20 scale-[1.05]" 
                      : "bg-white border-line text-subtle hover:border-brand/30"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-ink">Languages</Label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2",
                    selectedLanguages.includes(lang)
                      ? "bg-brand/10 border-brand/20 text-brand" 
                      : "bg-white border-line text-subtle"
                  )}
                >
                  {lang}
                  {selectedLanguages.includes(lang) && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
              <button className="px-4 py-2.5 rounded-xl text-xs font-bold border border-line text-subtle hover:bg-gray-50 flex items-center gap-2">
                Add More <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Short Bio */}
          <div className="space-y-2.5">
            <div className="flex justify-between">
              <Label htmlFor="bio" className="text-sm font-bold text-ink">Short Bio</Label>
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
              placeholder="Tell students a little about yourself. E.g. Future data engineer passionate about AI..."
              className="w-full p-4 rounded-2xl border border-line bg-gray-50/50 focus:bg-white focus:border-brand focus:outline-none transition-all text-[15px] resize-none placeholder:text-subtle/60 leading-relaxed"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </Card>

        {/* Profile Strength Card */}
        <Card className="p-5 border-none bg-brand/[0.03] rounded-3xl mb-8 flex items-center gap-6">
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                className="stroke-gray-100"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: strengthPercentage / 100 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="stroke-brand"
                strokeWidth="3"
                strokeDasharray="100, 100"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-ink">{Math.round(strengthPercentage)}%</span>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-ink mb-2">Profile Strength</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {strengthItems.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {item.completed ? (
                    <LucideCheckCircle2 className="w-3 h-3 text-mint" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-subtle/30" />
                  )}
                  <span className={cn("text-[10px] font-medium", item.completed ? "text-ink" : "text-subtle")}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Helpful Tip */}
        <div className="mb-8 p-4 bg-yellow-50/50 rounded-2xl flex items-start gap-3 border border-yellow-100/50">
          <div className="w-8 h-8 rounded-xl bg-yellow-100 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-yellow-600" />
          </div>
          <p className="text-xs text-yellow-800 leading-relaxed font-medium">
            💡 Add a profile photo and bio to receive better AI recommendations.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <Button 
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-brand to-brand-light text-lg font-semibold shadow-cta hover:scale-[1.01] active:scale-[0.98] transition-all"
            onClick={handleContinue}
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Continue"}
          </Button>

          <Button 
            variant="outline"
            onClick={() => router.navigate({ to: "/home" })}
            className="w-full h-14 rounded-2xl border-line text-ink font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            Complete Later
          </Button>
        </div>
      </main>

      {/* Photo Upload Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="max-w-[340px] rounded-3xl p-6 gap-6">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">Add Profile Photo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Button 
              variant="outline" 
              className="h-14 rounded-2xl justify-start gap-4 px-6 border-line font-semibold text-ink"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-5 h-5 text-brand" />
              Take Photo
            </Button>
            <Button 
              variant="outline" 
              className="h-14 rounded-2xl justify-start gap-4 px-6 border-line font-semibold text-ink"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="w-5 h-5 text-brand" />
              Choose From Gallery
            </Button>
            {profilePhoto && (
              <Button 
                variant="outline" 
                className="h-14 rounded-2xl justify-start gap-4 px-6 border-red-100 text-red-500 font-semibold hover:bg-red-50 hover:text-red-600"
                onClick={removePhoto}
              >
                <Trash2 className="w-5 h-5" />
                Remove Photo
              </Button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handlePhotoUpload}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Re-using icon since Lucide CheckCircle2 wasn't imported properly in previous block
function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
