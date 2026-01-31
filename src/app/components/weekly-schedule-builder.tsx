import { useState, useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Course } from '@/app/data/mock-courses';
import { SemesterPlan } from './roadmap-view';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Calendar, Download, RefreshCw, GripVertical } from 'lucide-react';

interface ClassSchedule {
  id: string;
  course: Course;
  days: string[];
  startTime: string;
  endTime: string;
  location?: string;
  professor?: string;
  classType?: 'Lecture' | 'Lab' | 'Seminar' | 'Discussion';
}

interface WeeklyScheduleBuilderProps {
  nextSemester: SemesterPlan;
  careerGoal: string;
  onCourseClick?: (course: Course) => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const ItemTypes = {
  COURSE: 'course',
};

// Mock schedule data - in real app this would be generated
const generateMockSchedule = (courses: Course[]): ClassSchedule[] => {
  const schedules: ClassSchedule[] = [];
  const timeSlots = ['09:00', '10:30', '12:00', '14:00', '15:30'];
  const professors = ['Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson'];
  const classTypes: Array<'Lecture' | 'Lab' | 'Seminar' | 'Discussion'> = ['Lecture', 'Lab', 'Seminar', 'Discussion'];
  
  courses.forEach((course, idx) => {
    const startTime = timeSlots[idx % timeSlots.length];
    const startHour = parseInt(startTime.split(':')[0]);
    const endTime = `${String(startHour + 1).padStart(2, '0')}:30`;
    
    schedules.push({
      id: `sched-${course.code}-${idx}`,
      course,
      days: idx % 2 === 0 ? ['Mon', 'Wed', 'Fri'] : ['Tue', 'Thu'],
      startTime,
      endTime,
      location: `SERC ${100 + idx * 10}`,
      professor: `Prof. ${professors[idx % professors.length]}`,
      classType: classTypes[idx % classTypes.length],
    });
  });
  
  return schedules;
};

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function getClassPosition(startTime: string, endTime: string) {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const dayStartMinutes = timeToMinutes('08:00');
  
  const topPosition = ((startMinutes - dayStartMinutes) / 60) * 80;
  const height = ((endMinutes - startMinutes) / 60) * 80;
  
  return { top: topPosition, height };
}

interface DraggableCourseProps {
  classSchedule: ClassSchedule;
  day: string;
  color: string;
  onCourseClick?: (course: Course) => void;
}

const DraggableCourse = ({ classSchedule, day, color, onCourseClick }: DraggableCourseProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.COURSE,
    item: { id: classSchedule.id, originalDay: day },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const { top, height } = getClassPosition(classSchedule.startTime, classSchedule.endTime);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCourseClick?.(classSchedule.course);
  };

  return (
    <div
      ref={drag as any}
      onClick={handleClick}
      className={`absolute left-1 right-1 rounded-md p-2 shadow-sm cursor-pointer hover:shadow-lg transition-all z-10 ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } hover:scale-[1.02]`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: color,
        minHeight: '60px',
      }}
    >
      <div className="text-white text-[10px] sm:text-xs leading-tight">
        <div className="flex items-center justify-between gap-1">
          <div className="font-bold truncate">{classSchedule.course.code}</div>
          <GripVertical className="w-3 h-3 opacity-50 flex-shrink-0" />
        </div>
        <div className="opacity-90 truncate">{classSchedule.course.name}</div>
        <div className="opacity-90 mt-1">
          {classSchedule.startTime} - {classSchedule.endTime}
        </div>
        <div className="opacity-80 text-[9px] sm:text-[10px] mt-1">
          {classSchedule.location}
        </div>
      </div>
    </div>
  );
};

