import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Settings, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown
} from "lucide-react";

interface ToolDiagnostic {
  id: string;
  name: string;
  category: string;
  usageCount: number;
  errorCount: number;
  lastUsed: Date | null;
  avgResponseTime: number;
  status: 'healthy' | 'degraded' | 'failed';
  healthScore: number;
}

interface ProjectStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'abandoned' | 'completed';
  lastActivity: Date;
  taskCount: number;
  completionPercentage: number;
  aiNotes: string;
  priority: 'low' | 'medium' | 'high';
}

interface MaintenanceDiagnosticsProps {
  className?: string;
}

export function MaintenanceDiagnostics({ className }: MaintenanceDiagnosticsProps) {
  const [maintenanceFrequency, setMaintenanceFrequency] = useState(30);
  
  const { data: toolDiagnostics = [], isLoading: toolsLoading } = useQuery<ToolDiagnostic[]>({
    queryKey: ['/api/diagnostics/tools'],
  });

  const { data: projectStatuses = [], isLoading: projectsLoading } = useQuery<ProjectStatus[]>({
    queryKey: ['/api/diagnostics/projects'],
  });

  const updateMaintenanceFrequency = async () => {
    try {
      await fetch('/api/maintenance/frequency', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frequency: maintenanceFrequency })
      });
    } catch (error) {
      console.error('Error updating frequency:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'degraded': return AlertTriangle;
      case 'failed': return XCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'failed': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'idle': return 'secondary';
      case 'abandoned': return 'destructive';
      case 'completed': return 'outline';
      default: return 'outline';
    }
  };

  if (toolsLoading || projectsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 mx-auto mb-2 animate-pulse opacity-50" />
          <p className="text-sm text-muted-foreground">Loading diagnostics...</p>
        </div>
      </div>
    );
  }

  const healthyTools = toolDiagnostics.filter(t => t.status === 'healthy').length;
  const totalTools = toolDiagnostics.length;
  const systemHealthScore = totalTools > 0 ? Math.round((healthyTools / totalTools) * 100) : 100;

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border bg-background/95">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">System Diagnostics</h3>
          </div>
          <Badge variant="outline" className="text-xs">
            {systemHealthScore}% healthy
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* System Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">System Health Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Overall Health Score</span>
                <span className="font-mono text-sm">{systemHealthScore}%</span>
              </div>
              <Progress value={systemHealthScore} className="h-2" />
              
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="text-center">
                  <div className="text-green-500 font-mono text-lg">
                    {toolDiagnostics.filter(t => t.status === 'healthy').length}
                  </div>
                  <div className="text-muted-foreground">Healthy</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-500 font-mono text-lg">
                    {toolDiagnostics.filter(t => t.status === 'degraded').length}
                  </div>
                  <div className="text-muted-foreground">Degraded</div>
                </div>
                <div className="text-center">
                  <div className="text-red-500 font-mono text-lg">
                    {toolDiagnostics.filter(t => t.status === 'failed').length}
                  </div>
                  <div className="text-muted-foreground">Failed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Maintenance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Label htmlFor="frequency" className="text-sm">Check every</Label>
                <Input
                  id="frequency"
                  type="number"
                  value={maintenanceFrequency}
                  onChange={(e) => setMaintenanceFrequency(Number(e.target.value))}
                  className="w-20 h-8 text-xs"
                  min="10"
                  max="300"
                />
                <span className="text-sm text-muted-foreground">seconds</span>
                <Button
                  size="sm"
                  onClick={updateMaintenanceFrequency}
                  className="text-xs h-8"
                >
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tool Diagnostics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Tool Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {toolDiagnostics.map((tool) => {
                  const StatusIcon = getStatusIcon(tool.status);
                  const errorRate = tool.usageCount > 0 ? (tool.errorCount / tool.usageCount * 100) : 0;
                  
                  return (
                    <div key={tool.id} className="flex items-center space-x-3 p-2 bg-muted/30 rounded">
                      <StatusIcon className={`h-4 w-4 ${getStatusColor(tool.status)}`} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate">{tool.name}</span>
                          <Badge variant="outline" className="text-xs">{tool.category}</Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Uses: {tool.usageCount}</span>
                          <span>Errors: {tool.errorCount}</span>
                          <span>Error Rate: {errorRate.toFixed(1)}%</span>
                          <span>Avg Response: {tool.avgResponseTime.toFixed(0)}ms</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-1">
                          <Progress value={tool.healthScore} className="flex-1 h-1" />
                          <span className="text-xs font-mono">{tool.healthScore}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Project Status Tracking */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Project Activity Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projectStatuses.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Clock className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No projects to monitor yet</p>
                  </div>
                ) : (
                  projectStatuses.map((project) => {
                    const daysSinceActivity = Math.floor(
                      (Date.now() - new Date(project.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
                    );
                    
                    return (
                      <div key={project.id} className="p-3 bg-muted/30 rounded space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{project.name}</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getProjectStatusColor(project.status)} className="text-xs">
                              {project.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {project.priority}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Tasks: {project.taskCount}</span>
                          <span>Complete: {project.completionPercentage}%</span>
                          <span>Last activity: {daysSinceActivity}d ago</span>
                        </div>
                        
                        {project.aiNotes && (
                          <p className="text-xs text-muted-foreground italic">
                            AI Note: {project.aiNotes}
                          </p>
                        )}
                        
                        <Progress value={project.completionPercentage} className="h-1" />
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}