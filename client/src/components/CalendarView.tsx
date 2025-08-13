import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Calendar, Plus, Clock } from "lucide-react";

interface CalendarViewProps {
  projectId: string;
  onTaskSelect: (taskId: string) => void;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  createdAt: string;
}

export default function CalendarView({ projectId, onTaskSelect }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Fetch tasks
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/projects", projectId, "tasks"],
  });

  // Get current month/year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();
  
  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Get tasks for a specific date
  const getTasksForDate = (date: number) => {
    const dateStr = new Date(currentYear, currentMonth, date).toISOString().split('T')[0];
    return tasks.filter(task => {
      if (task.dueDate) {
        return task.dueDate.split('T')[0] === dateStr;
      }
      // Also show tasks created on this date if no due date
      return task.createdAt.split('T')[0] === dateStr;
    });
  };
  
  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Generate calendar grid
  const calendarDays = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }
  
  const today = new Date();
  const isToday = (day: number) => {
    return today.getDate() === day && 
           today.getMonth() === currentMonth && 
           today.getFullYear() === currentYear;
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="h-[500px] flex flex-col bg-background overflow-hidden" data-testid="calendar-view">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-2 border-b flex-shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={previousMonth}
              data-testid="button-previous-month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={nextMonth}
              data-testid="button-next-month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToToday}
              data-testid="button-today"
            >
              Today
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            {tasks.length} tasks
          </Badge>
          <Button size="sm" data-testid="button-add-task">
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-2 overflow-hidden">
        <div className="grid grid-cols-7 gap-1 h-full">
          {/* Day headers */}
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground border-b">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="p-1 min-h-[80px]" />;
            }
            
            const dayTasks = getTasksForDate(day);
            const isCurrentDay = isToday(day);
            const uniqueKey = `${currentYear}-${currentMonth}-${day}`;
            
            return (
              <Card 
                key={uniqueKey} 
                className={`p-1 min-h-[80px] ${isCurrentDay ? 'ring-2 ring-primary' : ''}`}
                data-testid={`calendar-day-${day}`}
              >
                <CardHeader className="p-1">
                  <div className={`text-sm font-medium ${isCurrentDay ? 'text-primary' : ''}`}>
                    {day}
                  </div>
                </CardHeader>
                <CardContent className="p-1 space-y-1">
                  {dayTasks.slice(0, 3).map((task, taskIndex) => (
                    <div
                      key={`${uniqueKey}-task-${task.id}-${taskIndex}`}
                      className="text-xs p-1 rounded cursor-pointer hover:bg-muted/50 transition-colors truncate"
                      onClick={() => onTaskSelect(task.id)}
                      data-testid={`task-${task.id}`}
                    >
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                        <span className="truncate">{task.title}</span>
                      </div>
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                          <Clock className="h-2 w-2" />
                          <span>Due</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>


    </div>
  );
}