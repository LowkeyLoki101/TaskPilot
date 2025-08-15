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
  Info,
  Bot,
  CheckCircle,
  Circle,
  Zap
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

  // Get all tasks and filter for AI-created ones
  const { data: allTasks = [] } = useQuery({
    queryKey: ["/api/projects", projectId, "tasks"],
    refetchInterval: 2000
  });

  // Filter for AI-generated tasks (those without assignees or recently created by AI)
  const aiTasks = allTasks.filter((task: any) => 
    task.assigneeId === null || 
    task.title === "AI-Generated Task" || 
    task.description?.includes("AI assistant") ||
    task.description?.includes("Task created by AI")
  );

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
              <Bot className="h-3 w-3 mr-1" />
              AI Tasks
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

          {/* AI Tasks tab */}
          <TabsContent value="task" className="h-full m-0">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">AI-Generated Tasks</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {aiTasks.length} active
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tasks created and managed by the AI assistant
                </p>
              </div>

              {/* AI Tasks List */}
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                  {aiTasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No AI tasks yet</p>
                      <p className="text-xs">AI will create tasks here as it works</p>
                    </div>
                  ) : (
                    aiTasks.map((task) => (
                      <div key={task.id} className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">{task.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                            
                            <div className="flex items-center gap-2 mt-2">
                              <Badge 
                                variant={task.status === 'completed' ? 'default' : task.status === 'in_progress' ? 'secondary' : 'outline'} 
                                className="text-xs"
                              >
                                {task.status === 'todo' ? 'pending' : task.status.replace('_', ' ')}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(task.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {task.status === 'completed' && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            {task.status === 'in_progress' && (
                              <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />
                            )}
                            {task.status === 'todo' && (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* AI Task Creator */}
              <div className="p-3 border-t bg-muted/30">
                <div className="text-xs text-muted-foreground mb-2">
                  <Zap className="h-3 w-3 inline mr-1" />
                  Create AI Task
                </div>
                <div className="text-xs text-muted-foreground">
                  Type "create task: [description]" in chat above to let AI create and manage tasks automatically
                </div>
              </div>
            </div>
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