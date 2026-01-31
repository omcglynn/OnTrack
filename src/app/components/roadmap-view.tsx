import { Course } from '@/app/data/mock-courses';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Book, Star, TrendingUp, Briefcase, CheckCircle2, Calendar, Clock, BookOpen, Plus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export interface PlannedCourse extends Course {
  grade?: string; // A, A-, B+, B, B-, C+, C, C-, D+, D, F
  completed?: boolean;
  inProgress?: boolean;
}

export interface SemesterPlan {
  semester: number;
  season: 'Fall' | 'Spring' | 'Summer';
  year: number;
  courses: PlannedCourse[];
  totalCredits: number;
  isInternshipSemester?: boolean;
  status: 'completed' | 'in-progress' | 'planned' | 'unplanned';
}

// GPA calculation helpers
export const gradePoints: { [key: string]: number } = {
  'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0,
  'F': 0.0,
};

export function calculateGPA(semesters: SemesterPlan[]): { gpa: number; totalCredits: number; completedCredits: number } {
  let totalQualityPoints = 0;
  let totalCredits = 0;
  let completedCredits = 0;

  semesters.forEach(semester => {
    semester.courses.forEach(course => {
      if (course.completed && course.grade) {
        const points = gradePoints[course.grade] ?? 0;
        totalQualityPoints += points * course.credits;
        completedCredits += course.credits;
      }
      totalCredits += course.credits;
    });
  });

  return {
    gpa: completedCredits > 0 ? totalQualityPoints / completedCredits : 0,
    totalCredits,
    completedCredits,
  };
}

interface RoadmapViewProps {
  plan: SemesterPlan[];
  careerGoal: string;
  onCourseClick?: (course: Course) => void;
  onViewSchedule?: (semesterIndex: number) => void;
  onPlanSemester?: (semesterIndex: number) => void;
}

