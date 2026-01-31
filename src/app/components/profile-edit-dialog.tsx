import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Combobox, ComboboxOption } from '@/app/components/ui/combobox';
import { UserProfile } from '@/app/components/onboarding';
import { supabase, University, Major } from '@/app/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
}

export function ProfileEditDialog({ open, onOpenChange, profile, onProfileUpdate }: ProfileEditDialogProps) {
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>(profile);
  const [universities, setUniversities] = useState<University[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load universities when dialog opens
  useEffect(() => {
    if (open) {
      const fetchUniversities = async () => {
        setLoading(true);
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
      setEditedProfile(profile);
    }
  }, [open, profile]);

  // Fetch majors when university changes or dialog opens with existing university
  useEffect(() => {
    const fetchMajors = async () => {
      const universityId = editedProfile.universityId;
      if (!universityId) {
        setMajors([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('majors')
          .select('id, name, uniId')
          .eq('uniId', universityId);

        if (error) throw error;
        setMajors(data || []);
      } catch (error: any) {
        toast.error('Failed to load majors: ' + error.message);
        setMajors([]);
      }
    };

    if (open && editedProfile.universityId) {
      fetchMajors();
    }
  }, [editedProfile.universityId, open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      // Validate that IDs are set
      if (!editedProfile.universityId || !editedProfile.majorId) {
        toast.error('Please select both university and major');
        return;
      }

      // Split name into firstName and lastName
      const nameParts = (editedProfile.name || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Convert majorId from string to number if needed
      const majorIdNumber = editedProfile.majorId ? parseInt(editedProfile.majorId, 10) : null;

      // Update user profile
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          firstName: firstName,
          lastName: lastName,
          uniID: editedProfile.universityId,
          majorId: majorIdNumber,
          careerGoal: editedProfile.careerGoal || '',
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      // Update local profile state
      const updatedProfile: UserProfile = {
        ...profile,
        name: editedProfile.name || profile.name,
        university: universities.find(u => u.id === editedProfile.universityId)?.name || profile.university,
        universityId: editedProfile.universityId || profile.universityId,
        major: majors.find(m => String(m.id) === editedProfile.majorId)?.name || profile.major,
        majorId: editedProfile.majorId || profile.majorId,
        careerGoal: editedProfile.careerGoal || profile.careerGoal,
      };

      onProfileUpdate(updatedProfile);
      toast.success('Profile updated successfully!');
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const universityOptions: ComboboxOption[] = universities.map((u) => ({
    id: u.id,
    label: u.name,
    searchTerms: [...(u.aliases ?? []), u.name],
  }));

  const majorOptions: ComboboxOption[] = majors.map((m) => ({
    id: String(m.id),
    label: m.name,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your personal information and academic details
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="edit-name">Your Name</Label>
              <Input
                id="edit-name"
                placeholder="John Doe"
                value={editedProfile.name || ''}
                onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>University</Label>
                <Combobox
                  options={universityOptions}
                  value={editedProfile.universityId}
                  onValueChange={(id) => {
                    const selectedUniversity = universities.find(u => u.id === id);
                    setEditedProfile({ 
                      ...editedProfile, 
                      universityId: id,
                      university: selectedUniversity?.name || '',
                      majorId: '',
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
                  value={editedProfile.majorId}
                  onValueChange={(id) => {
                    const selectedMajor = majors.find(m => String(m.id) === id);
                    setEditedProfile({ 
                      ...editedProfile, 
                      majorId: id,
                      major: selectedMajor?.name || ''
                    });
                  }}
                  placeholder={editedProfile.universityId ? "Select major..." : "Select university first"}
                  searchPlaceholder="Search majors..."
                  emptyText="No major found."
                  allowClear={false}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-career-goal">Career Goal</Label>
              <textarea
                id="edit-career-goal"
                placeholder="e.g., I want to become a Full Stack Developer..."
                value={editedProfile.careerGoal || ''}
                onChange={(e) => setEditedProfile({ ...editedProfile, careerGoal: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !editedProfile.name || !editedProfile.universityId || !editedProfile.majorId}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

