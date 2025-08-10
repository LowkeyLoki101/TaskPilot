import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIControlPanel } from "@/components/AIControlPanel";
import { 
  Brain, 
  Settings, 
  Activity, 
  Users, 
  Calendar,
  FileText,
  Link,
  Zap,
  CheckCircle2,
  Clock,
  User,
  Tag,
  AlertCircle
} from "lucide-react";

interface InspectorPaneProps {
  selectedTaskId?: string | null;
  className?: string;
}

export function InspectorPane({ selectedTaskId, className }: InspectorPaneProps) {
  const [activeTab, setActiveTab] = useState("ai");

  // Mock data for demonstration
  const selectedTask = selectedTaskId ? {
    id: selectedTaskId,
    title: "Design new landing page",
    description: "Create a modern, responsive landing page for the new product launch",
    status: "in-progress",
    priority: "high",
    assignee: "Sarah Chen",
    dueDate: "2025-08-15",
    progress: 65,
    tags: ["design", "frontend", "urgent"],
    attachments: [
      { name: "wireframes.figma", type: "design", size: "2.4 MB" },
      { name: "brand-guidelines.pdf", type: "document", size: "1.8 MB" }
    ],
    comments: [
      { author: "John Doe", content: "Looks great so far!", time: "2 hours ago" },
      { author: "Sarah Chen", content: "Working on mobile responsiveness", time: "1 hour ago" }
    ],
    subtasks: [
      { title: "Create wireframes", completed: true },
      { title: "Design desktop layout", completed: true },
      { title: "Design mobile layout", completed: false },
      { title: "Add interactions", completed: false }
    ]
  } : null;

  const agentActivity = [
    { action: "Created 3 tasks from voice input", time: "5 minutes ago", status: "success" },
    { action: "Sent email notification to team", time: "15 minutes ago", status: "success" },
    { action: "Updated project timeline", time: "30 minutes ago", status: "success" },
    { action: "Searched web for design inspiration", time: "1 hour ago", status: "success" }
  ];

  const teamActivity = [
    { user: "Sarah Chen", action: "Updated task status", time: "10 minutes ago" },
    { user: "John Doe", action: "Added comment", time: "25 minutes ago" },
    { user: "Mike Wilson", action: "Completed task", time: "1 hour ago" }
  ];

  return (
    <div className={`flex flex-col h-full bg-card border-l border-border ${className}`} data-testid="inspector-pane">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm">Inspector</h3>
        <p className="text-xs text-muted-foreground">Task details and AI controls</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 pt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ai" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              AI
            </TabsTrigger>
            <TabsTrigger value="task" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Task
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs">
              <Activity className="h-3 w-3 mr-1" />
              Activity
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="ai" className="h-full mt-0 p-4">
            <AIControlPanel />
          </TabsContent>

          <TabsContent value="task" className="h-full mt-0">
            <ScrollArea className="h-full p-4">
              {selectedTask ? (
                <div className="space-y-4">
                  {/* Task Header */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm leading-tight">{selectedTask.title}</h4>
                    <p className="text-xs text-muted-foreground">{selectedTask.description}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      <Badge variant={selectedTask.priority === "high" ? "destructive" : "default"} className="text-xs">
                        {selectedTask.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {selectedTask.status}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Task Meta */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Assignee:</span>
                      <span className="font-medium">{selectedTask.assignee}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Due:</span>
                      <span className="font-medium">{new Date(selectedTask.dueDate).toLocaleDateString()}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{selectedTask.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div 
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${selectedTask.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Tags */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Tag className="h-3 w-3" />
                      Tags
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedTask.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Subtasks */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Subtasks</span>
                      <span className="text-xs text-muted-foreground">
                        {selectedTask.subtasks.filter(s => s.completed).length}/{selectedTask.subtasks.length}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {selectedTask.subtasks.map((subtask, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {subtask.completed ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : (
                            <div className="h-3 w-3 rounded-full border border-muted-foreground" />
                          )}
                          <span className={`text-xs ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {subtask.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Attachments */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Link className="h-3 w-3" />
                      Attachments ({selectedTask.attachments.length})
                    </div>
                    <div className="space-y-1">
                      {selectedTask.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
                          <span className="font-medium truncate">{file.name}</span>
                          <span className="text-muted-foreground">{file.size}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a task to view details</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="activity" className="h-full mt-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {/* Agent Activity */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <Zap className="h-3 w-3 text-primary" />
                    AI Agent Activity
                  </div>
                  <div className="space-y-2">
                    {agentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-muted/30 rounded text-xs">
                        <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Team Activity */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <Users className="h-3 w-3 text-blue-600" />
                    Team Activity
                  </div>
                  <div className="space-y-2">
                    {teamActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-muted/30 rounded text-xs">
                        <User className="h-3 w-3 text-blue-600 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p><span className="font-medium">{activity.user}</span> {activity.action}</p>
                          <p className="text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}