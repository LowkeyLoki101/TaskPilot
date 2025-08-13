// AI Agent Dashboard - Displays agent status, metrics, and orchestration controls
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Bot, 
  Brain, 
  Users, 
  Activity, 
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Settings,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  Network,
  MessageSquare
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Agent {
  id: string;
  role: string;
  name: string;
  status: 'idle' | 'active' | 'busy' | 'error' | 'offline';
  config: any;
  metrics: {
    tasksCompleted: number;
    averageResponseTime: number;
    successRate: number;
    collaborationCount: number;
    uptime: number;
    lastActivity: string;
  };
}

interface OrchestrationRequest {
  type: 'task_completion' | 'code_review' | 'feature_development' | 'system_optimization';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  context: Record<string, any>;
}

interface SystemMetrics {
  totalAgents: number;
  activeAgents: number;
  busyAgents: number;
  totalTasksCompleted: number;
  averageSuccessRate: number;
  queuedMessages: number;
  activeWorkflows: number;
  completedWorkflows: number;
}

const statusColors = {
  idle: 'bg-gray-500',
  active: 'bg-green-500',
  busy: 'bg-yellow-500',
  error: 'bg-red-500',
  offline: 'bg-gray-400',
};

const statusIcons = {
  idle: <Clock className="h-4 w-4" />,
  active: <CheckCircle className="h-4 w-4" />,
  busy: <Activity className="h-4 w-4" />,
  error: <XCircle className="h-4 w-4" />,
  offline: <AlertTriangle className="h-4 w-4" />,
};

const roleIcons = {
  task_manager: <Users className="h-4 w-4" />,
  code_analyst: <Brain className="h-4 w-4" />,
  workflow_coordinator: <Network className="h-4 w-4" />,
  memory_curator: <Brain className="h-4 w-4" />,
  feature_architect: <Settings className="h-4 w-4" />,
  performance_optimizer: <Zap className="h-4 w-4" />,
  security_auditor: <AlertTriangle className="h-4 w-4" />,
  user_interface: <MessageSquare className="h-4 w-4" />,
  data_processor: <Activity className="h-4 w-4" />,
  integration_specialist: <Network className="h-4 w-4" />,
};

