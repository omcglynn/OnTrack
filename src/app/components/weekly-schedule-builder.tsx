import { useState, useCallback, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Course, COURSES } from '@/app/data/mock-courses';
import { SemesterPlan, PlannedCourse, gradePoints } from './roadmap-view';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import { 
  Calendar, Download, ChevronLeft, ChevronRight, CheckCircle2, Clock, BookOpen, Plus, 
  Trash2, AlertTriangle, GraduationCap, X
} from 'lucide-react';
import { getCourseSchedule, canAddCourse, formatScheduleDisplay, timeToMinutes } from '@/app/utils/schedule-utils';
import { toast } from 'sonner';

interface ClassSchedule {
  id: string;
  course: PlannedCourse;
  days: string[];
  startTime: string;
  endTime: string;
  location: string;
  professor: string;
  classType: 'Lecture' | 'Lab' | 'Seminar' | 'Discussion' | 'Recitation';
}

interface WeeklyScheduleBuilderProps {
  semesters: SemesterPlan[];
  selectedSemesterIndex: number;
  onSemesterChange: (index: number) => void;
  careerGoal: string;
  onCourseClick?: (course: Course) => void;
  onUpdateSemesters?: (semesters: SemesterPlan[]) => void;
  autoOpenAddCourse?: boolean;
  onAutoOpenHandled?: () => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];

const ItemTypes = {
  COURSE: 'course',
  CATALOG_COURSE: 'catalog_course',
};

// Generate schedule data from planned courses
const generateScheduleFromCourses = (courses: PlannedCourse[]): ClassSchedule[] => {
  return courses.map((course, idx) => {
    const schedule = course.schedule || getCourseSchedule(course);
    return {
      id: `sched-${course.code}-${idx}`,
      course,
      days: schedule.days,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      location: schedule.location,
      professor: schedule.professor,
      classType: schedule.classType,
    };
  });
};

// Height per hour slot in pixels
const SLOT_HEIGHT = 64;

function getClassPosition(startTime: string, endTime: string) {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const dayStartMinutes = timeToMinutes('08:00');
  
  const topPosition = ((startMinutes - dayStartMinutes) / 60) * SLOT_HEIGHT;
  const height = ((endMinutes - startMinutes) / 60) * SLOT_HEIGHT;
  
  return { top: topPosition, height: Math.max(height, 46) };
}

interface ScheduledCourseProps {
  classSchedule: ClassSchedule;
  day: string;
  color: string;
  isCompleted: boolean;
  onCourseClick?: (course: Course) => void;
  onRemoveCourse?: (course: PlannedCourse) => void;
  canRemove: boolean;
}

const ScheduledCourse = ({ classSchedule, day, color, isCompleted, onCourseClick, onRemoveCourse, canRemove }: ScheduledCourseProps) => {
  const { top, height } = getClassPosition(classSchedule.startTime, classSchedule.endTime);
  const isCompact = height < 70;
  const isVeryCompact = height < 55;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCourseClick?.(classSchedule.course);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveCourse?.(classSchedule.course);
  };

  return (
    <div
      onClick={handleClick}
      title={`${classSchedule.course.code}: ${classSchedule.course.name}\n${classSchedule.startTime} - ${classSchedule.endTime}\n${classSchedule.location}${classSchedule.course.grade ? `\nGrade: ${classSchedule.course.grade}` : ''}`}
      className={`absolute left-0.5 right-0.5 rounded-md shadow-sm cursor-pointer hover:shadow-lg transition-all z-10 hover:z-20 group overflow-hidden ${
        isCompleted ? '' : ''
      }`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: isCompleted ? '#10b981' : color,
        minHeight: '46px',
        padding: isVeryCompact ? '4px 6px' : '6px 8px',
      }}
    >
      <div className="text-white leading-tight h-full flex flex-col overflow-hidden">
        {/* Header row with code and remove button */}
        <div className="flex items-center justify-between gap-1 flex-shrink-0">
          <div className="font-bold text-[11px] sm:text-xs">{classSchedule.course.code}</div>
          {canRemove && (
            <button
              onClick={handleRemove}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-white/20 rounded flex-shrink-0"
              title="Remove course"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          {isCompleted && classSchedule.course.grade && isVeryCompact && (
            <Badge className="text-[10px] bg-white/40 px-1.5 py-0.5 h-5 flex-shrink-0 font-semibold">
              {classSchedule.course.grade}
            </Badge>
          )}
        </div>
        
        {/* Course name - hide on very compact */}
        {!isVeryCompact && (
          <div className="opacity-90 text-[10px] sm:text-[11px] line-clamp-2 flex-1 min-h-0 overflow-hidden">
            {classSchedule.course.name}
          </div>
        )}
        
        {/* Time - always show */}
        <div className="opacity-90 text-[9px] flex-shrink-0 mt-auto">
          {classSchedule.startTime} - {classSchedule.endTime}
        </div>
        
        {/* Location - hide on compact */}
        {!isCompact && (
          <div className="opacity-75 text-[9px] truncate flex-shrink-0">
            {classSchedule.location}
          </div>
        )}
        
        {/* Grade badge - only on non-compact completed */}
        {isCompleted && classSchedule.course.grade && !isVeryCompact && (
          <Badge className="mt-1 text-[11px] bg-white/40 w-fit flex-shrink-0 px-2 py-0.5 font-semibold">
            Grade: {classSchedule.course.grade}
          </Badge>
        )}
      </div>
    </div>
  );
};

