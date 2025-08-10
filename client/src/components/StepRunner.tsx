import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  CheckCircle2, 
  Circle, 
  Phone, 
  Mail, 
  MessageSquare, 
  FileText, 
  Link, 
  Calendar,
  Clock,
  User,
  Tag,
  ExternalLink
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  assignee?: string;
  tags: string[];
  steps: TaskStep[];
  attachments?: Attachment[];
}

interface TaskStep {
  id: string;
  title: string;
  completed: boolean;
  actionType?: "call" | "email" | "text" | "document" | "link";
  actionData?: {
    phone?: string;
    email?: string;
    url?: string;
    message?: string;
  };
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
}

interface StepRunnerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onStepComplete: (taskId: string, stepId: string) => void;
  onTaskComplete: (taskId: string) => void;
}

export function StepRunner({ task, isOpen, onClose, onStepComplete, onTaskComplete }: StepRunnerProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  if (!task) return null;

  const handleStepToggle = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
    onStepComplete(task.id, stepId);
  };

  const handleQuickAction = (step: TaskStep) => {
    if (!step.actionData) return;

    switch (step.actionType) {
      case "call":
        if (step.actionData.phone) {
          window.open(`tel:${step.actionData.phone}`);
        }
        break;
      case "email":
        if (step.actionData.email) {
          window.open(`mailto:${step.actionData.email}${step.actionData.message ? `?body=${encodeURIComponent(step.actionData.message)}` : ''}`);
        }
        break;
      case "text":
        if (step.actionData.phone) {
          window.open(`sms:${step.actionData.phone}${step.actionData.message ? `?body=${encodeURIComponent(step.actionData.message)}` : ''}`);
        }
        break;
      case "link":
        if (step.actionData.url) {
          window.open(step.actionData.url, '_blank');
        }
        break;
      case "document":
        if (step.actionData.url) {
          window.open(step.actionData.url, '_blank');
        }
        break;
    }
    
    // Auto-complete step after action
    handleStepToggle(step.id);
  };

  const getActionIcon = (actionType?: string) => {
    switch (actionType) {
      case "call": return <Phone className="h-4 w-4" />;
      case "email": return <Mail className="h-4 w-4" />;
      case "text": return <MessageSquare className="h-4 w-4" />;
      case "document": return <FileText className="h-4 w-4" />;
      case "link": return <ExternalLink className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "medium": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "low": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const completedCount = task.steps.filter(step => completedSteps.has(step.id) || step.completed).length;
  const totalSteps = task.steps.length;
  const isTaskComplete = completedCount === totalSteps;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0" data-testid="sheet-step-runner">
        <div className="h-full flex flex-col">
          {/* Header */}
          <SheetHeader className="p-6 pb-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <SheetTitle className="text-left text-lg leading-tight">
                    {task.title}
                  </SheetTitle>
                  {task.description && (
                    <SheetDescription className="text-left mt-2">
                      {task.description}
                    </SheetDescription>
                  )}
                </div>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </div>

              {/* Task Meta */}
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                {task.dueDate && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
                {task.assignee && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{task.assignee}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{completedCount}/{totalSteps} steps</span>
                </div>
              </div>

              {/* Tags */}
              {task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </SheetHeader>

          <Separator />

          {/* Steps */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {task.steps.map((step, index) => {
              const isCompleted = completedSteps.has(step.id) || step.completed;
              return (
                <Card 
                  key={step.id} 
                  className={`${isCompleted ? 'bg-muted/50' : 'bg-card'} border transition-all`}
                  data-testid={`step-${step.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 mt-0.5"
                        onClick={() => handleStepToggle(step.id)}
                        data-testid={`button-toggle-step-${step.id}`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </Button>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                          {step.title}
                        </p>
                        
                        {step.actionType && step.actionData && !isCompleted && (
                          <Button
                            onClick={() => handleQuickAction(step)}
                            variant="outline"
                            size="sm"
                            className="mt-2 h-8"
                            data-testid={`button-action-${step.id}`}
                          >
                            {getActionIcon(step.actionType)}
                            <span className="ml-2 capitalize">
                              {step.actionType === "text" ? "Message" : step.actionType}
                            </span>
                          </Button>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground font-mono">
                        {index + 1}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Complete Task Button */}
          {isTaskComplete && (
            <>
              <Separator />
              <div className="p-6">
                <Button 
                  onClick={() => onTaskComplete(task.id)}
                  className="w-full bg-green-600 hover:bg-green-700"
                  data-testid="button-complete-task"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Task Complete
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}