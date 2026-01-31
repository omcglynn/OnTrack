import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Card } from '@/app/components/ui/card';
import { Combobox, ComboboxOption } from '@/app/components/ui/combobox';
import { ArrowRight, GraduationCap, Target, Calendar, Settings, Loader2 } from 'lucide-react';
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
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    maxCreditsPerSemester: 15,
    internshipPreference: 'summer-year3',
  });
  const [universities, setUniversities] = useState<University[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const totalSteps = 4;

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
      case 3:
        return true;
      case 4:
        return true;
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
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-1/4 h-2 mx-1 rounded-full transition-all ${
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

        {/* Step 3: Internship Planning */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Calendar className="w-16 h-16 mx-auto text-pink-600 mb-4" />
              <h2 className="text-3xl font-bold mb-2">Plan for internships</h2>
              <p className="text-gray-600">When do you want to pursue internship opportunities?</p>
            </div>

            <div className="space-y-3">
              {[
                { value: 'summer-year2', label: 'Summer after Sophomore Year', desc: 'Great for first internship experience' },
                { value: 'summer-year3', label: 'Summer after Junior Year', desc: 'Most popular timing for internships' },
                { value: 'flexible', label: 'Multiple Internships', desc: 'Pursue opportunities each summer' },
                { value: 'none', label: 'No Internship Planned', desc: 'Focus on coursework and research' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setProfile({ ...profile, internshipPreference: option.value as any })}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    profile.internshipPreference === option.value
                      ? 'border-pink-600 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold mb-1">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Preferences */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Settings className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
              <h2 className="text-3xl font-bold mb-2">Final preferences</h2>
              <p className="text-gray-600">Customize your schedule settings</p>
            </div>

            <div>
              <Label htmlFor="credits">Maximum Credits Per Semester</Label>
              <Select
                value={profile.maxCreditsPerSemester?.toString()}
                onValueChange={(value) => setProfile({ ...profile, maxCreditsPerSemester: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 credits (Light load)</SelectItem>
                  <SelectItem value="15">15 credits (Standard)</SelectItem>
                  <SelectItem value="18">18 credits (Heavy load)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-3 block">Preferred class days (optional)</Label>
              <div className="flex flex-wrap gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => {
                  const isSelected = profile.preferredDays?.includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() => {
                        const current = profile.preferredDays || [];
                        setProfile({
                          ...profile,
                          preferredDays: isSelected
                            ? current.filter((d) => d !== day)
                            : [...current, day],
                        });
                      }}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-gray-500 mt-2">Leave empty for no preference</p>
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