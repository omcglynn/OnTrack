import { useState, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { supabase, isSupabaseConfigured } from '@/app/lib/supabase';
import { AuthPage } from '@/app/components/auth-page';
import { Onboarding, UserProfile } from '@/app/components/onboarding';
import { RoadmapView, calculateGPA, PlannedCourse, SemesterPlan } from '@/app/components/roadmap-view';
import { WeeklyScheduleBuilder } from '@/app/components/weekly-schedule-builder';
import { CourseDetailModal } from '@/app/components/course-detail-modal';
import { CourseListPanel } from '@/app/components/course-list-panel';
import { AIChatbot } from '@/app/components/ai-chatbot';
import { ProfileEditDialog } from '@/app/components/profile-edit-dialog';
import { SchedulePreviewModal } from '@/app/components/schedule-preview-modal';
import { AIScheduleRecommendation, generatePersonalizedInsights, PersonalizedInsights, PlanInsightsData } from '@/app/lib/gemini';
import { buildScheduleFromCodes, GeneratedSchedule, ScheduledCourse } from '@/app/utils/schedule-generator';
import { RequirementsBreakdown } from '@/app/components/requirements-breakdown';
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
  const [autoOpenAddCourse, setAutoOpenAddCourse] = useState(false);
  const [isSchedulePreviewOpen, setIsSchedulePreviewOpen] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState<GeneratedSchedule | null>(null);
  const [scheduleReasoning, setScheduleReasoning] = useState<string>('');
  const [shouldReopenSchedulePreview, setShouldReopenSchedulePreview] = useState(false);
  const [personalizedInsights, setPersonalizedInsights] = useState<PersonalizedInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

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
        majorId: profileData.majorId ? String(profileData.majorId) : '',
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

  // Handle AI schedule generation
  const handleScheduleGenerated = (recommendation: AIScheduleRecommendation) => {
    if (!selectedPlan) return;
    
    // Get completed courses
    const completedCourses = selectedPlan.semesters
      .flatMap((s: SemesterPlan) => s.courses)
      .filter((c: PlannedCourse) => c.completed)
      .map((c: PlannedCourse) => c.code);
    
    // Build the schedule with time slots
    const schedule = buildScheduleFromCodes(
      recommendation.courseCodes,
      completedCourses,
      []
    );
    
    setGeneratedSchedule(schedule);
    setScheduleReasoning(recommendation.reasoning);
    setIsSchedulePreviewOpen(true);
  };

  // Handle applying generated schedule to a semester
  const handleApplySchedule = (semesterIndex: number, scheduledCourses: ScheduledCourse[]) => {
    if (!selectedPlan || !userProfile) return;
    
    // Get the existing plan and update it
    const updatedSemesters = [...selectedPlan.semesters];
    const targetSemester = { ...updatedSemesters[semesterIndex] };
    
    // Convert scheduled courses to PlannedCourses and merge with existing
    const newCourses: PlannedCourse[] = scheduledCourses.map(sc => ({
      ...sc.course, // Include all Course fields (id, code, name, credits, description, etc.)
      completed: false,
      schedule: sc.schedule,
    }));
    
    // Merge: add new courses that aren't already in the semester
    const existingCodes = new Set(targetSemester.courses.map((c: PlannedCourse) => c.code));
    const coursesToAdd = newCourses.filter(c => !existingCodes.has(c.code));
    
    // Update courses and recalculate total credits
    const updatedCourses = [...targetSemester.courses, ...coursesToAdd];
    targetSemester.courses = updatedCourses;
    targetSemester.totalCredits = updatedCourses.reduce((sum, c) => sum + c.credits, 0);
    
    // Update status if it was unplanned and now has courses
    if (targetSemester.status === 'unplanned' && updatedCourses.length > 0) {
      targetSemester.status = 'planned';
    }
    
    updatedSemesters[semesterIndex] = targetSemester;
    
    // Update the state to persist the changes
    setAllPlans(prevPlans => 
      prevPlans.map(plan => 
        plan.id === selectedPlanId 
          ? { ...plan, semesters: updatedSemesters }
          : plan
      )
    );
    
    // Show success toast
    if (coursesToAdd.length > 0) {
      toast.success(`Added ${coursesToAdd.length} course${coursesToAdd.length > 1 ? 's' : ''} to ${targetSemester.season} ${targetSemester.year}!`);
    } else {
      toast.info('All courses are already in this semester.');
    }
    
    // Close the modal and clear generated schedule
    setIsSchedulePreviewOpen(false);
    setGeneratedSchedule(null);
  };

  // Get available semesters for schedule application
  const getAvailableSemesters = () => {
    if (!selectedPlan) return [];
    return selectedPlan.semesters.map((sem: SemesterPlan, index: number) => ({
      index,
      name: `${sem.season} ${sem.year}`,
      isEmpty: sem.courses.length === 0,
    }));
  };

  // Scroll handler is now on the main content div, not window

  // Generate all plans if we have a profile - now stateful for modifications
  const [allPlans, setAllPlans] = useState<any[]>([]);
  
  useEffect(() => {
    if (userProfile) {
      setAllPlans(generatePlans(userProfile));
    }
  }, [userProfile]);
  
  const selectedPlan = allPlans.find(p => p.id === selectedPlanId);

  // Handler to update semesters in a plan
  const handleUpdateSemesters = (updatedSemesters: SemesterPlan[]) => {
    setAllPlans(prevPlans => 
      prevPlans.map(plan => 
        plan.id === selectedPlanId 
          ? { ...plan, semesters: updatedSemesters }
          : plan
      )
    );
  };

  // Generate personalized insights
  const generateInsights = async () => {
    if (!selectedPlan || !userProfile) return;

    setInsightsLoading(true);
    try {
      // Calculate completed courses with grades
      const completedCourses = selectedPlan.semesters
        .flatMap((s: SemesterPlan) => s.courses)
        .filter((c: PlannedCourse) => c.completed)
        .map((c: PlannedCourse) => ({
          code: c.code,
          name: c.name,
          grade: c.grade,
          credits: c.credits,
        }));

      // Calculate upcoming courses (next 2-3 semesters)
      const currentSemesterIndex = selectedPlan.semesters.findIndex(
        (s: SemesterPlan) => s.status === 'in-progress'
      );
      const upcomingSemesters = selectedPlan.semesters.slice(
        Math.max(0, currentSemesterIndex),
        Math.min(selectedPlan.semesters.length, currentSemesterIndex + 3)
      );
      const upcomingCourses = upcomingSemesters
        .flatMap((s: SemesterPlan) => 
          s.courses
            .filter((c: PlannedCourse) => !c.completed)
            .map((c: PlannedCourse) => ({
              code: c.code,
              name: c.name,
              semester: s.semester,
              season: s.season,
              year: s.year,
            }))
        );

      // Calculate requirements progress
      const gpaData = calculateGPA(selectedPlan.semesters);
      const cisCore = completedCourses
        .filter((c: { code: string; name: string; grade?: string; credits: number }) => {
          const course = selectedPlan.semesters
            .flatMap((s: SemesterPlan) => s.courses)
            .find((pc: PlannedCourse) => pc.code === c.code);
          return course?.category === 'major';
        })
        .reduce((sum: number, c: { code: string; name: string; grade?: string; credits: number }) => sum + c.credits, 0);
      const math = completedCourses
        .filter((c: { code: string; name: string; grade?: string; credits: number }) => {
          const course = selectedPlan.semesters
            .flatMap((s: SemesterPlan) => s.courses)
            .find((pc: PlannedCourse) => pc.code === c.code);
          return course?.category === 'core';
        })
        .reduce((sum: number, c: { code: string; name: string; grade?: string; credits: number }) => sum + c.credits, 0);
      const labScience = completedCourses
        .filter((c: { code: string; name: string; grade?: string; credits: number }) => {
          const course = selectedPlan.semesters
            .flatMap((s: SemesterPlan) => s.courses)
            .find((pc: PlannedCourse) => pc.code === c.code);
          return course?.category === 'lab-science';
        })
        .reduce((sum: number, c: { code: string; name: string; grade?: string; credits: number }) => sum + c.credits, 0);
      const csElectives = completedCourses
        .filter((c: { code: string; name: string; grade?: string; credits: number }) => {
          const course = selectedPlan.semesters
            .flatMap((s: SemesterPlan) => s.courses)
            .find((pc: PlannedCourse) => pc.code === c.code);
          return course?.category === 'elective' && c.code.startsWith('CIS');
        })
        .reduce((sum: number, c: { code: string; name: string; grade?: string; credits: number }) => sum + c.credits, 0);
      const genEdFoundation = completedCourses
        .filter((c: { code: string; name: string; grade?: string; credits: number }) => {
          const course = selectedPlan.semesters
            .flatMap((s: SemesterPlan) => s.courses)
            .find((pc: PlannedCourse) => pc.code === c.code);
          return course?.category === 'gen-ed' && ['GW', 'GQ', 'GY', 'GZ'].includes(course.genEdAttribute || '');
        })
        .reduce((sum: number, c: { code: string; name: string; grade?: string; credits: number }) => sum + c.credits, 0);
      const genEdBreadth = completedCourses
        .filter((c: { code: string; name: string; grade?: string; credits: number }) => {
          const course = selectedPlan.semesters
            .flatMap((s: SemesterPlan) => s.courses)
            .find((pc: PlannedCourse) => pc.code === c.code);
          return course?.category === 'gen-ed' && !['GW', 'GQ', 'GY', 'GZ'].includes(course.genEdAttribute || '');
        })
        .reduce((sum: number, c: { code: string; name: string; grade?: string; credits: number }) => sum + c.credits, 0);

      const requirementsProgress = [
        { name: 'CIS Core', completed: cisCore, total: 47 },
        { name: 'Mathematics', completed: math, total: 8 },
        { name: 'Lab Science', completed: labScience, total: 8 },
        { name: 'CS Electives', completed: csElectives, total: 16 },
        { name: 'Gen Ed Foundation', completed: genEdFoundation, total: 14 },
        { name: 'Gen Ed Breadth', completed: genEdBreadth, total: 22 },
      ];

      const currentSemester = currentSemesterIndex >= 0 
        ? selectedPlan.semesters[currentSemesterIndex].semester 
        : selectedPlan.semesters.find((s: SemesterPlan) => s.status === 'planned')?.semester || 1;

      const insightsData: PlanInsightsData = {
        userName: userProfile.name,
        major: userProfile.major,
        careerGoal: userProfile.careerGoal,
        completedCourses,
        currentSemester,
        totalSemesters: 8,
        gpa: gpaData.gpa,
        completedCredits: gpaData.completedCredits,
        totalCredits: 120,
        upcomingCourses: upcomingCourses.slice(0, 10),
        requirementsProgress,
        planName: selectedPlan.name,
      };

      const insights = await generatePersonalizedInsights(insightsData);
      setPersonalizedInsights(insights);
    } catch (error) {
      console.error('Failed to generate insights:', error);
      toast.error('Failed to generate personalized insights');
    } finally {
      setInsightsLoading(false);
    }
  };

  // Generate insights when overview tab is opened or dashboard loads
  useEffect(() => {
    if (view === 'dashboard' && userProfile && selectedPlan && activeTab === 'overview') {
      // Generate insights when tab opens (will skip if already loading)
      if (!insightsLoading) {
        generateInsights();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, userProfile, selectedPlan?.id, activeTab]);

  // Reset insights when plan changes
  useEffect(() => {
    setPersonalizedInsights(null);
  }, [selectedPlanId]);

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
    const handleOnboardingBack = async () => {
      try {
        await supabase.auth.signOut();
        setUserProfile(null);
        setView('auth');
      } catch (error: any) {
        toast.error('Failed to log out: ' + error.message);
      }
    };

    return (
      <>
        <Toaster position="top-center" richColors />
        <Onboarding onComplete={handleOnboardingComplete} onBack={handleOnboardingBack} />
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
            <div 
              className="flex overflow-hidden relative transition-all duration-300" 
              style={{ 
                marginTop: isHeaderVisible ? '88px' : '0', 
                height: isHeaderVisible ? 'calc(100vh - 88px)' : '100vh',
              }}
            >
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
                  className="flex-1 overflow-y-auto scroll-smooth"
                  onScroll={(e) => {
                    const target = e.target as HTMLDivElement;
                    const currentScrollY = target.scrollTop;
                    const lastScrollY = lastScrollYRef.current;
                    const scrollDelta = currentScrollY - lastScrollY;
                    
                    // Only change header visibility with significant scroll movement
                    // and add a dead zone to prevent jitter
                    const deadZone = 10;
                    
                    if (Math.abs(scrollDelta) > deadZone) {
                      if (scrollDelta > 0 && currentScrollY > 100) {
                        // Scrolling down past threshold - hide header
                        setIsHeaderVisible(false);
                      } else if (scrollDelta < 0 || currentScrollY < 50) {
                        // Scrolling up or near top - show header
                        setIsHeaderVisible(true);
                      }
                      // Update ref only when we make a significant scroll
                      lastScrollYRef.current = currentScrollY;
                    }
                  }}
                >
                  <div className="container mx-auto max-w-5xl px-4 py-8">
                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={(tab) => {
                      // When switching to schedule tab, default to current (in-progress) semester
                      if (tab === 'schedule' && activeTab !== 'schedule') {
                        const currentSemesterIndex = selectedPlan.semesters.findIndex(
                          (s: SemesterPlan) => s.status === 'in-progress'
                        );
                        if (currentSemesterIndex !== -1) {
                          setSelectedSemesterIndex(currentSemesterIndex);
                        }
                      }
                      setActiveTab(tab);
                    }} className="w-full mt-8">
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
                          onPlanSemester={(semesterIndex) => {
                            setSelectedSemesterIndex(semesterIndex);
                            setActiveTab('schedule');
                            setAutoOpenAddCourse(true);
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
                          onUpdateSemesters={handleUpdateSemesters}
                          autoOpenAddCourse={autoOpenAddCourse}
                          onAutoOpenHandled={() => setAutoOpenAddCourse(false)}
                        />
                      </TabsContent>

                      <TabsContent value="overview">
                        <div className="space-y-6">
                          {/* Graduation Requirements Progress */}
                          {(() => {
                            // Calculate completed credits by category
                            const completedCourses: PlannedCourse[] = selectedPlan.semesters
                              .flatMap((s: SemesterPlan) => s.courses)
                              .filter((c: PlannedCourse) => c.completed);
                            
                            const cisCore = completedCourses
                              .filter((c: PlannedCourse) => c.category === 'major')
                              .reduce((sum: number, c: PlannedCourse) => sum + c.credits, 0);
                            const math = completedCourses
                              .filter((c: PlannedCourse) => c.category === 'core')
                              .reduce((sum: number, c: PlannedCourse) => sum + c.credits, 0);
                            const labScience = completedCourses
                              .filter((c: PlannedCourse) => c.category === 'lab-science')
                              .reduce((sum: number, c: PlannedCourse) => sum + c.credits, 0);
                            const csElectives = completedCourses
                              .filter((c: PlannedCourse) => c.category === 'elective' && c.code.startsWith('CIS'))
                              .reduce((sum: number, c: PlannedCourse) => sum + c.credits, 0);
                            const genEdFoundation = completedCourses
                              .filter((c: PlannedCourse) => c.category === 'gen-ed' && ['GW', 'GQ', 'GY', 'GZ'].includes(c.genEdAttribute || ''))
                              .reduce((sum: number, c: PlannedCourse) => sum + c.credits, 0);
                            const genEdBreadth = completedCourses
                              .filter((c: PlannedCourse) => c.category === 'gen-ed' && !['GW', 'GQ', 'GY', 'GZ'].includes(c.genEdAttribute || ''))
                              .reduce((sum: number, c: PlannedCourse) => sum + c.credits, 0);
                            
                            // Also count gen-ed courses without specific attributes
                            const untaggedGenEd = completedCourses
                              .filter((c: PlannedCourse) => c.category === 'gen-ed' && !c.genEdAttribute)
                              .reduce((sum: number, c: PlannedCourse) => sum + c.credits, 0);
                            
                            const gpaData = calculateGPA(selectedPlan.semesters);
                            
                            const requirements = [
                              { name: 'CIS Core', completed: cisCore, total: 47, color: 'bg-purple-500' },
                              { name: 'Mathematics', completed: math, total: 8, color: 'bg-blue-500' },
                              { name: 'Lab Science', completed: labScience, total: 8, color: 'bg-cyan-500' },
                              { name: 'CS Electives', completed: csElectives, total: 16, color: 'bg-green-500' },
                              { name: 'Gen Ed Foundation', completed: genEdFoundation + (untaggedGenEd > 0 ? Math.min(untaggedGenEd, 14 - genEdFoundation) : 0), total: 14, color: 'bg-amber-500' },
                              { name: 'Gen Ed Breadth', completed: genEdBreadth, total: 22, color: 'bg-rose-500' },
                            ];
                            
                            return (
                              <div className="bg-white rounded-lg shadow-lg p-6">
                                <div className="flex justify-between items-center mb-4">
                                  <h3 className="font-bold text-lg">Graduation Requirements Progress</h3>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Cumulative GPA:</span>
                                    <span className={`text-xl font-bold ${
                                      gpaData.gpa >= 3.5 ? 'text-emerald-600' :
                                      gpaData.gpa >= 3.0 ? 'text-blue-600' :
                                      gpaData.gpa >= 2.0 ? 'text-amber-600' :
                                      'text-red-600'
                                    }`}>
                                      {gpaData.completedCredits > 0 ? gpaData.gpa.toFixed(2) : '—'}
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  {requirements.map((req) => {
                                    const percentage = Math.min((req.completed / req.total) * 100, 100);
                                    return (
                                      <div key={req.name}>
                                        <div className="flex justify-between mb-1 text-sm">
                                          <span className="font-medium">{req.name}</span>
                                          <span className="text-gray-600">
                                            {req.completed}/{req.total} credits
                                            {req.completed >= req.total && ' ✓'}
                                          </span>
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
                                <div className="mt-4 pt-4 border-t">
                                  <div className="flex justify-between items-center mb-3">
                                    <p className="text-sm text-gray-600">
                                      Total: <span className="font-semibold">{gpaData.completedCredits}/120</span> credits completed
                                    </p>
                                    <p className="text-sm font-medium text-emerald-600">
                                      {Math.round((gpaData.completedCredits / 120) * 100)}% to graduation
                                    </p>
                                  </div>
                                  <RequirementsBreakdown 
                                    semesters={selectedPlan.semesters}
                                    trigger={
                                      <Button variant="outline" className="w-full gap-2 hover:bg-purple-50 hover:border-purple-300">
                                        <BookOpen className="w-4 h-4" />
                                        View Detailed Breakdown
                                      </Button>
                                    }
                                  />
                                </div>
                              </div>
                            );
                          })()}

                          {/* AI Insights */}
                          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
                            <div className="flex gap-3">
                              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                {insightsLoading ? (
                                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                                ) : (
                                  <span className="text-white font-bold">AI</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-indigo-900 mb-2">Personalized Insights</h4>
                                {insightsLoading ? (
                                  <div className="text-sm text-indigo-700">
                                    <p>Generating personalized insights...</p>
                                  </div>
                                ) : personalizedInsights ? (
                                  <div className="space-y-3">
                                    <ul className="space-y-2 text-sm text-indigo-800">
                                      {personalizedInsights.insights.map((insight, index) => (
                                        <li key={index}>• {insight}</li>
                                      ))}
                                    </ul>
                                    {personalizedInsights.summary && (
                                      <p className="text-sm text-indigo-700 italic mt-3 pt-3 border-t border-indigo-200">
                                        {personalizedInsights.summary}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-sm text-indigo-700">
                                    <p>Click to generate insights...</p>
                                    <Button
                                      onClick={generateInsights}
                                      size="sm"
                                      variant="outline"
                                      className="mt-2 border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                                    >
                                      Generate Insights
                                    </Button>
                                  </div>
                                )}
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
                  completedCourses={selectedPlan.semesters
                    .flatMap((s: SemesterPlan) => s.courses)
                    .filter((c: PlannedCourse) => c.completed)
                    .map((c: PlannedCourse) => c.code)}
                  currentSemester={selectedPlan.semesters.findIndex((s: SemesterPlan) => 
                    s.courses.some((c: PlannedCourse) => !c.completed)
                  ) + 1 || 1}
                  existingCoursesInSemester={selectedPlan.semesters[selectedSemesterIndex]?.courses.map((c: PlannedCourse) => c.code) || []}
                  onScheduleGenerated={handleScheduleGenerated}
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
                onClose={() => {
                  setSelectedCourse(null);
                  // Reopen schedule preview if it was open before viewing course details
                  if (shouldReopenSchedulePreview) {
                    setShouldReopenSchedulePreview(false);
                    // Small delay for smooth transition between modals
                    setTimeout(() => setIsSchedulePreviewOpen(true), 150);
                  }
                }}
              />
            )}

            {/* Profile Edit Dialog */}
            <ProfileEditDialog
              open={isProfileEditOpen}
              onOpenChange={setIsProfileEditOpen}
              profile={userProfile}
              onProfileUpdate={handleProfileUpdate}
            />

            {/* Schedule Preview Modal */}
            <SchedulePreviewModal
              open={isSchedulePreviewOpen}
              onOpenChange={setIsSchedulePreviewOpen}
              generatedSchedule={generatedSchedule}
              reasoning={scheduleReasoning}
              availableSemesters={getAvailableSemesters()}
              onApplySchedule={handleApplySchedule}
              onCourseClick={(course) => {
                // Close schedule preview temporarily and mark to reopen after course detail closes
                setIsSchedulePreviewOpen(false);
                setShouldReopenSchedulePreview(true);
                // Small delay for smooth transition between modals
                setTimeout(() => setSelectedCourse(course), 150);
              }}
            />
          </div>
        </DndProvider>
      </>
    );
  }

  return null;
}