import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Target, 
  Brain, 
  CheckCircle2, 
  Circle,
  Settings,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  x: number;
  y: number;
}

interface SimpleMindMapProps {
  projectId: string;
  className?: string;
}

export function SimpleMindMap({ projectId, className }: SimpleMindMapProps) {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Get Started', completed: true, x: -200, y: -100 },
    { id: '2', title: 'Create First Task', completed: false, x: 200, y: -100 },
    { id: '3', title: 'Add Team Members', completed: false, x: -200, y: 100 },
    { id: '4', title: 'Launch Project', completed: false, x: 200, y: 100 },
  ]);
  
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const addNewTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: 'New Task',
      completed: false,
      x: Math.random() * 300 - 150,
      y: Math.random() * 200 - 100,
    };
    setTasks([...tasks, newTask]);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  return (
    <div className={cn("h-full flex flex-col bg-gradient-to-br from-background to-muted/10", className)}>
      {/* Header */}
      <div className="p-6 border-b border-border bg-background/95">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Project Mind Map</h2>
            <p className="text-muted-foreground">
              Click on tasks to complete them • Add new tasks to expand your project
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-sm">
              {completedCount}/{totalCount} Complete
            </Badge>
            <Button 
              onClick={addNewTask}
              className="bg-primary hover:bg-primary/90"
              data-testid="add-task-mindmap"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* Mind Map Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          
          {/* Central Project Node */}
          <div className="relative z-10">
            <Card className="w-56 h-40 border-2 border-primary shadow-2xl bg-gradient-to-br from-primary/20 to-primary/5 hover:shadow-3xl transition-all cursor-pointer transform hover:scale-105">
              <CardContent className="p-6 text-center">
                <Target className="h-10 w-10 mx-auto mb-3 text-primary" />
                <h3 className="font-bold text-xl mb-2">Your Project</h3>
                <p className="text-sm text-muted-foreground">
                  {completedCount === totalCount ? '🎉 All Complete!' : 'Click tasks to progress'}
                </p>
                <div className="mt-3 bg-muted/50 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Task Nodes */}
            {tasks.map((task) => (
              <div
                key={task.id}
                className="absolute"
                style={{
                  left: task.x,
                  top: task.y,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <Card 
                  className={cn(
                    "w-40 h-28 cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:scale-105",
                    task.completed 
                      ? "border-green-500/50 bg-green-50 dark:bg-green-950/30" 
                      : "border-muted-foreground/30 hover:border-primary/50",
                    selectedTask === task.id && "ring-2 ring-primary"
                  )}
                  onClick={() => {
                    setSelectedTask(task.id);
                    toggleTask(task.id);
                  }}
                  data-testid={`task-node-${task.id}`}
                >
                  <CardContent className="p-4 text-center">
                    <div className="mb-2">
                      {task.completed ? (
                        <CheckCircle2 className="h-6 w-6 mx-auto text-green-600" />
                      ) : (
                        <Circle className="h-6 w-6 mx-auto text-muted-foreground" />
                      )}
                    </div>
                    <p className={cn(
                      "text-sm font-medium",
                      task.completed && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                    </p>
                  </CardContent>
                </Card>

                {/* Connection line to center */}
                <svg 
                  className="absolute pointer-events-none"
                  style={{
                    left: task.x > 0 ? -task.x : 0,
                    top: task.y > 0 ? -task.y : 0,
                    width: Math.abs(task.x) + 140,
                    height: Math.abs(task.y) + 70,
                    zIndex: -1
                  }}
                >
                  <line
                    x1={task.x > 0 ? Math.abs(task.x) : Math.abs(task.x)}
                    y1={task.y > 0 ? Math.abs(task.y) : Math.abs(task.y)}
                    x2={task.x > 0 ? 0 : Math.abs(task.x)}
                    y2={task.y > 0 ? 0 : Math.abs(task.y)}
                    stroke={task.completed ? "rgb(34 197 94)" : "rgb(156 163 175)"}
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    opacity="0.6"
                  />
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Help */}
        <div className="absolute bottom-4 right-4 max-w-sm">
          <Card className="bg-background/95 backdrop-blur border">
            <CardContent className="p-4">
              <div className="flex items-start space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1">Quick Tips:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Click any task circle to complete it</li>
                    <li>• Use "Add Task" to create new tasks</li>
                    <li>• Watch the progress bar fill up!</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant Floating Button */}
        <div className="absolute top-4 right-4">
          <Button 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
            onClick={() => {
              // This could trigger the AI to suggest tasks or analyze the project
              console.log('AI assistance requested for project analysis');
            }}
          >
            <Brain className="h-4 w-4 mr-2" />
            Ask AI
          </Button>
        </div>
      </div>
    </div>
  );
}