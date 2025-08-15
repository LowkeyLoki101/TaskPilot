import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Plus, Clock, User, Calendar as CalendarIcon, X, ChevronRight } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assigneeId?: string;
  parentId?: string;
  createdAt: string;
}

interface TaskListViewProps {
  projectId: string;
  onTaskSelect: (taskId: string) => void;
  onAddTask: () => void;
}

export default function TaskListView({ projectId, onTaskSelect, onAddTask }: TaskListViewProps) {
  const { data: tasks = [], isLoading, refetch } = useQuery<Task[]>({
    queryKey: [`/api/projects/${projectId}/tasks`],
  });

  const toggleTaskComplete = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
      console.log('Toggling task:', taskId, 'from', currentStatus, 'to', newStatus);
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        console.log('Task update successful, refetching...');
        await refetch();
      } else {
        console.error('Task update failed:', response.status, response.statusText);
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

  // Group tasks hierarchically
  const mainTasks = tasks.filter(task => !task.parentId);
  const subtasks = tasks.filter(task => task.parentId);
  
  // Helper function to get subtasks for a parent
  const getSubtasks = (parentId: string) => subtasks.filter(sub => sub.parentId === parentId);
  
  // Group by status
  const todoTasks = mainTasks.filter(task => task.status === 'todo');
  const inProgressTasks = mainTasks.filter(task => task.status === 'in_progress');
  const completedTasks = mainTasks.filter(task => task.status === 'completed');

  const getPriorityColor = (priority: string): "destructive" | "default" | "secondary" | "outline" => {
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

  // Component to render a task with its subtasks
  const TaskWithSubtasks = ({ task, subtasks, onTaskSelect, toggleTaskComplete, deleteTask, getPriorityColor, formatDate }: {
    task: Task,
    subtasks: Task[],
    onTaskSelect: (id: string) => void,
    toggleTaskComplete: (id: string, status: string) => void,
    deleteTask: (id: string) => void,
    getPriorityColor: (priority: string) => "destructive" | "default" | "secondary" | "outline",
    formatDate: (date: string) => string
  }) => {
    const [expanded, setExpanded] = useState(true);
    
    return (
      <div className="border rounded-lg bg-background">
        {/* Main Task */}
        <div 
          className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
          onClick={() => onTaskSelect(task.id)}
          data-testid={`task-item-${task.id}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Checkbox clicked for task:', task.id, 'current status:', task.status);
                  toggleTaskComplete(task.id, task.status);
                }}
                className="w-8 h-8 border-2 border-primary rounded-md flex-shrink-0 hover:bg-primary/20 transition-all duration-200 flex items-center justify-center bg-background cursor-pointer"
                style={{ minWidth: '32px', minHeight: '32px' }}
                data-testid={`task-checkbox-${task.id}`}
              >
                {task.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-primary" />
                ) : (
                  <div className="w-4 h-4 border-2 border-muted-foreground rounded-sm bg-background"></div>
                )}
              </button>
              
              {subtasks.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                  }}
                  className="w-6 h-6 hover:bg-muted rounded transition-colors"
                >
                  <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                </button>
              )}
              
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
                  {task.assigneeId && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      {task.assigneeId}
                    </div>
                  )}
                  {subtasks.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {subtasks.filter(s => s.status === 'completed').length}/{subtasks.length} subtasks completed
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
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Subtasks */}
        {expanded && subtasks.length > 0 && (
          <div className="border-t bg-muted/20">
            {subtasks.map((subtask) => (
              <div 
                key={subtask.id}
                className="p-3 pl-16 hover:bg-muted/50 cursor-pointer transition-colors border-l-2 border-muted ml-6"
                onClick={() => onTaskSelect(subtask.id)}
                data-testid={`subtask-item-${subtask.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskComplete(subtask.id, subtask.status);
                      }}
                      className="w-6 h-6 border-2 border-primary rounded flex-shrink-0 hover:bg-primary/20 transition-all duration-200 flex items-center justify-center bg-background cursor-pointer"
                      data-testid={`subtask-checkbox-${subtask.id}`}
                    >
                      {subtask.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      ) : (
                        <div className="w-3 h-3 border border-muted-foreground rounded-sm bg-background"></div>
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-sm truncate">{subtask.title}</h5>
                      {subtask.description && (
                        <p className="text-xs text-muted-foreground truncate">{subtask.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(subtask.priority)} className="text-xs">
                      {subtask.priority}
                    </Badge>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(subtask.id);
                      }}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      data-testid={`subtask-delete-${subtask.id}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
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
              {todoTasks.length + inProgressTasks.length} pending
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
          {/* To-Do Tasks */}
          {todoTasks.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                To-Do ({todoTasks.length})
              </h4>
              {todoTasks.map((task) => (
                <TaskWithSubtasks key={task.id} task={task} subtasks={getSubtasks(task.id)} onTaskSelect={onTaskSelect} toggleTaskComplete={toggleTaskComplete} deleteTask={deleteTask} getPriorityColor={getPriorityColor} formatDate={formatDate} />
              ))}
            </div>
          )}

          {/* In Progress Tasks */}
          {inProgressTasks.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                In Progress ({inProgressTasks.length})
              </h4>
              {inProgressTasks.map((task) => (
                <TaskWithSubtasks key={task.id} task={task} subtasks={getSubtasks(task.id)} onTaskSelect={onTaskSelect} toggleTaskComplete={toggleTaskComplete} deleteTask={deleteTask} getPriorityColor={getPriorityColor} formatDate={formatDate} />
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
                <TaskWithSubtasks key={task.id} task={task} subtasks={getSubtasks(task.id)} onTaskSelect={onTaskSelect} toggleTaskComplete={toggleTaskComplete} deleteTask={deleteTask} getPriorityColor={getPriorityColor} formatDate={formatDate} />
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