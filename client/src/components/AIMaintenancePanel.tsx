import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Brain,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Search,
  Settings,
  Play,
  Pause
} from "lucide-react";

interface AiMaintenanceLog {
  id: string;
  maintenance_type: string;
  description: string;
  findings: string[];
  actions_taken: string[];
  recommendations: string[];
  efficiency_score?: number;
  frequency: string;
  next_check?: string;
  status: string;
  metadata: any;
  createdAt: string;
}

interface AIMaintenancePanelProps {
  className?: string;
  projectId?: string;
  autonomyMode?: 'manual' | 'semi' | 'full';
  onSetAutonomyMode?: (mode: 'manual' | 'semi' | 'full') => void;
}

export function AIMaintenancePanel({ 
  className, 
  projectId = 'system',
  autonomyMode = 'manual',
  onSetAutonomyMode 
}: AIMaintenancePanelProps) {
  const [frequency, setFrequency] = useState<'5min' | '30min' | '1hour' | '1day'>('30min');
  const [autoMode, setAutoMode] = useState(false);

  const queryClient = useQueryClient();

  const { data: maintenanceLogs = [], isLoading } = useQuery<AiMaintenanceLog[]>({
    queryKey: ['/api/ai-maintenance-logs'],
  });

  const runMaintenance = useMutation({
    mutationFn: async (config: { projectId: string; frequency: string }) => {
      const response = await fetch('/api/ai-maintenance/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-maintenance-logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/feature-requests'] });
    },
  });

  const latestLog = maintenanceLogs[0];
  const averageEfficiency = maintenanceLogs.length > 0 
    ? maintenanceLogs
        .filter(log => log.efficiency_score !== null && log.efficiency_score !== undefined)
        .reduce((acc, log) => acc + (log.efficiency_score || 0), 0) / 
      maintenanceLogs.filter(log => log.efficiency_score !== null && log.efficiency_score !== undefined).length
    : 0;

  const getFrequencyDisplay = (freq: string) => {
    switch (freq) {
      case '5min': return 'Every 5 minutes';
      case '30min': return 'Every 30 minutes';
      case '1hour': return 'Every hour';
      case '1day': return 'Daily';
      default: return freq;
    }
  };

  const getAutonomyColor = (mode: string) => {
    switch (mode) {
      case 'full': return 'text-green-500';
      case 'semi': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">AI Autonomous Maintenance</h2>
            <Badge 
              variant={autonomyMode === 'full' ? 'default' : 'outline'} 
              className={`text-xs ${getAutonomyColor(autonomyMode)}`}
            >
              {autonomyMode.toUpperCase()} MODE
            </Badge>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Efficiency Score</p>
                  <p className="text-2xl font-bold">{Math.round(averageEfficiency)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <Progress value={averageEfficiency} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Maintenance Runs</p>
                  <p className="text-2xl font-bold">{maintenanceLogs.length}</p>
                </div>
                <Zap className="h-8 w-8 text-blue-500" />
              </div>
              {latestLog && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last: {new Date(latestLog.createdAt).toLocaleTimeString()}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Select value={frequency} onValueChange={(value) => setFrequency(value as any)}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5min">Every 5 minutes</SelectItem>
                <SelectItem value="30min">Every 30 minutes</SelectItem>
                <SelectItem value="1hour">Every hour</SelectItem>
                <SelectItem value="1day">Daily</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={() => runMaintenance.mutate({ projectId, frequency })}
              disabled={runMaintenance.isPending}
              size="sm"
              data-testid="run-ai-maintenance"
            >
              {runMaintenance.isPending ? (
                <Pause className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Play className="h-3 w-3 mr-1" />
              )}
              {runMaintenance.isPending ? 'Analyzing...' : 'Run Analysis'}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <strong>Self-Prompting Questions:</strong> AI will ask efficiency, bottleneck, and improvement questions
          </div>
        </div>
      </div>

      {/* Latest Analysis Results */}
      {latestLog && (
        <div className="p-4 border-b border-border bg-muted/20">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                Latest Autonomous Analysis
                <Badge variant="outline" className="text-xs">
                  Score: {latestLog.efficiency_score}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Findings */}
              {latestLog.findings && latestLog.findings.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
                    <Search className="h-3 w-3" />
                    Key Findings
                  </h4>
                  <div className="space-y-1">
                    {latestLog.findings.slice(0, 2).map((finding, idx) => (
                      <p key={idx} className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
                        {finding}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {latestLog.recommendations && latestLog.recommendations.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    AI Recommendations
                  </h4>
                  <div className="space-y-1">
                    {latestLog.recommendations.slice(0, 2).map((rec, idx) => (
                      <p key={idx} className="text-xs text-muted-foreground p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                        {rec}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Workstation Health */}
              {latestLog.metadata?.workstation_health && (
                <div>
                  <h4 className="text-xs font-medium mb-2">Workstation Organs Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(latestLog.metadata.workstation_health).map(([organ, status]) => (
                      <Badge 
                        key={organ}
                        variant={status === 'active' ? 'default' : status === 'needs_attention' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {organ}: {status as string}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Searchable Tags */}
              {latestLog.metadata?.searchable_tags && (
                <div>
                  <h4 className="text-xs font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {latestLog.metadata.searchable_tags.map((tag: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Maintenance History */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          <h3 className="text-sm font-medium">Maintenance History</h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <Brain className="h-8 w-8 mx-auto mb-2 animate-pulse opacity-50" />
              <p className="text-sm text-muted-foreground">Loading maintenance logs...</p>
            </div>
          ) : maintenanceLogs.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground mb-4">
                No maintenance runs yet. Start autonomous analysis to begin monitoring.
              </p>
              <Button 
                onClick={() => runMaintenance.mutate({ projectId, frequency })}
                size="sm"
              >
                <Play className="h-3 w-3 mr-1" />
                Run First Analysis
              </Button>
            </div>
          ) : (
            maintenanceLogs.map((log) => (
              <Card key={log.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {log.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      <div>
                        <h4 className="font-medium text-sm">{log.maintenance_type.replace(/_/g, ' ')}</h4>
                        <p className="text-xs text-muted-foreground">{log.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {log.efficiency_score && (
                        <Badge variant="outline" className="text-xs mb-1">
                          {log.efficiency_score}%
                        </Badge>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {log.actions_taken && log.actions_taken.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Actions:</strong> {log.actions_taken.slice(0, 2).join(', ')}
                      {log.actions_taken.length > 2 && '...'}
                    </div>
                  )}

                  {log.next_check && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <strong>Next Check:</strong> {new Date(log.next_check).toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}