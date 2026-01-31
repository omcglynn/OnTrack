import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  AlertTriangle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { GeneratedSchedule, ScheduledCourse } from '@/app/utils/schedule-generator';
import { Course } from '@/app/data/mock-courses';

interface SchedulePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  generatedSchedule: GeneratedSchedule | null;
  reasoning?: string;
  availableSemesters: { index: number; name: string; isEmpty: boolean }[];
  onApplySchedule: (semesterIndex: number, courses: ScheduledCourse[]) => void;
  onCourseClick?: (course: Course) => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

// Course colors matching the main calendar
const COURSE_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f97316', // orange
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#eab308', // yellow
  '#ef4444', // red
];

// Height per hour slot in pixels - match the main calendar
const SLOT_HEIGHT = 60;

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function getClassPosition(startTime: string, endTime: string) {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const dayStartMinutes = timeToMinutes('08:00');
  
  const topPosition = ((startMinutes - dayStartMinutes) / 60) * SLOT_HEIGHT;
  const height = ((endMinutes - startMinutes) / 60) * SLOT_HEIGHT;
  
  return { top: topPosition, height: Math.max(height, 46) };
}

export function SchedulePreviewModal({
  open,
  onOpenChange,
  generatedSchedule,
  reasoning,
  availableSemesters,
  onApplySchedule,
  onCourseClick,
}: SchedulePreviewModalProps) {
  const [selectedSemester, setSelectedSemester] = useState<string>('');

  if (!generatedSchedule) return null;

  const { courses, totalCredits, warnings } = generatedSchedule;

  const handleApply = () => {
    if (!selectedSemester) return;
    const semesterIndex = parseInt(selectedSemester, 10);
    onApplySchedule(semesterIndex, courses);
    onOpenChange(false);
  };

  // Group courses by day for rendering
  const getCoursesByDay = (day: string) => {
    return courses.filter(sc => sc.schedule.days.includes(day));
  };

  const handleCourseClick = (course: Course) => {
    if (onCourseClick) {
      onCourseClick(course);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[1400px] w-[95vw] max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-6 h-6 text-purple-600" />
            AI Generated Schedule
          </DialogTitle>
          <DialogDescription>
            Review the recommended schedule and apply it to a semester
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
          <div className="space-y-4 pb-4">
            {/* Top Section: Reasoning + Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Reasoning */}
              {reasoning && (
                <Card className="p-4 bg-purple-50 border-purple-200 lg:col-span-2">
                  <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    AI Reasoning
                  </h4>
                  <p className="text-sm text-purple-700 leading-relaxed">{reasoning}</p>
                </Card>
              )}

              {/* Summary Stats */}
              <div className={`grid grid-cols-3 gap-3 ${reasoning ? '' : 'lg:col-span-3'}`}>
                <Card className="p-4 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-blue-600">{courses.length}</div>
                  <div className="text-xs text-gray-500 mt-1">Courses</div>
                </Card>
                <Card className="p-4 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-green-600">{totalCredits}</div>
                  <div className="text-xs text-gray-500 mt-1">Credits</div>
                </Card>
                <Card className="p-4 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {courses.length > 0 ? (Math.round(courses.reduce((sum, c) => sum + (c.course.difficulty || 3), 0) / courses.length * 10) / 10) : 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Avg Difficulty</div>
                </Card>
              </div>
            </div>

            {/* Warnings */}
            {warnings.length > 0 && (
              <Card className="p-4 bg-yellow-50 border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Warnings
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {warnings.map((warning, i) => (
                    <li key={i}>• {warning}</li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Weekly Schedule Grid - Matching main calendar style */}
            <Card className="p-4">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Weekly Schedule
                <span className="text-xs font-normal text-gray-500 ml-2">(Click a course to view details)</span>
              </h4>
              
              <div className="border rounded-lg">
                {/* Day Headers */}
                <div className="grid grid-cols-[60px_repeat(5,1fr)] bg-gray-50 border-b">
                  <div className="p-2 text-center text-xs font-medium text-gray-500 border-r">
                    Time
                  </div>
                  {DAYS.map((day, i) => (
                    <div 
                      key={day} 
                      className={`p-2 text-center text-sm font-semibold text-gray-700 ${i < DAYS.length - 1 ? 'border-r' : ''}`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Time Grid */}
                <div className="grid grid-cols-[60px_repeat(5,1fr)]">
                  {/* Time Labels */}
                  <div className="border-r">
                    {TIME_SLOTS.map((time) => (
                      <div 
                        key={time} 
                        className="border-b text-xs text-gray-500 text-right pr-2 flex items-start justify-end"
                        style={{ height: `${SLOT_HEIGHT}px` }}
                      >
                        <span className="pt-1">{time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Day Columns */}
                  {DAYS.map((day, dayIndex) => (
                    <div 
                      key={day} 
                      className={`relative ${dayIndex < DAYS.length - 1 ? 'border-r' : ''}`}
                      style={{ height: `${TIME_SLOTS.length * SLOT_HEIGHT}px` }}
                    >
                      {/* Hour grid lines */}
                      {TIME_SLOTS.map((time, i) => (
                        <div 
                          key={time}
                          className="absolute left-0 right-0 border-b border-gray-100"
                          style={{ top: `${i * SLOT_HEIGHT}px`, height: `${SLOT_HEIGHT}px` }}
                        />
                      ))}

                      {/* Course blocks */}
                      {getCoursesByDay(day).map((sc) => {
                        const colorIndex = courses.indexOf(sc) % COURSE_COLORS.length;
                        const { top, height } = getClassPosition(sc.schedule.startTime, sc.schedule.endTime);
                        const isCompact = height < 70;

                        return (
                          <div
                            key={`${sc.course.code}-${day}`}
                            className="absolute left-1 right-1 rounded-md shadow-sm z-10 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all"
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                              backgroundColor: COURSE_COLORS[colorIndex],
                            }}
                            onClick={() => handleCourseClick(sc.course)}
                            title={`Click to view ${sc.course.code} details`}
                          >
                            <div className="text-white p-2 h-full flex flex-col overflow-hidden">
                              <div className="font-bold text-xs leading-tight truncate">{sc.course.code}</div>
                              {!isCompact && (
                                <>
                                  <div className="text-[10px] opacity-90 truncate">{sc.schedule.location}</div>
                                  <div className="text-[10px] opacity-75 truncate mt-auto">
                                    {sc.schedule.startTime}-{sc.schedule.endTime}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Course Details */}
            <Card className="p-4">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Course Details
                <span className="text-xs font-normal text-gray-500 ml-2">(Click for full details)</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {courses.map((sc, index) => {
                  const colorIndex = index % COURSE_COLORS.length;
                  return (
                    <div 
                      key={sc.course.code}
                      className="p-3 rounded-lg border bg-white cursor-pointer hover:shadow-md hover:border-gray-300 transition-all"
                      style={{ borderLeftWidth: '4px', borderLeftColor: COURSE_COLORS[colorIndex] }}
                      onClick={() => handleCourseClick(sc.course)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-semibold text-gray-900">{sc.course.code}</span>
                          <span className="mx-2 text-gray-400">-</span>
                          <span className="text-gray-700">{sc.course.name}</span>
                        </div>
                        <Badge variant="secondary" className="ml-2 flex-shrink-0">{sc.course.credits} cr</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {sc.schedule.startTime} - {sc.schedule.endTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {sc.schedule.days.join(', ')}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {sc.schedule.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-400" />
                          {sc.schedule.professor}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex-shrink-0 px-6 py-4 border-t bg-gray-50 flex-row justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Apply to semester:</span>
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                {availableSemesters.map(sem => (
                  <SelectItem 
                    key={sem.index} 
                    value={sem.index.toString()}
                  >
                    <span className="flex items-center gap-2">
                      {sem.name}
                      {sem.isEmpty && (
                        <Badge variant="outline" className="text-xs">Empty</Badge>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApply}
              disabled={!selectedSemester}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Apply Schedule
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