export function AgentDashboard() {
  const [orchestrationDialogOpen, setOrchestrationDialogOpen] = useState(false);
  const [orchestrationRequest, setOrchestrationRequest] = useState<Partial<OrchestrationRequest>>({
    type: 'task_completion',
    priority: 'medium',
    context: {}
  });
  const { toast } = useToast();

  // Fetch agents data
  const { data: agents = [], isLoading: agentsLoading } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch system metrics
  const { data: systemMetrics, isLoading: metricsLoading } = useQuery<SystemMetrics>({
    queryKey: ['/api/agents/system-metrics'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Orchestration mutation
  const orchestrateMutation = useMutation({
    mutationFn: async (request: OrchestrationRequest) => {
      return apiRequest('POST', '/api/agents/orchestrate', request);
    },
    onSuccess: () => {
      toast({
        title: 'Orchestration Started',
        description: 'Multi-agent workflow has been initiated',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      setOrchestrationDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Orchestration Failed',
        description: 'Failed to start multi-agent workflow',
        variant: 'destructive',
      });
    }
  });

  // Agent control mutations
  const controlMutation = useMutation({
    mutationFn: async ({ agentId, action }: { agentId: string; action: string }) => {
      return apiRequest('POST', `/api/agents/${agentId}/${action}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
    }
  });

  const handleOrchestrate = () => {
    if (!orchestrationRequest.description) {
      toast({
        title: 'Description Required',
        description: 'Please provide a description for the orchestration',
        variant: 'destructive',
      });
      return;
    }

    orchestrateMutation.mutate(orchestrationRequest as OrchestrationRequest);
  };

  const handleAgentControl = (agentId: string, action: string) => {
    controlMutation.mutate({ agentId, action });
  };

  if (agentsLoading || metricsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agent Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading agents...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agent System Overview
          </CardTitle>
          <CardDescription>
            Multi-agent coordination and task management
          </CardDescription>
        </CardHeader>
        <CardContent>
          {systemMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{systemMetrics.totalAgents}</div>
                <div className="text-sm text-muted-foreground">Total Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{systemMetrics.activeAgents}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{systemMetrics.busyAgents}</div>
                <div className="text-sm text-muted-foreground">Busy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">{systemMetrics.totalTasksCompleted}</div>
                <div className="text-sm text-muted-foreground">Tasks Completed</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <Tabs defaultValue="agents" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <Dialog open={orchestrationDialogOpen} onOpenChange={setOrchestrationDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Start Orchestration
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Multi-Agent Orchestration</DialogTitle>
                <DialogDescription>
                  Configure and start a coordinated multi-agent workflow
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Task Type</Label>
                  <Select
                    value={orchestrationRequest.type}
                    onValueChange={(value) => 
                      setOrchestrationRequest(prev => ({ ...prev, type: value as any }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="task_completion">Task Completion</SelectItem>
                      <SelectItem value="code_review">Code Review</SelectItem>
                      <SelectItem value="feature_development">Feature Development</SelectItem>
                      <SelectItem value="system_optimization">System Optimization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={orchestrationRequest.priority}
                    onValueChange={(value) => 
                      setOrchestrationRequest(prev => ({ ...prev, priority: value as any }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={orchestrationRequest.description || ''}
                    onChange={(e) => 
                      setOrchestrationRequest(prev => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Describe what you want the agents to accomplish..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOrchestrationDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleOrchestrate} disabled={orchestrateMutation.isPending}>
                  {orchestrateMutation.isPending ? 'Starting...' : 'Start Orchestration'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="agents">
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onControl={handleAgentControl}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="workflows">
          <Card>
            <CardHeader>
              <CardTitle>Active Workflows</CardTitle>
              <CardDescription>
                Currently running multi-agent workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              {systemMetrics && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Active Workflows</span>
                    <Badge variant="outline">{systemMetrics.activeWorkflows}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Completed Workflows</span>
                    <Badge variant="outline">{systemMetrics.completedWorkflows}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Queued Messages</span>
                    <Badge variant="outline">{systemMetrics.queuedMessages}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                {systemMetrics && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Average Success Rate</span>
                      <Badge variant="outline">
                        {(systemMetrics.averageSuccessRate * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>System Load</span>
                      <Badge variant="outline">
                        {systemMetrics.busyAgents}/{systemMetrics.totalAgents}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agent Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(
                    agents.reduce((acc, agent) => {
                      acc[agent.role] = (acc[agent.role] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([role, count]) => (
                    <div key={role} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {roleIcons[role as keyof typeof roleIcons]}
                        <span className="capitalize">{role.replace('_', ' ')}</span>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Individual Agent Card Component
function AgentCard({ 
  agent, 
  onControl 
}: { 
  agent: Agent;
  onControl: (agentId: string, action: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {roleIcons[agent.role as keyof typeof roleIcons]}
              {agent.name}
            </CardTitle>
            <CardDescription className="text-xs">
              {agent.role.replace('_', ' ')}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`} />
            {statusIcons[agent.status]}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium">Tasks:</span>
                <span className="ml-1">{agent.metrics.tasksCompleted}</span>
              </div>
              <div>
                <span className="font-medium">Success:</span>
                <span className="ml-1">{(agent.metrics.successRate * 100).toFixed(0)}%</span>
              </div>
              <div>
                <span className="font-medium">Avg Time:</span>
                <span className="ml-1">{agent.metrics.averageResponseTime.toFixed(0)}ms</span>
              </div>
              <div>
                <span className="font-medium">Collaborations:</span>
                <span className="ml-1">{agent.metrics.collaborationCount}</span>
              </div>
            </div>

            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onControl(agent.id, 'restart')}
                className="flex-1"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Restart
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onControl(agent.id, agent.status === 'active' ? 'pause' : 'resume')}
                className="flex-1"
              >
                {agent.status === 'active' ? (
                  <>
                    <Pause className="h-3 w-3 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-1" />
                    Resume
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}