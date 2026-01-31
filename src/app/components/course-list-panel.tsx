import { useState } from 'react';
import { Course, COURSES } from '@/app/data/mock-courses';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Card } from '@/app/components/ui/card';
import { Search, BookOpen, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface CourseListPanelProps {
  onCourseClick?: (course: Course) => void;
  careerGoal?: string;
}

export function CourseListPanel({ onCourseClick, careerGoal }: CourseListPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter courses
  const filteredCourses = COURSES.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get career relevance score for a course
  const getRelevanceScore = (course: Course) => {
    if (!careerGoal || !course.careerRelevance) return 0;
    return course.careerRelevance[careerGoal] || 0;
  };

  // Sort by relevance if career goal is set
  const sortedCourses = careerGoal 
    ? [...filteredCourses].sort((a, b) => getRelevanceScore(b) - getRelevanceScore(a))
    : filteredCourses;

  const categories = [
    { id: 'all', label: 'All Courses', count: COURSES.length },
    { id: 'major', label: 'Major', count: COURSES.filter(c => c.category === 'major').length },
    { id: 'core', label: 'Core', count: COURSES.filter(c => c.category === 'core').length },
    { id: 'elective', label: 'Elective', count: COURSES.filter(c => c.category === 'elective').length },
    { id: 'gen-ed', label: 'Gen Ed', count: COURSES.filter(c => c.category === 'gen-ed').length },
  ];

  return (
    <div className="w-80 bg-white border-r shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <h2 className="font-bold text-lg">Course Catalog</h2>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="p-4 border-b">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="text-xs"
            >
              {cat.label} ({cat.count})
            </Button>
          ))}
        </div>
      </div>

      {/* Course List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {sortedCourses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No courses found</p>
            </div>
          ) : (
            sortedCourses.map((course) => {
              const relevanceScore = getRelevanceScore(course);
              const isHighRelevance = relevanceScore >= 80;
              
              return (
                <Card
                  key={course.id}
                  className="p-3 hover:shadow-md transition-shadow cursor-pointer border-l-4"
                  style={{
                    borderLeftColor: 
                      course.category === 'major' ? '#9333ea' :
                      course.category === 'core' ? '#3b82f6' :
                      course.category === 'elective' ? '#10b981' :
                      '#6b7280'
                  }}
                  onClick={() => onCourseClick?.(course)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-semibold text-gray-600">
                          {course.code}
                        </span>
                        {isHighRelevance && careerGoal && (
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <h3 className="font-semibold text-sm leading-tight mb-1">
                        {course.name}
                      </h3>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="text-xs ml-2"
                    >
                      {course.credits} cr
                    </Badge>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="outline" 
                      className="text-xs capitalize"
                    >
                      {course.category}
                    </Badge>
                    
                    {careerGoal && relevanceScore > 0 && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className={`w-3 h-3 ${isHighRelevance ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className={`text-xs font-semibold ${isHighRelevance ? 'text-green-600' : 'text-gray-500'}`}>
                          {relevanceScore}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Difficulty indicator */}
                  {course.difficulty && (
                    <div className="mt-2 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-1 rounded ${
                            i < course.difficulty! ? 'bg-purple-600' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">
                        Level {course.difficulty}
                      </span>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="text-xs text-gray-600 text-center">
          Showing {sortedCourses.length} of {COURSES.length} courses
        </div>
      </div>
    </div>
  );
}
