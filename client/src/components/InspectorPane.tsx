import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIControlPanel } from "@/components/AIControlPanel";
import { DiagnosticsPanel } from "./DiagnosticsPanel";
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
  AlertCircle,
  Edit,
  Bug,
  Lightbulb
} from "lucide-react";
import { FeatureRequestPanel } from "./FeatureRequestPanel";
import { ChatPane } from "./ChatPane";
import { AgentDashboard } from '@/components/AgentDashboard';

interface InspectorPaneProps {
  selectedTaskId?: string | null;
  currentModule?: 'mindmap' | 'calendar' | 'tasks' | 'browser' | 'diagnostics' | 'agents';
  autonomyMode?: 'manual' | 'semi' | 'full';
  aiActivityLog?: Array<{id: string, action: string, timestamp: Date | string, type: 'task' | 'bug' | 'enhancement' | 'maintenance'}>;
  lastMaintenanceRun?: Date | null;
  onRunMaintenance?: () => void;
  onAutonomyChange?: (mode: 'manual' | 'semi' | 'full') => void;
  projectId: string;
  className?: string;
}

export function InspectorPane({ 
  selectedTaskId, 
  currentModule = 'mindmap',
  autonomyMode = 'manual',
  aiActivityLog = [],
  lastMaintenanceRun,
  onRunMaintenance,
  onAutonomyChange,
  projectId,
  className 
}: InspectorPaneProps) {
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

  // Convert real activity log to display format
  const agentActivity = aiActivityLog
    .slice(0, 20) // Show latest 20 activities - ALL autonomous AI actions
    .map(log => ({
      id: log.id,
      action: log.action,
      time: formatTimeAgo(log.timestamp),
      timestamp: log.timestamp,
      status: "success",
      type: log.type,
      details: log.details
    }));

  // Show user task-related activities
  const teamActivity = aiActivityLog
    .filter(log => log.type === 'task')
    .slice(0, 5) // Show latest 5 activities
    .map(log => ({
      user: "You", // For now, all activities are user activities
      action: log.action,
      time: formatTimeAgo(log.timestamp)
    }));

  // Helper function to format timestamps
  function formatTimeAgo(timestamp: Date | string): string {
    const now = new Date();
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  }

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`} data-testid="inspector-pane">

      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        {/* Tab header */}
        <div className="px-3 py-2 border-b border-border bg-card">
          <TabsList className="w-full overflow-x-auto scrollbar-none whitespace-nowrap">
            <TabsTrigger value="ai" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              AI
            </TabsTrigger>
            <TabsTrigger value="task" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Task
            </TabsTrigger>
            <TabsTrigger value="feature" className="text-xs">
              <Lightbulb className="h-3 w-3 mr-1" />
              Feature
            </TabsTrigger>
            <TabsTrigger value="diagnostics" className="text-xs">
              <Bug className="h-3 w-3 mr-1" />
              Debug
            </TabsTrigger>
            <TabsTrigger value="agents" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Agents
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="ai" className="h-full mt-0">
            <div className="h-full flex flex-col">
              {/* Autonomy Controls */}
              <div className="p-3 border-b border-border bg-muted/30">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium">Autonomy Mode</div>
                    <div className={`w-2 h-2 rounded-full ${autonomyMode === 'full' ? 'bg-green-400 animate-pulse' : autonomyMode === 'semi' ? 'bg-yellow-400' : 'bg-gray-400'}`}></div>
                  </div>
                  <div className="flex gap-1">
                    {(['manual', 'semi', 'full'] as const).map((mode) => (
                      <Button
                        key={mode}
                        variant={autonomyMode === mode ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onAutonomyChange?.(mode)}
                        className="flex-1 h-6 text-xs"
                      >
                        {mode === 'full' ? 'Full' : mode === 'semi' ? 'Semi' : 'Manual'}
                      </Button>
                    ))}
                  </div>
                  {onRunMaintenance && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRunMaintenance}
                      className="w-full h-6 text-xs"
                      disabled={autonomyMode === 'manual'}
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Run Maintenance
                    </Button>
                  )}
                </div>
              </div>
              
              {/* AI Chat Interface - Takes 60% of space */}
              <div className="flex-[2] min-h-0">
                <ChatPane 
                  projectId={projectId}
                  autonomyMode={autonomyMode}
                  className="h-full border-none"
                />
              </div>
              
              {/* AI Activity Feed - Takes 30% of space */}
              <div className="flex-1 border-t border-border bg-muted/20 flex flex-col min-h-0">
                <div className="p-3 space-y-2 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1 text-xs font-medium">
                      <Activity className="h-3 w-3 text-primary animate-pulse" />
                      Complete AI Activity Log
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {agentActivity.length} total
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-5 px-2 text-xs"
                        onClick={() => window.location.reload()}
                      >
                        Refresh
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="space-y-1 pr-2">
                      {agentActivity.length > 0 ? agentActivity.map((activity, index) => {
                        const isRecent = new Date().getTime() - new Date(activity.timestamp).getTime() < 60000; // Less than 1 minute
                        return (
                          <div key={activity.id || index} className={`flex items-start gap-2 p-3 rounded-lg text-xs transition-all border ${
                            isRecent ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-background/50 border-border/50'
                          } hover:bg-background/80`}>
                            <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                              activity.type === 'maintenance' ? 'bg-blue-500' :
                              activity.type === 'ai_response' ? 'bg-green-500' :
                              activity.type === 'system' ? 'bg-purple-500' :
                              activity.type === 'enhancement' ? 'bg-green-500' : 'bg-gray-500'
                            } ${isRecent ? 'animate-pulse' : ''}`} />
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-semibold leading-tight text-foreground">{activity.action}</p>
                                <Badge variant="outline" className="text-[10px] shrink-0">
                                  {activity.type}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground text-[11px]">
                                {activity.time} • ID: {activity.id?.substring(0, 8)}...
                              </p>
                              {activity.details && (
                                <div className="bg-muted/30 rounded p-2 mt-1">
                                  <p className="text-[10px] text-muted-foreground font-mono">
                                    {typeof activity.details === 'object' ? 
                                      JSON.stringify(activity.details, null, 2).substring(0, 200) + '...' :
                                      String(activity.details)
                                    }
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="text-center py-8 space-y-3">
                          <Activity className="h-12 w-12 mx-auto text-muted-foreground/30" />
                          <div>
                            <p className="text-sm text-muted-foreground font-medium">No AI activity yet</p>
                            <p className="text-xs text-muted-foreground">System running in {autonomyMode} mode</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="task" className="h-full mt-0">
            <ScrollArea className="h-full p-4">
              {selectedTask ? (
                <div className="space-y-4">
                  {/* Task Header with Edit */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm leading-tight">{selectedTask.title}</h4>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 text-xs" 
                        data-testid="button-edit-task"
                        onClick={() => {
                          // TODO: Open task edit dialog
                          console.log('Edit task:', selectedTask.id);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
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



          <TabsContent value="feature" className="h-full mt-0">
            <FeatureRequestPanel className="h-full" />
          </TabsContent>

          <TabsContent value="diagnostics" className="h-full mt-0">
            <div className="h-full p-4">
              <DiagnosticsPanel 
                aiActivityLog={aiActivityLog.map(log => ({
                  ...log,
                  timestamp: typeof log.timestamp === 'string' ? new Date(log.timestamp) : log.timestamp
                }))}
                lastMaintenanceRun={lastMaintenanceRun}
                autonomyMode={autonomyMode}
                onRunMaintenance={onRunMaintenance}
              />
            </div>
          </TabsContent>

          <TabsContent value="agents" className="h-full mt-0">
            <div className="h-full p-4 overflow-y-auto">
              <AgentDashboard />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}