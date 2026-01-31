import { useState, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { supabase, isSupabaseConfigured } from '@/app/lib/supabase';
import { AuthPage } from '@/app/components/auth-page';
import { Onboarding, UserProfile } from '@/app/components/onboarding';
import { RoadmapView } from '@/app/components/roadmap-view';
import { WeeklyScheduleBuilder } from '@/app/components/weekly-schedule-builder';
import { CourseDetailModal } from '@/app/components/course-detail-modal';
import { CourseListPanel } from '@/app/components/course-list-panel';
import { AIChatbot } from '@/app/components/ai-chatbot';
import { ProfileEditDialog } from '@/app/components/profile-edit-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Course } from '@/app/data/mock-courses';
import { generatePlans } from '@/app/utils/plan-generator';
import { Calendar, Map, LayoutGrid, ChevronLeft, ChevronRight, BookOpen, Bot, Loader2, AlertCircle, LogOut, Settings } from 'lucide-react';
import { toast, Toaster } from 'sonner';

type AppView = 'auth' | 'onboarding' | 'dashboard';

export default function App() {
  const [view, setView] = useState<AppView>('auth');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('roadmap');
  const [selectedSemesterIndex, setSelectedSemesterIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

  // Helper function to load user profile and navigate appropriately
  const loadUserProfile = async (userId: string): Promise<boolean> => {
    try {
      const { data: profileData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !profileData) {
        // No profile found
        return false;
      }

      // Profile exists, fetch related data
      const [universityResult, majorResult] = await Promise.all([
        profileData.uniID ? supabase.from('universities').select('name').eq('id', profileData.uniID).maybeSingle() : Promise.resolve({ data: null, error: null }),
        profileData.majorId ? supabase.from('majors').select('name').eq('id', profileData.majorId).maybeSingle() : Promise.resolve({ data: null, error: null }),
      ]);

      const fullName = [profileData.firstName, profileData.lastName].filter(Boolean).join(' ') || 'User';
      const profile: UserProfile = {
        name: fullName,
        university: universityResult.data?.name || '',
        universityId: profileData.uniID,
        major: majorResult.data?.name || '',
        majorId: profileData.majorId,
        careerGoal: profileData.careerGoal || '',
        internshipPreference: 'summer-year3',
        maxCreditsPerSemester: 15,
      };
      
      setUserProfile(profile);
      setSelectedPlanId('balanced');
      setView('dashboard');
      return true;
    } catch (error) {
      console.error('Error loading profile:', error);
      return false;
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setIsAuthenticated(true);
          
          const hasProfile = await loadUserProfile(session.user.id);
          if (!hasProfile) {
            setView('onboarding');
          }
        } else {
          setView('auth');
        }
      } catch (error: any) {
        console.error('Auth check error:', error);
        toast.error('Failed to check authentication');
        setView('auth');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        setView('auth');
        setUserProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthSuccess = async () => {
    setIsAuthenticated(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const hasProfile = await loadUserProfile(session.user.id);
        if (!hasProfile) {
          setView('onboarding');
        }
      } else {
        setView('onboarding');
      }
    } catch (error) {
      console.error('Error checking profile after auth:', error);
      setView('onboarding');
    }
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setSelectedPlanId('balanced');
    setView('dashboard');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUserProfile(null);
      setSelectedPlanId(null);
      setView('auth');
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error('Failed to log out: ' + error.message);
    }
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
  };

  // Scroll handler is now on the main content div, not window

  // Generate all plans if we have a profile
  const allPlans = userProfile ? generatePlans(userProfile) : [];
  const selectedPlan = allPlans.find(p => p.id === selectedPlanId);
  

  // Show loading screen during initial auth check
  if (loading) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
            <p className="text-white text-lg">Loading OnTrack...</p>
          </div>
        </div>
      </>
    );
  }

  // Show configuration screen if Supabase is not set up
  if (!isSupabaseConfigured()) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full p-8 bg-white/95 backdrop-blur">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 mx-auto text-yellow-600 mb-4" />
              <h2 className="text-2xl font-bold mb-4">Supabase Configuration Required</h2>
              <p className="text-gray-600 mb-6">
                To use authentication and database features, please configure your Supabase connection.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
                <p className="text-sm font-semibold mb-2">Required Environment Variables:</p>
                <code className="text-xs block bg-gray-900 text-green-400 p-3 rounded">
                  VITE_SUPABASE_URL=your-project-url<br />
                  VITE_SUPABASE_ANON_KEY=your-anon-key
                </code>
              </div>
              <p className="text-sm text-gray-500">
                Click the Supabase icon in the toolbar to connect your project, or add the environment variables manually.
              </p>
            </div>
          </Card>
        </div>
      </>
    );
  }

  if (view === 'auth') {
    return (
      <>
        <Toaster position="top-center" richColors />
        <AuthPage onAuthSuccess={handleAuthSuccess} />
      </>
    );
  }

  if (view === 'onboarding') {
    return (
      <>
        <Toaster position="top-center" richColors />
        <Onboarding onComplete={handleOnboardingComplete} />
      </>
    );
  }

  if (view === 'dashboard' && userProfile && selectedPlan) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <DndProvider backend={HTML5Backend}>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col h-screen overflow-hidden">
            {/* Header with dissolve on scroll */}
            <div 
              className={`bg-white shadow-sm border-b z-20 transition-all duration-300 ${
                isHeaderVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
              }`}
              style={{ position: 'fixed', top: 0, left: 0, right: 0 }}
            >
              <div className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button 
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-md"
                            title="Profile menu"
                          >
                            <span className="text-white font-bold text-lg">
                              {userProfile.name?.charAt(0).toUpperCase()}
                            </span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                          <div className="px-2 py-1.5 text-sm font-medium">
                            {userProfile.name}
                          </div>
                          <div className="px-2 pb-1.5 text-xs text-gray-500">
                            {userProfile.major}
                          </div>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setIsProfileEditOpen(true)}>
                            <Settings className="w-4 h-4 mr-2" />
                            Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                            <LogOut className="w-4 h-4 mr-2" />
                            Log Out
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <div>
                        <h1 className="text-xl font-bold">
                          OnTrack
                        </h1>
                        <p className="text-sm text-gray-600">
                          {userProfile.name} • {userProfile.major}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Three-column layout: Course List | Main Content | AI Chatbot */}
            <div className="flex overflow-hidden relative" style={{ 
              marginTop: isHeaderVisible ? '88px' : '0px', 
              height: isHeaderVisible ? 'calc(100vh - 88px)' : '100vh',
              transition: 'margin-top 0.3s, height 0.3s' 
            }}>
              {/* Left Panel - Course List (Collapsible) */}
              <div 
                className={`transition-all duration-300 ease-in-out bg-white border-r shadow-sm ${
                  isLeftPanelOpen ? 'w-80' : 'w-0'
                } overflow-hidden flex flex-col h-full`}
              >
                <CourseListPanel 
                  onCourseClick={(course) => setSelectedCourse(course)}
                  careerGoal={userProfile.careerGoal}
                />
              </div>

              {/* Left Panel Toggle Button */}
              {!isLeftPanelOpen && (
                <button
                  onClick={() => setIsLeftPanelOpen(true)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-l-0 rounded-r-lg shadow-lg p-2 hover:bg-gray-50 transition-colors z-10 group"
                  title="Show Course Catalog"
                >
                  <div className="flex flex-col items-center gap-1">
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-semibold text-gray-600" style={{ writingMode: 'vertical-rl' }}>
                      Courses
                    </span>
                  </div>
                </button>
              )}

              {/* Main Content - Center */}
              <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Panel Toggle Buttons - Floating */}
                <div className="absolute top-4 left-4 right-4 z-10 flex justify-between pointer-events-none">
                  {isLeftPanelOpen && (
                    <Button
                      onClick={() => setIsLeftPanelOpen(false)}
                      size="sm"
                      variant="secondary"
                      className="shadow-lg pointer-events-auto gap-2"
                      title="Hide Course Catalog"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Hide Courses</span>
                    </Button>
                  )}
                  
                  <div className="flex-1" />
                  
                  {isRightPanelOpen && (
                    <Button
                      onClick={() => setIsRightPanelOpen(false)}
                      size="sm"
                      variant="secondary"
                      className="shadow-lg pointer-events-auto gap-2"
                      title="Hide AI Advisor"
                    >
                      <span className="hidden sm:inline">Hide AI</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div 
                  className="flex-1 overflow-y-auto"
                  onScroll={(e) => {
                    const target = e.target as HTMLDivElement;
                    const currentScrollY = target.scrollTop;
                    const lastScrollY = lastScrollYRef.current;
                    
                    if (currentScrollY > lastScrollY && currentScrollY > 80) {
                      setIsHeaderVisible(false);
                    } else {
                      setIsHeaderVisible(true);
                    }
                    
                    // Use ref instead of state to avoid re-renders
                    lastScrollYRef.current = currentScrollY;
                  }}
                >
                  <div className="container mx-auto max-w-5xl px-4 py-8">
                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-8">
                      <TabsList className="mb-6 bg-gradient-to-r from-purple-100 to-blue-100 p-1 shadow-lg border border-purple-200">
                        <TabsTrigger value="roadmap" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md">
                          <Map className="w-4 h-4" />
                          4-Year Roadmap
                        </TabsTrigger>
                        <TabsTrigger value="schedule" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md">
                          <Calendar className="w-4 h-4" />
                          Semester Calendar
                        </TabsTrigger>
                        <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md">
                          <LayoutGrid className="w-4 h-4" />
                          Plan Overview
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="roadmap">
                        <RoadmapView
                          plan={selectedPlan.semesters}
                          careerGoal={userProfile.careerGoal}
                          onCourseClick={(course) => setSelectedCourse(course)}
                          onViewSchedule={(semesterIndex) => {
                            setSelectedSemesterIndex(semesterIndex);
                            setActiveTab('schedule');
                          }}
                        />
                      </TabsContent>

                      <TabsContent value="schedule">
                        <WeeklyScheduleBuilder
                          semesters={selectedPlan.semesters}
                          selectedSemesterIndex={selectedSemesterIndex}
                          onSemesterChange={setSelectedSemesterIndex}
                          careerGoal={userProfile.careerGoal}
                          onCourseClick={(course) => setSelectedCourse(course)}
                        />
                      </TabsContent>

                      <TabsContent value="overview">
                        <div className="space-y-6">
                          {/* Selected Plan Info */}
                          <div className="bg-white rounded-lg shadow-lg p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-2xl font-bold mb-2">{selectedPlan.name}</h3>
                                <p className="text-gray-600">{selectedPlan.description}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                              <div>
                                <h4 className="font-semibold mb-3">Plan Highlights</h4>
                                <ul className="space-y-2">
                                  {selectedPlan.highlights.map((highlight: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                      <span className="text-green-600 mt-0.5">✓</span>
                                      {highlight}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-3">Your Profile</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">University:</span>
                                    <span className="font-medium">{userProfile.university}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Major:</span>
                                    <span className="font-medium">{userProfile.major}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Career Goal:</span>
                                    <span className="font-medium">{userProfile.careerGoal}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Internship Plan:</span>
                                    <span className="font-medium capitalize">{userProfile.internshipPreference?.replace('-', ' ')}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Max Credits/Sem:</span>
                                    <span className="font-medium">{userProfile.maxCreditsPerSemester}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Graduation Requirements Progress */}
                          <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="font-bold text-lg mb-4">Graduation Requirements Progress</h3>
                            <div className="space-y-4">
                              {[
                                { name: 'Major Core', completed: 0, total: 45, color: 'bg-purple-500' },
                                { name: 'Math/Science', completed: 0, total: 18, color: 'bg-blue-500' },
                                { name: 'General Education', completed: 0, total: 30, color: 'bg-gray-500' },
                                { name: 'Electives', completed: 0, total: 27, color: 'bg-green-500' },
                              ].map((req) => {
                                const percentage = (req.completed / req.total) * 100;
                                return (
                                  <div key={req.name}>
                                    <div className="flex justify-between mb-1 text-sm">
                                      <span className="font-medium">{req.name}</span>
                                      <span className="text-gray-600">{req.completed}/{req.total} credits</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className={`${req.color} h-2 rounded-full transition-all`}
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <p className="text-sm text-gray-600 mt-4">
                              Total: 0/120 credits completed
                            </p>
                          </div>

                          {/* AI Insights */}
                          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
                            <div className="flex gap-3">
                              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">AI</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-indigo-900 mb-2">Personalized Insights</h4>
                                <ul className="space-y-2 text-sm text-indigo-800">
                                  <li>• Your {selectedPlan.name.toLowerCase()} focuses on building {userProfile.careerGoal} skills progressively</li>
                                  <li>• We've scheduled lighter semesters before internship periods to help you prepare</li>
                                  <li>• Courses are sequenced to respect prerequisites while maximizing career relevance</li>
                                  <li>• You'll have time for extracurriculars, networking, and personal projects</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>

              {/* Right Panel - AI Chatbot (Sticky/Collapsible) */}
              <div 
                className={`transition-all duration-300 ease-in-out ${
                  isRightPanelOpen ? 'w-96' : 'w-0'
                } overflow-hidden flex flex-col h-full`}
              >
                <AIChatbot 
                  careerGoal={userProfile.careerGoal}
                  userName={userProfile.name}
                  major={userProfile.major}
                />
              </div>

              {/* Right Panel Toggle Button */}
              {!isRightPanelOpen && (
                <button
                  onClick={() => setIsRightPanelOpen(true)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-r-0 rounded-l-lg shadow-lg p-2 hover:bg-gray-50 transition-colors z-10 group"
                  title="Show AI Advisor"
                >
                  <div className="flex flex-col items-center gap-1">
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                    <Bot className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-gray-600" style={{ writingMode: 'vertical-rl' }}>
                      AI Help
                    </span>
                  </div>
                </button>
              )}
            </div>

            {/* Course Detail Modal */}
            {selectedCourse && (
              <CourseDetailModal
                course={selectedCourse}
                careerGoal={userProfile.careerGoal}
                onClose={() => setSelectedCourse(null)}
              />
            )}

            {/* Profile Edit Dialog */}
            <ProfileEditDialog
              open={isProfileEditOpen}
              onOpenChange={setIsProfileEditOpen}
              profile={userProfile}
              onProfileUpdate={handleProfileUpdate}
            />
          </div>
        </DndProvider>
      </>
    );
  }

  return null;
}