export function WeeklyScheduleBuilder({ 
  semesters, 
  selectedSemesterIndex, 
  onSemesterChange, 
  careerGoal, 
  onCourseClick,
  onUpdateSemesters,
  autoOpenAddCourse,
  onAutoOpenHandled,
}: WeeklyScheduleBuilderProps) {
  const [localSemesters, setLocalSemesters] = useState(semesters);
  const currentSemester = localSemesters[selectedSemesterIndex];
  const [schedule, setSchedule] = useState<ClassSchedule[]>(
    generateScheduleFromCourses(currentSemester.courses)
  );
  
  // Dialogs
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  
  // Auto-open add course dialog when requested
  useEffect(() => {
    if (autoOpenAddCourse) {
      setIsAddCourseOpen(true);
      onAutoOpenHandled?.();
    }
  }, [autoOpenAddCourse, onAutoOpenHandled]);
  const [isGradeEntryOpen, setIsGradeEntryOpen] = useState(false);
  const [isMarkCompleteOpen, setIsMarkCompleteOpen] = useState(false);
  const [courseToRemove, setCourseToRemove] = useState<PlannedCourse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseGrades, setCourseGrades] = useState<Record<string, string>>({});

  // Update schedule when semester changes
  useEffect(() => {
    setSchedule(generateScheduleFromCourses(currentSemester.courses));
    // Initialize grades from existing course data
    const grades: Record<string, string> = {};
    currentSemester.courses.forEach(c => {
      if (c.grade) grades[c.code] = c.grade;
    });
    setCourseGrades(grades);
  }, [selectedSemesterIndex, currentSemester.courses]);

  // Sync local state with props
  useEffect(() => {
    setLocalSemesters(semesters);
  }, [semesters]);

  const getClassesForDay = (day: string) => {
    return schedule.filter(s => s.days.includes(day));
  };

  const handleExportCalendar = () => {
    toast.info('Calendar export feature would integrate with Google Calendar/Outlook');
  };

  const handlePreviousSemester = () => {
    if (selectedSemesterIndex > 0) {
      onSemesterChange(selectedSemesterIndex - 1);
    }
  };

  const handleNextSemester = () => {
    if (selectedSemesterIndex < localSemesters.length - 1) {
      onSemesterChange(selectedSemesterIndex + 1);
    }
  };

  const getSemesterLabel = (semester: SemesterPlan) => {
    return `${semester.season} Year ${semester.year}`;
  };

  const getSemesterStatusBadge = (semester: SemesterPlan) => {
    switch (semester.status) {
      case 'completed':
        return (
          <Badge className="bg-emerald-600 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge className="bg-blue-600 gap-1">
            <Clock className="w-3 h-3" />
            Current
          </Badge>
        );
      case 'unplanned':
        return (
          <Badge variant="outline" className="border-gray-400 text-gray-500 gap-1">
            <BookOpen className="w-3 h-3" />
            Not Planned
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-purple-400 text-purple-600 gap-1">
            <Calendar className="w-3 h-3" />
            Planned
          </Badge>
        );
    }
  };

  const getRelevanceColor = (course: Course) => {
    const relevance = course.careerRelevance?.[careerGoal] || 0;
    if (relevance >= 90) return '#4f46e5';
    if (relevance >= 70) return '#7c3aed';
    if (relevance >= 50) return '#db2777';
    return '#64748b';
  };

  // Add course to semester
  const handleAddCourse = (course: Course) => {
    const validation = canAddCourse(course, currentSemester, localSemesters);
    
    if (!validation.canAdd) {
      toast.error(validation.reason);
      return;
    }
    
    const newCourse: PlannedCourse = {
      ...course,
      schedule: getCourseSchedule(course),
      inProgress: currentSemester.status === 'in-progress',
    };
    
    const updatedSemesters = localSemesters.map((sem, idx) => {
      if (idx === selectedSemesterIndex) {
        const newCourses = [...sem.courses, newCourse];
        return {
          ...sem,
          courses: newCourses,
          totalCredits: newCourses.reduce((sum, c) => sum + c.credits, 0),
          status: sem.status === 'unplanned' ? 'planned' as const : sem.status,
        };
      }
      return sem;
    });
    
    setLocalSemesters(updatedSemesters);
    onUpdateSemesters?.(updatedSemesters);
    toast.success(`Added ${course.code} to ${getSemesterLabel(currentSemester)}`);
    setIsAddCourseOpen(false);
  };

  // Remove course from semester
  const handleRemoveCourse = (course: PlannedCourse) => {
    setCourseToRemove(course);
  };

  const confirmRemoveCourse = () => {
    if (!courseToRemove) return;
    
    const updatedSemesters = localSemesters.map((sem, idx) => {
      if (idx === selectedSemesterIndex) {
        const newCourses = sem.courses.filter(c => c.code !== courseToRemove.code);
        return {
          ...sem,
          courses: newCourses,
          totalCredits: newCourses.reduce((sum, c) => sum + c.credits, 0),
          status: newCourses.length === 0 ? 'unplanned' as const : sem.status,
        };
      }
      return sem;
    });
    
    setLocalSemesters(updatedSemesters);
    onUpdateSemesters?.(updatedSemesters);
    toast.success(`Removed ${courseToRemove.code}`);
    setCourseToRemove(null);
  };

  // Mark semester as complete with grades
  const handleMarkComplete = () => {
    // Check all courses have grades
    const missingGrades = currentSemester.courses.filter(c => !courseGrades[c.code]);
    if (missingGrades.length > 0) {
      toast.error('Please enter grades for all courses before marking complete');
      return;
    }
    
    const updatedSemesters = localSemesters.map((sem, idx) => {
      if (idx === selectedSemesterIndex) {
        return {
          ...sem,
          status: 'completed' as const,
          courses: sem.courses.map(c => ({
            ...c,
            completed: true,
            inProgress: false,
            grade: courseGrades[c.code],
          })),
        };
      }
      // Mark next semester as in-progress if it exists and was planned
      if (idx === selectedSemesterIndex + 1 && sem.status === 'planned') {
        return {
          ...sem,
          status: 'in-progress' as const,
          courses: sem.courses.map(c => ({ ...c, inProgress: true })),
        };
      }
      return sem;
    });
    
    setLocalSemesters(updatedSemesters);
    onUpdateSemesters?.(updatedSemesters);
    toast.success(`${getSemesterLabel(currentSemester)} marked as complete!`);
    setIsMarkCompleteOpen(false);
  };

  // Filter available courses for adding
  const availableCourses = COURSES.filter(course => {
    // Not already in any semester
    const allCourses = localSemesters.flatMap(s => s.courses);
    if (allCourses.some(c => c.code === course.code)) return false;
    
    // Match search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return course.code.toLowerCase().includes(query) || 
             course.name.toLowerCase().includes(query);
    }
    return true;
  });

  const canModifySemester = currentSemester.status !== 'completed';

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex flex-col gap-3">
          {/* Semester Navigation */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousSemester}
              disabled={selectedSemesterIndex === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-2 mb-0.5">
                <h2 className="text-lg sm:text-xl font-bold">
                  {getSemesterLabel(currentSemester)} Schedule
                </h2>
                {getSemesterStatusBadge(currentSemester)}
              </div>
              <p className="text-xs text-gray-600">
                Semester {currentSemester.semester} of {localSemesters.length} • {currentSemester.totalCredits} credits • {currentSemester.courses.length} courses
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextSemester}
              disabled={selectedSemesterIndex === localSemesters.length - 1}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Semester Selector - Quick Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Quick Jump:</span>
            <div className="flex gap-1">
              {localSemesters.map((sem, idx) => (
                <Button
                  key={idx}
                  variant={idx === selectedSemesterIndex ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSemesterChange(idx)}
                  className={`text-xs whitespace-nowrap gap-1 ${
                    idx !== selectedSemesterIndex && (
                      sem.status === 'completed' ? 'border-emerald-300 text-emerald-700' :
                      sem.status === 'in-progress' ? 'border-blue-400 text-blue-700' :
                      sem.status === 'unplanned' ? 'border-dashed border-gray-300 text-gray-400' :
                      ''
                    )
                  }`}
                >
                  {sem.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                  {sem.status === 'in-progress' && <Clock className="w-3 h-3" />}
                  {sem.season.charAt(0)}Y{sem.year}
                </Button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-between">
            <div className="flex gap-2">
              {canModifySemester && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsAddCourseOpen(true)} 
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Course
                </Button>
              )}
              {currentSemester.status === 'in-progress' && currentSemester.courses.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsGradeEntryOpen(true)} 
                  className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  <GraduationCap className="w-4 h-4" />
                  Enter Grades & Complete
                </Button>
              )}
            </div>
            <Button size="sm" onClick={handleExportCalendar} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Weekly Calendar Grid */}
      <Card className={`p-2 sm:p-4 bg-white overflow-hidden shadow-xl ${
        currentSemester.status === 'completed' ? 'border-emerald-200' :
        currentSemester.status === 'in-progress' ? 'border-blue-200' :
        currentSemester.status === 'unplanned' ? 'border-dashed border-gray-300' :
        'border-indigo-100'
      }`}>
        {currentSemester.courses.length === 0 ? (
          <div className="py-16 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">No Schedule Yet</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              This semester hasn't been planned yet. Add courses from the catalog to create your schedule.
            </p>
            <Button onClick={() => setIsAddCourseOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Course
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Status hint */}
              {currentSemester.status === 'completed' && (
                <div className="mb-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-sm text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>This semester has been completed. Viewing historical schedule with grades.</span>
                </div>
              )}
              
              {currentSemester.status === 'in-progress' && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-sm text-blue-700">
                  <Clock className="w-4 h-4" />
                  <span>Current semester. Click the X on courses to remove them, or add more from the catalog.</span>
                </div>
              )}

              {(currentSemester.status === 'planned' || currentSemester.status === 'unplanned') && (
                <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-2 text-sm text-purple-700">
                  <Calendar className="w-4 h-4" />
                  <span>Future semester. Add or remove courses to plan your schedule.</span>
                </div>
              )}

              {/* Calendar Header */}
              <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b mb-2">
                <div className="p-1.5"></div>
                {DAYS.map(day => (
                  <div key={day} className="p-1.5 text-center font-bold text-sm text-gray-700">
                    {day}
                  </div>
                ))}
              </div>

              {/* Time slots and classes */}
              <div className="grid grid-cols-[80px_repeat(5,1fr)] relative">
                {/* Time column */}
                <div className="border-r border-gray-100">
                  {TIME_SLOTS.map((time) => (
                    <div key={time} className="h-16 border-b border-gray-50 flex items-start justify-center pt-1 text-[10px] font-medium text-gray-400">
                      {time}
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {DAYS.map((day) => (
                  <div key={day} className="relative border-r border-gray-100 last:border-r-0">
                    {/* Grid lines */}
                    {TIME_SLOTS.map((time) => (
                      <div key={time} className="h-16 border-b border-gray-50"></div>
                    ))}

                    {/* Classes for this day */}
                    {getClassesForDay(day).map((classSchedule) => (
                      <ScheduledCourse 
                        key={`${classSchedule.id}-${day}`}
                        classSchedule={classSchedule}
                        day={day}
                        color={getRelevanceColor(classSchedule.course)}
                        isCompleted={currentSemester.status === 'completed'}
                        onCourseClick={onCourseClick}
                        onRemoveCourse={handleRemoveCourse}
                        canRemove={canModifySemester}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Quick View Stats */}
      {currentSemester.courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className={`p-3 flex flex-col items-center justify-center text-center ${
            currentSemester.status === 'completed' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-blue-50/50 border-blue-100'
          }`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
              currentSemester.status === 'completed' ? 'text-emerald-600' : 'text-blue-600'
            }`}>
              {currentSemester.status === 'completed' ? 'Credits Earned' : 'Credit Load'}
            </span>
            <span className={`text-xl font-bold ${
              currentSemester.status === 'completed' ? 'text-emerald-900' : 'text-blue-900'
            }`}>{currentSemester.totalCredits} Credits</span>
          </Card>
          <Card className="p-3 flex flex-col items-center justify-center text-center bg-purple-50/50 border-purple-100">
            <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider mb-0.5">Career Match</span>
            <span className="text-xl font-bold text-purple-900">
              {Math.round(
                currentSemester.courses.reduce((sum, c) => sum + (c.careerRelevance?.[careerGoal] || 0), 0) / 
                Math.max(currentSemester.courses.length, 1)
              )}%
            </span>
          </Card>
          <Card className={`p-3 flex flex-col items-center justify-center text-center ${
            currentSemester.status === 'completed' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-pink-50/50 border-pink-100'
          }`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
              currentSemester.status === 'completed' ? 'text-emerald-600' : 'text-pink-600'
            }`}>
              {currentSemester.status === 'completed' ? 'Semester GPA' : 'Est. Study Hours'}
            </span>
            <span className={`text-xl font-bold ${
              currentSemester.status === 'completed' ? 'text-emerald-900' : 'text-pink-900'
            }`}>
              {currentSemester.status === 'completed' 
                ? (() => {
                    const coursesWithGrades = currentSemester.courses.filter((c: PlannedCourse) => c.grade);
                    if (coursesWithGrades.length === 0) return '—';
                    const totalPoints = coursesWithGrades.reduce((sum: number, c: PlannedCourse) => 
                      sum + (gradePoints[c.grade!] || 0) * c.credits, 0);
                    const totalCredits = coursesWithGrades.reduce((sum: number, c: PlannedCourse) => sum + c.credits, 0);
                    return (totalPoints / totalCredits).toFixed(2);
                  })()
                : `~${Math.round(currentSemester.totalCredits * 2.5)} hrs`
              }
            </span>
          </Card>
        </div>
      )}

      {/* Add Course Dialog */}
      <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Course to {getSemesterLabel(currentSemester)}</DialogTitle>
            <DialogDescription>
              Select a course to add. Prerequisites and time conflicts are checked automatically.
            </DialogDescription>
          </DialogHeader>
          
          <Input
            placeholder="Search courses by code or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {availableCourses.slice(0, 50).map(course => {
              const validation = canAddCourse(course, currentSemester, localSemesters);
              const schedule = getCourseSchedule(course);
              
              return (
                <div
                  key={course.id}
                  className={`p-3 border rounded-lg ${
                    validation.canAdd 
                      ? 'hover:bg-gray-50 cursor-pointer border-gray-200' 
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                  onClick={() => validation.canAdd && handleAddCourse(course)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-sm">{course.code}</span>
                        <Badge variant="outline" className="text-xs">
                          {course.credits} cr
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {formatScheduleDisplay(schedule)}
                        </Badge>
                      </div>
                      <p className="font-medium text-sm">{course.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{schedule.location} • {schedule.professor}</p>
                      {course.prerequisites && course.prerequisites.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Prerequisites: {course.prerequisites.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {validation.canAdd ? (
                        <Button size="sm" variant="outline" className="gap-1">
                          <Plus className="w-3 h-3" />
                          Add
                        </Button>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-red-600">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{validation.reason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {availableCourses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No available courses match your search
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Grade Entry Dialog */}
      <Dialog open={isGradeEntryOpen} onOpenChange={setIsGradeEntryOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enter Grades & Complete Semester</DialogTitle>
            <DialogDescription>
              Enter your final grades for each course, then mark the semester as complete.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {currentSemester.courses.map(course => (
              <div key={course.code} className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-sm">{course.code}</p>
                  <p className="text-xs text-gray-500">{course.name}</p>
                </div>
                <Select
                  value={courseGrades[course.code] || ''}
                  onValueChange={(value) => setCourseGrades(prev => ({ ...prev, [course.code]: value }))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map(grade => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGradeEntryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkComplete} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              Mark Semester Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Course Confirmation */}
      <AlertDialog open={!!courseToRemove} onOpenChange={() => setCourseToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Course?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {courseToRemove?.code} - {courseToRemove?.name} from this semester?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveCourse} className="bg-red-600 hover:bg-red-700">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
