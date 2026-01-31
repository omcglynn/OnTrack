import { Course } from '@/app/data/mock-courses';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Star, TrendingUp, Briefcase, Calendar } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export interface SemesterPlan {
  semester: number;
  season: 'Fall' | 'Spring' | 'Summer';
  year: number;
  courses: Course[];
  totalCredits: number;
  isInternshipSemester?: boolean;
}

interface RoadmapViewProps {
  plan: SemesterPlan[];
  careerGoal: string;
  onCourseClick?: (course: Course) => void;
  onViewSchedule?: (semesterIndex: number) => void;
}

export function RoadmapView({ plan, careerGoal, onCourseClick, onViewSchedule }: RoadmapViewProps) {
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
      case 'gen-ed': return 'bg-gray-400';
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
            <span>Major Courses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Core Requirements</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Electives</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-3 h-3 text-green-800 fill-current" />
            <span>Highly Relevant to Career</span>
          </div>
        </div>
      </Card>

      {/* Semester Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plan.map((semester) => (
          <Card
            key={semester.semester}
            className={`p-6 ${semester.isInternshipSemester ? 'bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-300' : 'bg-white'}`}
          >
            {/* Semester Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">
                  Year {semester.year} - {semester.season}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-600">
                    {semester.totalCredits} credits
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-[10px] gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                    onClick={() => onViewSchedule?.(semester.semester - 1)}
                  >
                    <Calendar className="w-3 h-3" />
                    View Schedule
                  </Button>
                </div>
              </div>
              {semester.isInternshipSemester && (
                <Badge className="bg-orange-500 gap-1">
                  <Briefcase className="w-3 h-3" />
                  Internship Ready
                </Badge>
              )}
            </div>

            {/* Course List */}
            <div className="space-y-3">
              {semester.courses.map((course) => {
                const relevance = course.careerRelevance?.[careerGoal] || 0;
                return (
                  <button
                    key={course.id}
                    onClick={() => onCourseClick?.(course)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all hover:shadow-md ${getRelevanceColor(course)}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${getCategoryColor(course.category)}`} />
                          <span className="font-semibold text-sm">{course.code}</span>
                          {getRelevanceIcon(course)}
                        </div>
                        <p className="text-sm font-medium truncate">{course.name}</p>
                        {relevance > 0 && (
                          <p className="text-xs mt-1 opacity-75">
                            {relevance}% relevant to {careerGoal}
                          </p>
                        )}
                      </div>
                      <div className="text-xs font-semibold whitespace-nowrap">
                        {course.credits} cr
                      </div>
                    </div>

                    {/* Skills Preview */}
                    {course.skills && course.skills.length > 0 && (
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

            {/* Internship Note */}
            {semester.isInternshipSemester && (
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
        ))}
      </div>

      {/* Summary Stats */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <h3 className="font-bold text-lg mb-4">4-Year Plan Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Credits</p>
            <p className="text-2xl font-bold text-blue-600">
              {plan.reduce((sum, sem) => sum + sem.totalCredits, 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Major Courses</p>
            <p className="text-2xl font-bold text-purple-600">
              {plan.reduce((sum, sem) => sum + sem.courses.filter(c => c.category === 'major').length, 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Electives</p>
            <p className="text-2xl font-bold text-green-600">
              {plan.reduce((sum, sem) => sum + sem.courses.filter(c => c.category === 'elective').length, 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg Credits/Sem</p>
            <p className="text-2xl font-bold text-indigo-600">
              {(plan.reduce((sum, sem) => sum + sem.totalCredits, 0) / plan.length).toFixed(1)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
