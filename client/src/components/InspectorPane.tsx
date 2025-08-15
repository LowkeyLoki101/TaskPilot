import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  FileText,
  Lightbulb,
  Bug,
  Users,
  Activity,
  Settings,
  Calendar,
  User,
  Clock,
  MessageCircle,
  Info
} from "lucide-react";
import { ChatPane } from "./ChatPane";
import { AgentDashboard } from "@/components/AgentDashboard";
import { FeatureRequestPanel } from "./FeatureRequestPanel";
import { DiagnosticsPanel } from "./DiagnosticsPanel";

interface InspectorPaneProps {
  selectedTaskId?: string | null;
  currentModule?: "mindmap" | "calendar" | "tasks" | "browser" | "diagnostics" | "agents";
  autonomyMode?: "manual" | "semi" | "full";
  aiActivityLog?: Array<{
    id: string;
    action: string;
    timestamp: Date | string;
    type: "task" | "bug" | "enhancement" | "maintenance" | "ai_response" | "system";
    details?: any;
  }>;
  lastMaintenanceRun?: Date | null;
  onRunMaintenance?: () => void;
  onAutonomyChange?: (mode: "manual" | "semi" | "full") => void;
  projectId: string;
  className?: string;
}

export function InspectorPane({
  selectedTaskId,
  currentModule = "mindmap",
  autonomyMode = "manual",
  aiActivityLog = [],
  lastMaintenanceRun,
  onAutonomyChange,
  onRunMaintenance,
  projectId,
  className,
}: InspectorPaneProps) {
  const [activeTab, setActiveTab] = useState<"ai" | "task" | "feature" | "diagnostics" | "agents">(
    currentModule === "agents" ? "agents" : "ai"
  );

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
  const task = selectedTask as any;
  const comments = taskComments as any[];

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
    <div className={cn("h-full flex flex-col bg-card border-l overflow-hidden", className)}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full flex flex-col">
        {/* Tabs header is sticky within the inspector scroll area */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b px-3 pt-3 pb-2">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="ai" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              AI
            </TabsTrigger>
            <TabsTrigger value="task" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Task
            </TabsTrigger>

            <TabsTrigger value="diagnostics" className="text-xs">
              <Bug className="h-3 w-3 mr-1" />
              Debug
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Body scrolls */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {/* AI tab */}
          <TabsContent value="ai" className="h-full m-0">
            <div className="h-full flex flex-col">
              {/* Autonomy controls */}
              <div className="p-3 border-b bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">Autonomy Mode</span>
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      autonomyMode === "full" ? "bg-green-500" : autonomyMode === "semi" ? "bg-yellow-500" : "bg-gray-400"
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(["manual", "semi", "full"] as const).map((mode) => (
                    <Button
                      key={mode}
                      size="sm"
                      variant={autonomyMode === mode ? "default" : "outline"}
                      className="h-7 text-xs"
                      onClick={() => onAutonomyChange?.(mode)}
                    >
                      {mode === "full" ? "Full" : mode === "semi" ? "Semi" : "Manual"}
                    </Button>
                  ))}
                </div>
                {onRunMaintenance && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full h-7 text-xs"
                    onClick={onRunMaintenance}
                    disabled={autonomyMode === "manual"}
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Run Maintenance
                  </Button>
                )}
              </div>

              {/* Chat */}
              <div className="flex-[2] min-h-0">
                <ChatPane projectId={projectId} autonomyMode={autonomyMode} className="h-full border-none" />
              </div>

              {/* Activity feed */}
              <div className="flex-1 border-t bg-muted/20 min-h-0">
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <Activity className="h-3 w-3 text-primary" />
                        Complete AI Activity Log
                      </div>
                      <Badge variant="outline" className="text-[10px]">{aiActivityLog.length} total</Badge>
                    </div>
                    {aiActivityLog.length === 0 ? (
                      <div className="text-xs text-muted-foreground">No AI activity yet</div>
                    ) : (
                      aiActivityLog.map((a) => (
                        <div key={a.id} className="p-2 rounded border bg-background/60">
                          <div className="text-xs font-medium">{a.action}</div>
                          <div className="text-[10px] text-muted-foreground">{formatTimeAgo(a.timestamp)}</div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          {/* Task tab */}
          <TabsContent value="task" className="h-full m-0">
            <ScrollArea className="h-full p-4">
              {task ? (
                <div className="space-y-4">
                  {/* Task Header */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
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



          {/* Debug tab */}
          <TabsContent value="diagnostics" className="h-full m-0">
            <div className="h-full p-4">
              <DiagnosticsPanel 
                aiActivityLog={aiActivityLog.map(log => ({
                  ...log,
                  timestamp: typeof log.timestamp === 'string' ? new Date(log.timestamp) : log.timestamp,
                  type: log.type === 'ai_response' || log.type === 'system' ? 'maintenance' : log.type
                }))}
                lastMaintenanceRun={lastMaintenanceRun}
                autonomyMode={autonomyMode}
                onRunMaintenance={onRunMaintenance}
              />
            </div>
          </TabsContent>

          {/* Agents: mount dashboard full height inside inspector if needed */}
          <TabsContent value="agents" className="h-full m-0">
            <div className="h-full">
              <AgentDashboard />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}