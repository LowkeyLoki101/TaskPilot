import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Wrench, 
  Sparkles, 
  Code, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  ArrowRight,
  Plus,
  Zap,
  Target
} from "lucide-react";

interface WorkspaceAction {
  id: string;
  type: 'tool_creation' | 'feature_implementation' | 'workflow_generation' | 'code_analysis';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  progress: number;
  steps: Array<{
    id: string;
    name: string;
    status: 'pending' | 'active' | 'completed' | 'error';
    timestamp?: string;
  }>;
  result?: any;
  createdAt: string;
}

interface InteractiveWorkspaceOrchestratorProps {
  className?: string;
  onActionComplete?: (action: WorkspaceAction) => void;
}

export function InteractiveWorkspaceOrchestrator({ 
  className, 
  onActionComplete 
}: InteractiveWorkspaceOrchestratorProps) {
  const [actions, setActions] = useState<WorkspaceAction[]>([]);
  const [activeAction, setActiveAction] = useState<WorkspaceAction | null>(null);
  const [isListening, setIsListening] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket for real-time action coordination
    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/workspace-orchestrator`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWorkspaceCommand(data);
      };
      
      wsRef.current.onclose = () => {
        // Reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };
    };

    if (isListening) {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isListening]);

  const handleWorkspaceCommand = (command: any) => {
    switch (command.type) {
      case 'CREATE_TOOL':
        initiateToolCreation(command.payload);
        break;
      case 'IMPLEMENT_FEATURE':
        initiateFeatureImplementation(command.payload);
        break;
      case 'GENERATE_WORKFLOW':
        initiateWorkflowGeneration(command.payload);
        break;
      case 'ANALYZE_CODE':
        // Code analysis functionality to be implemented
        break;
      case 'UPDATE_PROGRESS':
        updateActionProgress(command.payload.actionId, command.payload.progress, command.payload.step);
        break;
      case 'COMPLETE_ACTION':
        completeAction(command.payload.actionId, command.payload.result);
        break;
    }
  };

  const initiateToolCreation = (payload: { name: string; description: string; type: string }) => {
    const action: WorkspaceAction = {
      id: `tool_${Date.now()}`,
      type: 'tool_creation',
      title: `Creating Tool: ${payload.name}`,
      description: payload.description,
      status: 'in_progress',
      progress: 0,
      steps: [
        { id: 'analyze', name: 'Analyzing requirements', status: 'active' },
        { id: 'design', name: 'Designing tool interface', status: 'pending' },
        { id: 'implement', name: 'Implementing functionality', status: 'pending' },
        { id: 'integrate', name: 'Integrating with workspace', status: 'pending' },
        { id: 'test', name: 'Testing and validation', status: 'pending' }
      ],
      createdAt: new Date().toISOString()
    };

    setActions(prev => [action, ...prev]);
    setActiveAction(action);
    
    // Simulate progressive tool creation
    simulateToolCreationProcess(action);
  };

  const initiateFeatureImplementation = (payload: { title: string; description: string }) => {
    const action: WorkspaceAction = {
      id: `feature_${Date.now()}`,
      type: 'feature_implementation',
      title: `Implementing: ${payload.title}`,
      description: payload.description,
      status: 'in_progress',
      progress: 0,
      steps: [
        { id: 'scope', name: 'Defining scope', status: 'active' },
        { id: 'plan', name: 'Creating implementation plan', status: 'pending' },
        { id: 'code', name: 'Writing code', status: 'pending' },
        { id: 'ui', name: 'Building user interface', status: 'pending' },
        { id: 'deploy', name: 'Deploying changes', status: 'pending' }
      ],
      createdAt: new Date().toISOString()
    };

    setActions(prev => [action, ...prev]);
    setActiveAction(action);
    
    simulateFeatureImplementation(action);
  };

  const initiateWorkflowGeneration = (payload: { description: string }) => {
    const action: WorkspaceAction = {
      id: `workflow_${Date.now()}`,
      type: 'workflow_generation',
      title: 'Generating Workflow',
      description: payload.description,
      status: 'in_progress',
      progress: 0,
      steps: [
        { id: 'parse', name: 'Parsing requirements', status: 'active' },
        { id: 'design', name: 'Designing flow structure', status: 'pending' },
        { id: 'generate', name: 'Generating nodes', status: 'pending' },
        { id: 'connect', name: 'Creating connections', status: 'pending' },
        { id: 'validate', name: 'Validating workflow', status: 'pending' }
      ],
      createdAt: new Date().toISOString()
    };

    setActions(prev => [action, ...prev]);
    setActiveAction(action);
    
    simulateWorkflowGeneration(action);
  };

  const simulateToolCreationProcess = async (action: WorkspaceAction) => {
    for (let i = 0; i < action.steps.length; i++) {
      // Update current step to active
      setActions(prev => prev.map(a => a.id === action.id ? {
        ...a,
        steps: a.steps.map((step, idx) => ({
          ...step,
          status: idx === i ? 'active' : idx < i ? 'completed' : 'pending'
        })),
        progress: ((i + 1) / action.steps.length) * 100
      } : a));

      // Simulate work time
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    }

    // Complete the action
    completeAction(action.id, { toolCreated: true, toolId: `tool_${Date.now()}` });
  };

  const simulateFeatureImplementation = async (action: WorkspaceAction) => {
    for (let i = 0; i < action.steps.length; i++) {
      setActions(prev => prev.map(a => a.id === action.id ? {
        ...a,
        steps: a.steps.map((step, idx) => ({
          ...step,
          status: idx === i ? 'active' : idx < i ? 'completed' : 'pending'
        })),
        progress: ((i + 1) / action.steps.length) * 100
      } : a));

      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2500));
    }

    completeAction(action.id, { featureImplemented: true });
  };

  const simulateWorkflowGeneration = async (action: WorkspaceAction) => {
    for (let i = 0; i < action.steps.length; i++) {
      setActions(prev => prev.map(a => a.id === action.id ? {
        ...a,
        steps: a.steps.map((step, idx) => ({
          ...step,
          status: idx === i ? 'active' : idx < i ? 'completed' : 'pending'
        })),
        progress: ((i + 1) / action.steps.length) * 100
      } : a));

      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    }

    completeAction(action.id, { workflowGenerated: true });
  };

  const updateActionProgress = (actionId: string, progress: number, step?: string) => {
    setActions(prev => prev.map(action => 
      action.id === actionId ? { ...action, progress } : action
    ));
  };

  const completeAction = (actionId: string, result: any) => {
    setActions(prev => prev.map(action => 
      action.id === actionId ? { 
        ...action, 
        status: 'completed' as const,
        progress: 100,
        result,
        steps: action.steps.map(step => ({ ...step, status: 'completed' as const }))
      } : action
    ));
    
    const completedAction = actions.find(a => a.id === actionId);
    if (completedAction && onActionComplete) {
      onActionComplete({ ...completedAction, status: 'completed', progress: 100, result });
    }
    
    setActiveAction(null);
  };

  const getActionIcon = (type: WorkspaceAction['type']) => {
    switch (type) {
      case 'tool_creation': return Wrench;
      case 'feature_implementation': return Sparkles;
      case 'workflow_generation': return Target;
      case 'code_analysis': return Code;
      default: return Brain;
    }
  };

  const getStatusColor = (status: WorkspaceAction['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className="h-6 w-6 text-primary" />
              {isListening && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold">Interactive Workspace</h2>
              <p className="text-sm text-muted-foreground">
                {isListening ? 'Listening for commands...' : 'Workspace inactive'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsListening(!isListening)}
            className="gap-2"
          >
            {isListening ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isListening ? 'Pause' : 'Resume'}
          </Button>
        </div>
      </div>

      {/* Active Action */}
      {activeAction && (
        <div className="p-4 border-b bg-blue-50 dark:bg-blue-950/30">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {React.createElement(getActionIcon(activeAction.type), {
                    className: "h-5 w-5 text-primary"
                  })}
                  <CardTitle className="text-base">{activeAction.title}</CardTitle>
                </div>
                <Badge className={getStatusColor(activeAction.status)}>
                  {activeAction.status.replace('_', ' ')}
                </Badge>
              </div>
              <Progress value={activeAction.progress} className="w-full" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {activeAction.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-2 text-sm">
                    {step.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {step.status === 'active' && <Clock className="h-4 w-4 text-blue-500 animate-spin" />}
                    {step.status === 'pending' && <div className="h-4 w-4 rounded-full border-2 border-gray-300" />}
                    {step.status === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    <span className={step.status === 'active' ? 'font-medium' : ''}>{step.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action History */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {actions.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Ready for Commands
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Tell me to create tools, implement features, or generate workflows and watch them come to life in real-time.
              </p>
            </div>
          ) : (
            actions.map((action) => (
              <Card key={action.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {React.createElement(getActionIcon(action.type), {
                        className: "h-4 w-4 text-primary"
                      })}
                      <h4 className="font-medium text-sm">{action.title}</h4>
                    </div>
                    <Badge variant="outline" className={getStatusColor(action.status)}>
                      {action.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{action.description}</p>
                  <div className="flex items-center justify-between">
                    <Progress value={action.progress} className="flex-1 mr-3" />
                    <span className="text-xs text-muted-foreground">{Math.round(action.progress)}%</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="p-4 border-t bg-gray-50 dark:bg-gray-900">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => initiateToolCreation({ 
              name: 'Custom Tool', 
              description: 'User-requested tool creation',
              type: 'custom'
            })}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Create Tool
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => initiateWorkflowGeneration({ 
              description: 'Generate workflow from voice input'
            })}
            className="text-xs"
          >
            <Zap className="h-3 w-3 mr-1" />
            Generate Flow
          </Button>
        </div>
      </div>
    </div>
  );
}