export function RoadmapView({ plan, careerGoal, onCourseClick, onViewSchedule, onPlanSemester }: RoadmapViewProps) {
  const getRelevanceColor = (course: Course) => {
    const relevance = course.careerRelevance?.[careerGoal] || 0;
    if (relevance >= 90) return 'bg-green-100 border-green-400 text-green-800';
    if (relevance >= 70) return 'bg-blue-100 border-blue-400 text-blue-800';
    if (relevance >= 50) return 'bg-yellow-100 border-yellow-400 text-yellow-800';
    return 'bg-gray-100 border-gray-300 text-gray-600';
  };

  const getRelevanceIcon = (course: Course) => {
    const relevance = course.careerRelevance?.[careerGoal] || 0;
    if (relevance >= 90) return <Star className="w-3 h-3 fill-current" />;
    if (relevance >= 70) return <TrendingUp className="w-3 h-3" />;
    return null;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'major': return 'bg-purple-500';
      case 'core': return 'bg-blue-500';
      case 'elective': return 'bg-green-500';
      case 'gen-ed': return 'bg-amber-500';
      case 'lab-science': return 'bg-cyan-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <Card className="p-4 bg-white">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span>CIS Core</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Math</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <span>Lab Science</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Electives</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Gen Ed</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-3 h-3 text-green-800 fill-current" />
            <span>Career Relevant</span>
          </div>
        </div>
      </Card>

      {/* Semester Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plan.map((semester, semesterIndex) => {
          const semesterGPA = semester.courses.filter(c => c.completed && c.grade).length > 0
            ? semester.courses.filter(c => c.completed && c.grade)
                .reduce((sum, c) => sum + (gradePoints[c.grade!] || 0) * c.credits, 0) /
              semester.courses.filter(c => c.completed && c.grade)
                .reduce((sum, c) => sum + c.credits, 0)
            : null;

          return (
            <Card
              key={semester.semester}
              className={`p-6 transition-all ${
                semester.status === 'completed' 
                  ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300' 
                  : semester.status === 'in-progress'
                  ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-400 shadow-lg'
                  : semester.status === 'unplanned'
                  ? 'bg-gray-50 border-2 border-dashed border-gray-300'
                  : semester.isInternshipSemester 
                  ? 'bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-300' 
                  : 'bg-white'
              }`}
            >
              {/* Semester Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">
                      Year {semester.year} - {semester.season}
                    </h3>
                    {semester.status === 'completed' && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                    {semester.status === 'in-progress' && (
                      <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <p className="text-sm text-gray-600">
                      {semester.totalCredits} credits
                    </p>
                    {semesterGPA !== null && (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        GPA: {semesterGPA.toFixed(2)}
                      </Badge>
                    )}
                    {semester.status !== 'unplanned' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-[10px] gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        onClick={() => onViewSchedule?.(semester.semester - 1)}
                      >
                        <Calendar className="w-3 h-3" />
                        View Schedule
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {semester.status === 'completed' && (
                    <Badge className="bg-emerald-600 gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </Badge>
                  )}
                  {semester.status === 'in-progress' && (
                    <Badge className="bg-blue-600 gap-1">
                      <Clock className="w-3 h-3" />
                      Current
                    </Badge>
                  )}
                  {semester.status === 'unplanned' && (
                    <Badge variant="outline" className="border-gray-400 text-gray-500 gap-1">
                      <BookOpen className="w-3 h-3" />
                      Not Planned
                    </Badge>
                  )}
                  {semester.isInternshipSemester && semester.status === 'planned' && (
                    <Badge className="bg-orange-500 gap-1">
                      <Briefcase className="w-3 h-3" />
                      Internship Ready
                    </Badge>
                  )}
                </div>
              </div>

              {/* Course List or Empty State */}
              {semester.status === 'unplanned' ? (
                <div className="py-8 text-center">
                  <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No courses planned yet</p>
                  <p className="text-sm text-gray-400 mt-1">Add courses from the catalog to plan this semester</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 gap-2"
                    onClick={() => onPlanSemester?.(semesterIndex)}
                  >
                    <Plus className="w-4 h-4" />
                    Plan Semester
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {semester.courses.map((course) => {
                    const relevance = course.careerRelevance?.[careerGoal] || 0;
                    const isCompleted = course.completed;
                    const isInProgress = course.inProgress;
                    
                    return (
                      <button
                        key={course.id}
                        onClick={() => onCourseClick?.(course)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                          isCompleted 
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                            : isInProgress
                            ? 'bg-blue-50 border-blue-300 text-blue-900'
                            : getRelevanceColor(course)
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : isInProgress ? (
                                <Clock className="w-4 h-4 text-blue-600" />
                              ) : (
                                <div className={`w-2 h-2 rounded-full ${getCategoryColor(course.category)}`} />
                              )}
                              <span className={`font-semibold text-sm ${isCompleted ? 'text-emerald-700' : ''}`}>
                                {course.code}
                              </span>
                              {!isCompleted && !isInProgress && getRelevanceIcon(course)}
                            </div>
                            <p className={`text-sm font-medium truncate ${isCompleted ? 'text-emerald-700' : ''}`}>
                              {course.name}
                            </p>
                            {isCompleted && course.grade && (
                              <p className="text-xs mt-1 font-semibold text-emerald-600">
                                Grade: {course.grade}
                              </p>
                            )}
                            {isInProgress && (
                              <p className="text-xs mt-1 text-blue-600 font-medium">
                                In Progress
                              </p>
                            )}
                            {!isCompleted && !isInProgress && relevance > 0 && (
                              <p className="text-xs mt-1 opacity-75">
                                {relevance}% relevant to {careerGoal}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="text-xs font-semibold whitespace-nowrap">
                              {course.credits} cr
                            </div>
                            {isCompleted && course.grade && (
                              <Badge 
                                className={`text-xs ${
                                  gradePoints[course.grade] >= 3.7 ? 'bg-emerald-600' :
                                  gradePoints[course.grade] >= 3.0 ? 'bg-blue-600' :
                                  gradePoints[course.grade] >= 2.0 ? 'bg-amber-600' :
                                  'bg-red-600'
                                }`}
                              >
                                {course.grade}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Skills Preview - only show for non-completed */}
                        {!isCompleted && course.skills && course.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {course.skills.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="text-xs px-2 py-0.5 rounded-full bg-white/50"
                              >
                                {skill}
                              </span>
                            ))}
                            {course.skills.length > 3 && (
                              <span className="text-xs px-2 py-0.5">
                                +{course.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Internship Note */}
              {semester.isInternshipSemester && semester.status === 'planned' && (
                <div className="mt-4 p-3 bg-white/60 rounded-lg border border-orange-200">
                  <div className="flex gap-2 items-start">
                    <Briefcase className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-orange-900">Lighter semester for internship</p>
                      <p className="text-orange-700 text-xs mt-1">
                        Reduced course load to allow time for professional experience
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      {(() => {
        const gpaData = calculateGPA(plan);
        const completedSemesters = plan.filter(s => s.status === 'completed').length;
        const inProgressCredits = plan
          .filter(s => s.status === 'in-progress')
          .reduce((sum, s) => sum + s.totalCredits, 0);
        const plannedCredits = plan
          .filter(s => s.status === 'planned')
          .reduce((sum, s) => sum + s.totalCredits, 0);
        
        return (
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
            <h3 className="font-bold text-lg mb-4">Academic Progress</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white/60 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Cumulative GPA</p>
                <p className={`text-2xl font-bold ${
                  gpaData.gpa >= 3.5 ? 'text-emerald-600' :
                  gpaData.gpa >= 3.0 ? 'text-blue-600' :
                  gpaData.gpa >= 2.0 ? 'text-amber-600' :
                  'text-red-600'
                }`}>
                  {gpaData.completedCredits > 0 ? gpaData.gpa.toFixed(2) : '—'}
                </p>
              </div>
              <div className="bg-white/60 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Completed</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {gpaData.completedCredits} <span className="text-sm font-normal text-gray-500">cr</span>
                </p>
              </div>
              <div className="bg-white/60 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {inProgressCredits} <span className="text-sm font-normal text-gray-500">cr</span>
                </p>
              </div>
              <div className="bg-white/60 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Planned</p>
                <p className="text-2xl font-bold text-purple-600">
                  {plannedCredits} <span className="text-sm font-normal text-gray-500">cr</span>
                </p>
              </div>
              <div className="bg-white/60 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Remaining</p>
                <p className="text-2xl font-bold text-gray-600">
                  {Math.max(0, 120 - gpaData.completedCredits - inProgressCredits - plannedCredits)} <span className="text-sm font-normal text-gray-500">cr</span>
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">Progress to Graduation (120 credits)</span>
                <span className="font-semibold">{Math.round((gpaData.completedCredits / 120) * 100)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 transition-all"
                  style={{ width: `${(gpaData.completedCredits / 120) * 100}%` }}
                  title={`Completed: ${gpaData.completedCredits} credits`}
                />
                <div 
                  className="bg-blue-500 transition-all"
                  style={{ width: `${(inProgressCredits / 120) * 100}%` }}
                  title={`In Progress: ${inProgressCredits} credits`}
                />
                <div 
                  className="bg-purple-300 transition-all"
                  style={{ width: `${(plannedCredits / 120) * 100}%` }}
                  title={`Planned: ${plannedCredits} credits`}
                />
              </div>
              <div className="flex gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <span>In Progress</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-purple-300" />
                  <span>Planned</span>
                </div>
              </div>
            </div>
          </Card>
        );
      })()}
    </div>
  );
}
