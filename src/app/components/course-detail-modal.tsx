import { Course } from '@/app/data/mock-courses';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { X, BookOpen, TrendingUp, Zap, Star, Clock } from 'lucide-react';

interface CourseDetailModalProps {
  course: Course;
  careerGoal: string;
  onClose: () => void;
}

export function CourseDetailModal({ course, careerGoal, onClose }: CourseDetailModalProps) {
  const relevance = course.careerRelevance?.[careerGoal] || 0;

  const getDifficultyLabel = (difficulty?: number) => {
    if (!difficulty) return 'Not rated';
    if (difficulty === 1) return 'Very Easy';
    if (difficulty === 2) return 'Easy';
    if (difficulty === 3) return 'Moderate';
    if (difficulty === 4) return 'Challenging';
    return 'Very Challenging';
  };

  const getDifficultyColor = (difficulty?: number) => {
    if (!difficulty) return 'bg-gray-100 text-gray-600';
    if (difficulty <= 2) return 'bg-green-100 text-green-700';
    if (difficulty === 3) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{course.code}</Badge>
              <Badge className={getDifficultyColor(course.difficulty)}>
                {getDifficultyLabel(course.difficulty)}
              </Badge>
            </div>
            <h2 className="text-2xl font-bold">{course.name}</h2>
            <p className="text-gray-600 mt-1">{course.credits} Credits</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 ml-4"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Description</h3>
            </div>
            <p className="text-gray-700">{course.description}</p>
          </div>

          {/* Career Relevance */}
          {relevance > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold">Career Relevance</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{careerGoal}</span>
                    <span className="text-sm font-bold text-purple-600">{relevance}%</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${relevance}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-700 bg-white/60 p-3 rounded">
                  {relevance >= 90 && (
                    <p><strong>Highly recommended!</strong> This course directly builds core skills for your career path.</p>
                  )}
                  {relevance >= 70 && relevance < 90 && (
                    <p><strong>Great choice!</strong> This course provides valuable knowledge for your career goals.</p>
                  )}
                  {relevance >= 50 && relevance < 70 && (
                    <p><strong>Good option.</strong> This course offers relevant complementary skills.</p>
                  )}
                  {relevance < 50 && (
                    <p>This course provides foundational knowledge that may indirectly support your goals.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Skills */}
          {course.skills && course.skills.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold">Skills You'll Gain</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {course.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Prerequisites */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold">Prerequisites</h3>
              </div>
              <div className="space-y-1">
                {course.prerequisites.map((prereq) => (
                  <Badge key={prereq} variant="outline" className="mr-2">
                    {prereq}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                You must complete these courses before enrolling
              </p>
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="font-semibold capitalize">{course.category.replace('-', ' ')}</p>
            </div>
            {course.typicalSemester && (
              <div>
                <p className="text-sm text-gray-600">Typical Semester</p>
                <p className="font-semibold">Semester {course.typicalSemester}</p>
              </div>
            )}
          </div>

          {/* AI Insight */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-indigo-900 mb-1">AI Recommendation</p>
                <p className="text-sm text-indigo-800">
                  {relevance >= 80 ? (
                    <>This course is essential for breaking into {careerGoal}. The skills taught here ({course.skills?.slice(0, 2).join(', ')}) appear frequently in job postings and will strengthen your portfolio.</>
                  ) : relevance >= 60 ? (
                    <>Consider taking this course to broaden your skill set. While not a direct requirement for {careerGoal}, the knowledge of {course.skills?.[0]} can set you apart from other candidates.</>
                  ) : (
                    <>This course fulfills degree requirements and provides foundational knowledge. While not directly aligned with {careerGoal}, it contributes to a well-rounded education.</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-6">
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
