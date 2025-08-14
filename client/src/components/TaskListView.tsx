import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Plus, Clock, User, Calendar as CalendarIcon, X } from "lucide-react";

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
  onAddTask?: () => void;
}

export function TaskListView({ projectId, onTaskSelect, onAddTask }: TaskListViewProps) {
  const { data: tasks = [], isLoading, refetch } = useQuery<Task[]>({
    queryKey: [`/api/projects/${projectId}/tasks`],
  });

  const toggleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed, status: !completed ? 'completed' : 'todo' })
      });
      
      if (response.ok) {
        await refetch();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await refetch();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const deleteAllTasks = async () => {
    if (!window.confirm('Are you sure you want to delete ALL tasks? This cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`Deleted ${result.deletedCount} tasks`);
        await refetch();
      } else {
        console.error('Failed to delete tasks');
      }
    } catch (error) {
      console.error('Error deleting tasks:', error);
    }
  };

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
            <Button 
              size="sm" 
              variant="destructive"
              onClick={deleteAllTasks}
              data-testid="delete-all-tasks"
            >
              <X className="h-3 w-3 mr-1" />
              Delete All
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onAddTask}
              data-testid="button-add-task"
            >
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskComplete(task.id, task.completed);
                        }}
                        className="w-6 h-6 border-2 border-primary rounded flex-shrink-0 hover:bg-primary/10 transition-colors flex items-center justify-center bg-background"
                        data-testid={`task-checkbox-${task.id}`}
                      >
                        {task.completed ? (
                          <CheckCircle className="w-4 h-4 text-primary fill-current" />
                        ) : (
                          <div className="w-3 h-3 border border-muted-foreground rounded-sm"></div>
                        )}
                      </button>
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
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                        {task.priority}
                      </Badge>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTask(task.id);
                        }}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        data-testid={`task-delete-${task.id}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
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
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors opacity-75"
                  onClick={() => onTaskSelect(task.id)}
                  data-testid={`task-item-${task.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskComplete(task.id, task.completed);
                        }}
                        className="w-6 h-6 border-2 border-primary rounded flex-shrink-0 hover:bg-primary/10 transition-colors flex items-center justify-center bg-primary"
                        data-testid={`task-checkbox-${task.id}`}
                      >
                        <CheckCircle className="w-4 h-4 text-primary-foreground fill-current" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium truncate line-through text-muted-foreground">{task.title}</h4>
                        {task.description && (
                          <p className="text-xs text-muted-foreground truncate line-through">{task.description}</p>
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
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                        {task.priority}
                      </Badge>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTask(task.id);
                        }}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        data-testid={`task-delete-${task.id}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {tasks.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No tasks yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first task to get started with project management.
              </p>
              <Button 
                variant="outline" 
                onClick={onAddTask}
                data-testid="button-add-first-task"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Task
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}