export function WeeklyScheduleBuilder({ nextSemester, careerGoal, onCourseClick }: WeeklyScheduleBuilderProps) {
  const [schedule, setSchedule] = useState<ClassSchedule[]>(
    generateMockSchedule(nextSemester.courses)
  );

  const moveCourse = useCallback((courseId: string, toDay: string) => {
    setSchedule((prevSchedule) => {
      return prevSchedule.map((item) => {
        if (item.id === courseId) {
          // If the day is already in the list, we might want to toggle it or replace it
          // For this demo, let's just make it only exist on that day for simplicity of "moving"
          // Or if we want to support multiple days, we'd need more complex logic.
          // Let's assume the user is moving one instance of the class to a different day.
          // Realistically, classes have fixed days, but for a "builder" we'll let them move it.
          const currentDays = [...item.days];
          // Simple logic: if they move a class that was on MWF to Tuesday, it now only exists on Tuesday.
          // This is a "customizable" feature.
          return { ...item, days: [toDay] };
        }
        return item;
      });
    });
  }, []);

  const getClassesForDay = (day: string) => {
    return schedule.filter(s => s.days.includes(day));
  };

  const handleExportCalendar = () => {
    alert('Calendar export feature would integrate with Google Calendar/Outlook');
  };

  const handleRegenerate = () => {
    setSchedule(generateMockSchedule(nextSemester.courses));
  };

  const getRelevanceColor = (course: Course) => {
    const relevance = course.careerRelevance?.[careerGoal] || 0;
    if (relevance >= 90) return '#4f46e5'; // indigo
    if (relevance >= 70) return '#7c3aed'; // purple
    if (relevance >= 50) return '#db2777'; // pink
    return '#64748b'; // slate
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1">
              {nextSemester.season} {nextSemester.year} Schedule
            </h2>
            <p className="text-sm text-gray-600">
              {nextSemester.totalCredits} credits • {nextSemester.courses.length} courses • <span className="text-indigo-600 font-medium">Drag classes to rearrange</span>
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" size="sm" onClick={handleRegenerate} className="gap-2 flex-1 md:flex-none">
              <RefreshCw className="w-4 h-4" />
              Reset
            </Button>
            <Button size="sm" onClick={handleExportCalendar} className="gap-2 flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Weekly Calendar Grid */}
      <Card className="p-2 sm:p-6 bg-white overflow-hidden shadow-xl border-indigo-100">
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header */}
            <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b mb-4">
              <div className="p-2"></div>
              {DAYS.map(day => (
                <div key={day} className="p-2 text-center font-bold text-gray-700">
                  {day}
                </div>
              ))}
            </div>

            {/* Time slots and classes */}
            <div className="grid grid-cols-[80px_repeat(5,1fr)] relative">
              {/* Time column */}
              <div className="border-r border-gray-100">
                {TIME_SLOTS.map((time) => (
                  <div key={time} className="h-20 border-b border-gray-50 flex items-start justify-center pt-1 text-xs font-medium text-gray-400">
                    {time}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {DAYS.map((day) => (
                <DayColumn 
                  key={day} 
                  day={day} 
                  onMoveCourse={moveCourse}
                >
                  {/* Grid lines */}
                  {TIME_SLOTS.map((time) => (
                    <div key={time} className="h-20 border-b border-gray-50"></div>
                  ))}

                  {/* Classes for this day */}
                  {getClassesForDay(day).map((classSchedule) => (
                    <DraggableCourse 
                      key={`${classSchedule.id}-${day}`}
                      classSchedule={classSchedule}
                      day={day}
                      color={getRelevanceColor(classSchedule.course)}
                      onCourseClick={onCourseClick}
                    />
                  ))}
                </DayColumn>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Quick View Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex flex-col items-center justify-center text-center bg-blue-50/50 border-blue-100">
          <span className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Weekly Load</span>
          <span className="text-2xl font-bold text-blue-900">{nextSemester.totalCredits} Credits</span>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center text-center bg-purple-50/50 border-purple-100">
          <span className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-1">Career Match</span>
          <span className="text-2xl font-bold text-purple-900">94%</span>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center text-center bg-pink-50/50 border-pink-100">
          <span className="text-xs text-pink-600 font-bold uppercase tracking-wider mb-1">Study Hours</span>
          <span className="text-2xl font-bold text-pink-900">~25 hrs</span>
        </Card>
      </div>
    </div>
  );
}

interface DayColumnProps {
  day: string;
  onMoveCourse: (id: string, day: string) => void;
  children: React.ReactNode;
}

const DayColumn = ({ day, onMoveCourse, children }: DayColumnProps) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.COURSE,
    drop: (item: { id: string, originalDay: string }) => {
      onMoveCourse(item.id, day);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div 
      ref={drop as any}
      className={`relative border-r border-gray-100 last:border-r-0 transition-colors ${
        isOver ? 'bg-indigo-50/50' : ''
      }`}
    >
      {children}
    </div>
  );
}