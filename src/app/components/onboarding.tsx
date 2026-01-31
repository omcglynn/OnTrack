import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Card } from '@/app/components/ui/card';
import { Combobox } from '@/app/components/ui/combobox';
import { ArrowRight, ArrowLeft, GraduationCap, Target, Loader2 } from 'lucide-react';
import { supabase, University, Major } from '@/app/lib/supabase';
import { toast } from 'sonner';

export interface UserProfile {
  name: string;
  university: string;
  universityId: string;
  major: string;
  majorId: string;
  careerGoal: string;
  internshipPreference: 'summer-year2' | 'summer-year3' | 'flexible' | 'none';
  maxCreditsPerSemester: number;
  preferredDays?: string[];
  completedCourses?: string[];
}

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  onBack?: () => void;
}

export function Onboarding({ onComplete, onBack }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    maxCreditsPerSemester: 15,
    internshipPreference: 'summer-year3',
  });
  const [universities, setUniversities] = useState<University[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const totalSteps = 2;

  // Fetch universities from database
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const { data, error } = await supabase
          .from('universities')
          .select('name, id, aliases');

        if (error) throw error;
        setUniversities(data || []);
      } catch (error: any) {
        toast.error('Failed to load universities: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  // Fetch majors when university is selected
  useEffect(() => {
    const fetchMajors = async () => {
      if (!profile.universityId) {
        setMajors([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('majors')
          .select('id, name, uniId')
          .eq('uniId', profile.universityId);

        if (error) throw error;
        setMajors(data || []);
      } catch (error: any) {
        toast.error('Failed to load majors: ' + error.message);
        setMajors([]);
      }
    };

    fetchMajors();
  }, [profile.universityId]);

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Final step - save to database
      await saveProfileToDatabase();
    }
  };

  const saveProfileToDatabase = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      // Validate that IDs are set
      if (!profile.universityId || !profile.majorId) {
        toast.error('Please select both university and major');
        return;
      }

      // Split name into firstName and lastName
      const nameParts = (profile.name || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Insert or update user profile
      // Convert majorId from string (Combobox) to number (database bigint)
      const majorIdNumber = profile.majorId ? parseInt(profile.majorId, 10) : null;
      
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          firstName: firstName,
          lastName: lastName,
          uniID: profile.universityId,
          majorId: majorIdNumber,
          careerGoal: profile.careerGoal || '',
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      toast.success('Profile saved successfully!');
      onComplete(profile as UserProfile);
    } catch (error: any) {
      toast.error('Failed to save profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return profile.name && profile.universityId && profile.majorId;
      case 2:
        return profile.careerGoal && profile.careerGoal.trim().length > 0;
      default:
        return false;
    }
  };

  // Convert universities to combobox options with search terms
  const majorOptions = majors.map((m) => ({
    id: String(m.id), // Convert to string for Combobox
    label: m.name,
  }));
  
  const universityOptions = universities.map((u) => ({
    id: u.id,
    label: u.name,
    searchTerms: [...(u.aliases ?? []), u.name],
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <Card className="p-8 bg-white/95 backdrop-blur">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
          <p className="text-center mt-4 text-gray-600">Loading...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 bg-white/95 backdrop-blur relative overflow-hidden">
        {/* Back to landing button */}
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-4 left-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            disabled={saving}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </button>
        )}

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`w-1/2 h-2 mx-1 rounded-full transition-all ${
                  s <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">Step {step} of {totalSteps}</p>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <GraduationCap className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <h2 className="text-3xl font-bold mb-2">Welcome to OnTrack!</h2>
              <p className="text-gray-600">Let's build your personalized degree plan</p>
            </div>

            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={profile.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>University</Label>
                <Combobox
                  options={universityOptions}
                  value={profile.universityId}
                  onValueChange={(id) => {
                    const selectedUniversity = universities.find(u => u.id === id);
                    setProfile({ 
                      ...profile, 
                      universityId: id,
                      university: selectedUniversity?.name || '',
                      majorId: '', // Clear major when university changes
                      major: ''
                    });
                  }}
                  placeholder="Select university..."
                  searchPlaceholder="Search universities..."
                  emptyText="No university found."
                />
              </div>

              <div>
                <Label>Major</Label>
                <Combobox
                  options={majorOptions}
                  value={profile.majorId}
                  onValueChange={(id) => {
                    const selectedMajor = majors.find(m => String(m.id) === id);
                    setProfile({ 
                      ...profile, 
                      majorId: id,
                      major: selectedMajor?.name || ''
                    });
                  }}
                  placeholder={profile.universityId ? "Select major..." : "Select university first"}
                  searchPlaceholder="Search majors..."
                  emptyText="No major found."
                  allowClear={false}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Career Goal */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Target className="w-16 h-16 mx-auto text-purple-600 mb-4" />
              <h2 className="text-3xl font-bold mb-2">What's your dream career?</h2>
              <p className="text-gray-600">Describe your career goals to help us recommend the right courses</p>
            </div>

            <div>
              <Label htmlFor="career-goal">Career Goal</Label>
              <Textarea
                id="career-goal"
                placeholder="e.g., I want to become a Full Stack Developer working on scalable web applications, or I'm interested in Machine Learning and AI research..."
                value={profile.careerGoal || ''}
                onChange={(e) => setProfile({ ...profile, careerGoal: e.target.value })}
                rows={6}
                className="resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                Be specific about your interests, target roles, or industries
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} className="flex-1" disabled={saving}>
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed() || saving}
            className="flex-1 gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {step === totalSteps ? 'Create My Plan' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}