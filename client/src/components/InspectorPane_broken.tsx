import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Lightbulb,
  MessageCircle,
  Info
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

  // Fetch real task data when a task is selected
  const { data: selectedTask } = useQuery({
    queryKey: [`/api/tasks/${selectedTaskId}`],
    enabled: !!selectedTaskId
  });

  // Fetch real task comments
  const { data: taskComments = [] } = useQuery({
    queryKey: [`/api/tasks/${selectedTaskId}/comments`],
    enabled: !!selectedTaskId
  });

  // Type-safe task data
  const task = selectedTask as any; // TODO: Add proper typing
  const comments = taskComments as any[]; // TODO: Add proper typing

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
      details: (log as any).details
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
                              activity.type === 'task' ? 'bg-green-500' :
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
              {task ? (
                <div className="space-y-4">
                  {/* Task Header with Edit */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 text-xs" 
                        data-testid="button-edit-task"
                        onClick={() => {
                          // TODO: Open task edit dialog
                          console.log('Edit task:', task.id);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">{task.description}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      <Badge variant={task.priority === "high" ? "destructive" : "default"} className="text-xs">
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {task.status}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Task Meta */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Assignee:</span>
                      <span className="font-medium">
                        {task.assigneeId ? "You" : "Unassigned"}
                      </span>
                    </div>
                    
                    {task.dueDate && (
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Due:</span>
                        <span className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">{new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Task Comments */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageCircle className="h-3 w-3" />
                      Comments ({comments.length})
                    </div>
                    <div className="space-y-2">
                      {comments.length > 0 ? comments.map((comment: any) => (
                        <div key={comment.id} className="bg-muted/50 rounded p-2">
                          <p className="text-xs">{comment.content}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      )) : (
                        <p className="text-xs text-muted-foreground">No comments yet</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Task Metadata */}
                  {task.metadata && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Info className="h-3 w-3" />
                        Task Info
                      </div>
                      <div className="bg-muted/30 rounded p-2">
                        <pre className="text-[10px] text-muted-foreground font-mono">
                          {JSON.stringify(task.metadata, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}


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