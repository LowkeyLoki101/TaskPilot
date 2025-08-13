import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Plus, Clock, User, Calendar as CalendarIcon } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignee?: string;
  createdAt: string;
}

interface TaskListViewProps {
  projectId: string;
  onTaskSelect: (taskId: string) => void;
}

export function TaskListView({ projectId, onTaskSelect }: TaskListViewProps) {
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: [`/api/projects/${projectId}/tasks`],
  });

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1) return `In ${diffDays} days`;
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-8 w-8 mx-auto mb-2 animate-spin opacity-50" />
          <p className="text-sm text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Task List Header */}
      <div className="p-4 border-b border-border bg-background/95">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Task List</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {pendingTasks.length} pending
            </Badge>
            <Button size="sm" variant="outline" data-testid="button-add-task">
              <Plus className="h-3 w-3 mr-1" />
              Add Task
            </Button>
          </div>
        </div>
      </div>
      
      {/* Task List Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Pending ({pendingTasks.length})
              </h4>
              {pendingTasks.map((task) => (
                <div 
                  key={task.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onTaskSelect(task.id)}
                  data-testid={`task-item-${task.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-4 h-4 border-2 border-primary rounded-sm flex-shrink-0"></div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium truncate">{task.title}</h4>
                        {task.description && (
                          <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <CalendarIcon className="h-3 w-3" />
                              {formatDate(task.dueDate)}
                            </div>
                          )}
                          {task.assignee && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              {task.assignee}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant={getPriorityColor(task.priority)} className="text-xs ml-2">
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Completed ({completedTasks.length})
              </h4>
              {completedTasks.map((task) => (
                <div 
                  key={task.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors bg-muted/30"
                  onClick={() => onTaskSelect(task.id)}
                  data-testid={`task-item-${task.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium line-through text-muted-foreground truncate">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-through truncate">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          Completed {formatDate(task.createdAt)}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs ml-2">
                      Done
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {tasks.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first task to get started with project management
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Task
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}