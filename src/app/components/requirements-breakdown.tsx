import { useState } from 'react';
import { SemesterPlan, PlannedCourse, gradePoints, calculateGPA } from './roadmap-view';
import { COURSES, DEGREE_REQUIREMENTS } from '@/app/data/mock-courses';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Card } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/app/components/ui/accordion';
import { 
  GraduationCap, CheckCircle2, Clock, BookOpen, ChevronRight, 
  Award, Target, TrendingUp, AlertCircle
} from 'lucide-react';

interface RequirementsBreakdownProps {
  semesters: SemesterPlan[];
  trigger?: React.ReactNode;
}

interface RequirementCategory {
  name: string;
  requiredCredits: number;
  completedCredits: number;
  inProgressCredits: number;
  plannedCredits: number;
  completedCourses: PlannedCourse[];
  inProgressCourses: PlannedCourse[];
  plannedCourses: PlannedCourse[];
  remainingCredits: number;
  color: string;
  description: string;
}

export function RequirementsBreakdown({ semesters, trigger }: RequirementsBreakdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Categorize all courses
  const allCourses = semesters.flatMap(s => s.courses);
  const completedCourses = allCourses.filter(c => c.completed);
  const inProgressCourses = allCourses.filter(c => c.inProgress);
  const plannedCourses = allCourses.filter(c => !c.completed && !c.inProgress);

  // Calculate requirements
  const calculateCategory = (
    name: string,
    requiredCredits: number,
    filter: (course: PlannedCourse) => boolean,
    color: string,
    description: string
  ): RequirementCategory => {
    const completed = completedCourses.filter(filter);
    const inProgress = inProgressCourses.filter(filter);
    const planned = plannedCourses.filter(filter);
    
    const completedCr = completed.reduce((sum, c) => sum + c.credits, 0);
    const inProgressCr = inProgress.reduce((sum, c) => sum + c.credits, 0);
    const plannedCr = planned.reduce((sum, c) => sum + c.credits, 0);
    
    return {
      name,
      requiredCredits,
      completedCredits: completedCr,
      inProgressCredits: inProgressCr,
      plannedCredits: plannedCr,
      completedCourses: completed,
      inProgressCourses: inProgress,
      plannedCourses: planned,
      remainingCredits: Math.max(0, requiredCredits - completedCr - inProgressCr - plannedCr),
      color,
      description,
    };
  };

  const requirements: RequirementCategory[] = [
    calculateCategory(
      'CIS Core',
      47,
      (c) => c.category === 'major',
      'bg-purple-500',
      'Required Computer Science courses for the major'
    ),
    calculateCategory(
      'Mathematics',
      8,
      (c) => c.category === 'core',
      'bg-blue-500',
      'Calculus I & II sequence'
    ),
    calculateCategory(
      'Lab Science',
      8,
      (c) => c.category === 'lab-science',
      'bg-cyan-500',
      'Two-course laboratory science sequence'
    ),
    calculateCategory(
      'CS Electives',
      16,
      (c) => c.category === 'elective' && (c.code.startsWith('CIS') || c.code.startsWith('MATH 2')),
      'bg-green-500',
      'Computer Science elective courses'
    ),
    calculateCategory(
      'Gen Ed Foundation',
      14,
      (c) => c.category === 'gen-ed' && ['GW', 'GQ', 'GY', 'GZ'].includes(c.genEdAttribute || ''),
      'bg-amber-500',
      'Analytical Reading & Writing, Quantitative Literacy, Intellectual Heritage I & II'
    ),
    calculateCategory(
      'Gen Ed Breadth',
      22,
      (c) => c.category === 'gen-ed' && !['GW', 'GQ', 'GY', 'GZ'].includes(c.genEdAttribute || ''),
      'bg-rose-500',
      'Arts, Human Behavior, Race & Diversity, World Society, Science & Technology, U.S. Society'
    ),
    calculateCategory(
      'Free Electives / Other',
      5,
      (c) => c.category === 'elective' && !c.code.startsWith('CIS') && !c.code.startsWith('MATH'),
      'bg-gray-500',
      'Additional elective courses to reach 120 credits'
    ),
  ];

  const gpaData = calculateGPA(semesters);
  const totalRequired = 120;
  const totalCompleted = gpaData.completedCredits;
  const totalInProgress = allCourses.filter(c => c.inProgress).reduce((sum, c) => sum + c.credits, 0);
  const totalPlanned = allCourses.filter(c => !c.completed && !c.inProgress).reduce((sum, c) => sum + c.credits, 0);
  const overallProgress = (totalCompleted / totalRequired) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <GraduationCap className="w-4 h-4" />
            View Requirements
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <GraduationCap className="w-6 h-6 text-purple-600" />
            Graduation Requirements Breakdown
          </DialogTitle>
          <DialogDescription>
            Track your progress toward completing your Computer Science degree
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 min-h-0">
          <div className="space-y-6 pb-4">
            {/* Overall Progress Card */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-purple-900">Overall Progress</h3>
                  <p className="text-sm text-purple-700">
                    {totalCompleted} of {totalRequired} credits completed
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600">
                    {Math.round(overallProgress)}%
                  </div>
                  <div className="text-sm text-purple-700">
                    GPA: {gpaData.completedCredits > 0 ? gpaData.gpa.toFixed(2) : '—'}
                  </div>
                </div>
              </div>
              
              {/* Stacked progress bar */}
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 transition-all"
                  style={{ width: `${(totalCompleted / totalRequired) * 100}%` }}
                />
                <div 
                  className="bg-blue-500 transition-all"
                  style={{ width: `${(totalInProgress / totalRequired) * 100}%` }}
                />
                <div 
                  className="bg-purple-300 transition-all"
                  style={{ width: `${(totalPlanned / totalRequired) * 100}%` }}
                />
              </div>
              
              <div className="flex gap-6 mt-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  <span>Completed: {totalCompleted} cr</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <span>In Progress: {totalInProgress} cr</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-300" />
                  <span>Planned: {totalPlanned} cr</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gray-200" />
                  <span>Remaining: {Math.max(0, totalRequired - totalCompleted - totalInProgress - totalPlanned)} cr</span>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4 text-center bg-emerald-50 border-emerald-200">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                <div className="text-2xl font-bold text-emerald-700">{completedCourses.length}</div>
                <div className="text-xs text-emerald-600">Courses Completed</div>
              </Card>
              <Card className="p-4 text-center bg-blue-50 border-blue-200">
                <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-700">{inProgressCourses.length}</div>
                <div className="text-xs text-blue-600">In Progress</div>
              </Card>
              <Card className="p-4 text-center bg-purple-50 border-purple-200">
                <BookOpen className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-700">{plannedCourses.length}</div>
                <div className="text-xs text-purple-600">Planned</div>
              </Card>
              <Card className="p-4 text-center bg-amber-50 border-amber-200">
                <Target className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                <div className="text-2xl font-bold text-amber-700">
                  {requirements.reduce((sum, r) => sum + (r.remainingCredits > 0 ? 1 : 0), 0)}
                </div>
                <div className="text-xs text-amber-600">Categories Incomplete</div>
              </Card>
            </div>

            {/* Requirements Accordion */}
            <Accordion type="multiple" defaultValue={requirements.filter(r => r.completedCredits < r.requiredCredits).map(r => r.name)} className="space-y-2">
              {requirements.map((req) => {
                const progress = (req.completedCredits / req.requiredCredits) * 100;
                const totalProgress = ((req.completedCredits + req.inProgressCredits + req.plannedCredits) / req.requiredCredits) * 100;
                const isComplete = req.completedCredits >= req.requiredCredits;
                const isOnTrack = (req.completedCredits + req.inProgressCredits + req.plannedCredits) >= req.requiredCredits;
                
                return (
                  <AccordionItem 
                    key={req.name} 
                    value={req.name}
                    className={`border rounded-lg overflow-hidden ${
                      isComplete ? 'border-emerald-300 bg-emerald-50/50' : 
                      isOnTrack ? 'border-blue-200 bg-white' : 
                      'border-amber-300 bg-amber-50/30'
                    }`}
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${req.color}`} />
                          <div className="text-left">
                            <div className="font-semibold flex items-center gap-2">
                              {req.name}
                              {isComplete && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                              {!isComplete && !isOnTrack && <AlertCircle className="w-4 h-4 text-amber-600" />}
                            </div>
                            <div className="text-xs text-gray-500">{req.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-semibold">
                              {req.completedCredits}/{req.requiredCredits} credits
                            </div>
                            <div className="text-xs text-gray-500">
                              {Math.round(progress)}% complete
                            </div>
                          </div>
                          <div className="w-24">
                            <Progress value={Math.min(progress, 100)} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4 pt-2">
                        {/* Detailed progress bar */}
                        <div>
                          <div className="h-3 bg-gray-200 rounded-full overflow-hidden flex">
                            <div 
                              className="bg-emerald-500 transition-all"
                              style={{ width: `${Math.min((req.completedCredits / req.requiredCredits) * 100, 100)}%` }}
                            />
                            <div 
                              className="bg-blue-500 transition-all"
                              style={{ width: `${Math.min((req.inProgressCredits / req.requiredCredits) * 100, 100 - (req.completedCredits / req.requiredCredits) * 100)}%` }}
                            />
                            <div 
                              className="bg-purple-300 transition-all"
                              style={{ width: `${Math.min((req.plannedCredits / req.requiredCredits) * 100, 100 - ((req.completedCredits + req.inProgressCredits) / req.requiredCredits) * 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs mt-1 text-gray-600">
                            <span>Completed: {req.completedCredits} cr</span>
                            <span>In Progress: {req.inProgressCredits} cr</span>
                            <span>Planned: {req.plannedCredits} cr</span>
                            {req.remainingCredits > 0 && (
                              <span className="text-amber-600 font-medium">Need: {req.remainingCredits} cr more</span>
                            )}
                          </div>
                        </div>

                        {/* Completed Courses */}
                        {req.completedCourses.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              Completed ({req.completedCourses.length})
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              {req.completedCourses.map(course => (
                                <div 
                                  key={course.id} 
                                  className="flex items-center justify-between p-2 bg-emerald-100 rounded-md text-sm"
                                >
                                  <div>
                                    <span className="font-mono font-semibold">{course.code}</span>
                                    <span className="text-gray-600 ml-2 text-xs">{course.credits} cr</span>
                                  </div>
                                  {course.grade && (
                                    <Badge className={`text-xs ${
                                      gradePoints[course.grade] >= 3.7 ? 'bg-emerald-600' :
                                      gradePoints[course.grade] >= 3.0 ? 'bg-blue-600' :
                                      gradePoints[course.grade] >= 2.0 ? 'bg-amber-600' :
                                      'bg-red-600'
                                    }`}>
                                      {course.grade}
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* In Progress Courses */}
                        {req.inProgressCourses.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              In Progress ({req.inProgressCourses.length})
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              {req.inProgressCourses.map(course => (
                                <div 
                                  key={course.id} 
                                  className="flex items-center justify-between p-2 bg-blue-100 rounded-md text-sm"
                                >
                                  <div>
                                    <span className="font-mono font-semibold">{course.code}</span>
                                    <span className="text-gray-600 ml-2 text-xs">{course.credits} cr</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs border-blue-400 text-blue-700">
                                    Current
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Planned Courses */}
                        {req.plannedCourses.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              Planned ({req.plannedCourses.length})
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              {req.plannedCourses.map(course => (
                                <div 
                                  key={course.id} 
                                  className="flex items-center justify-between p-2 bg-purple-100 rounded-md text-sm"
                                >
                                  <div>
                                    <span className="font-mono font-semibold">{course.code}</span>
                                    <span className="text-gray-600 ml-2 text-xs">{course.credits} cr</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs border-purple-400 text-purple-700">
                                    Planned
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Still Needed */}
                        {req.remainingCredits > 0 && (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-center gap-2 text-amber-800">
                              <AlertCircle className="w-4 h-4" />
                              <span className="font-medium">
                                You still need {req.remainingCredits} more credits in this category
                              </span>
                            </div>
                            <p className="text-sm text-amber-700 mt-1">
                              Browse the course catalog to add more courses to your plan.
                            </p>
                          </div>
                        )}

                        {/* Category Complete */}
                        {isComplete && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <div className="flex items-center gap-2 text-emerald-800">
                              <Award className="w-4 h-4" />
                              <span className="font-medium">
                                🎉 This requirement is complete!
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            {/* Graduation Status */}
            <Card className={`p-6 ${
              overallProgress >= 100 
                ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-300' 
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  overallProgress >= 100 ? 'bg-emerald-100' : 'bg-blue-100'
                }`}>
                  <GraduationCap className={`w-8 h-8 ${
                    overallProgress >= 100 ? 'text-emerald-600' : 'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${
                    overallProgress >= 100 ? 'text-emerald-800' : 'text-blue-800'
                  }`}>
                    {overallProgress >= 100 
                      ? '🎓 Ready to Graduate!' 
                      : `${Math.round(100 - overallProgress)}% to Graduation`
                    }
                  </h3>
                  <p className={`text-sm ${
                    overallProgress >= 100 ? 'text-emerald-700' : 'text-blue-700'
                  }`}>
                    {overallProgress >= 100 
                      ? 'Congratulations! You have completed all degree requirements.'
                      : `You need ${Math.max(0, totalRequired - totalCompleted - totalInProgress - totalPlanned)} more credits to complete your degree.`
                    }
                  </p>
                </div>
                {gpaData.gpa >= 3.5 && gpaData.completedCredits > 0 && (
                  <Badge className="bg-amber-500 text-white">
                    <Award className="w-3 h-3 mr-1" />
                    Distinction Track
                  </Badge>
                )}
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

