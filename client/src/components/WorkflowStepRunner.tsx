import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { FlowScript, FlowNode, FlowRuntime } from "@shared/flowscript";
import {
  Play,
  Share,
  ExternalLink,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Cpu,
  Brain,
  Settings,
  MoreHorizontal
} from "lucide-react";

interface WorkflowStepRunnerProps {
  flow: FlowScript;
  runtime?: FlowRuntime;
  onRunStep?: (stepId: string, mode: "simulate" | "live") => void;
  onOpenUrl?: (url: string) => void;
  onSendEmail?: (params: { to: string; subject: string; body?: string }) => void;
  onMakeCall?: (phone: string) => void;
  className?: string;
}

export function WorkflowStepRunner({
  flow,
  runtime,
  onRunStep,
  onOpenUrl,
  onSendEmail,
  onMakeCall,
  className
}: WorkflowStepRunnerProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const getActorIcon = (actor: string) => {
    switch (actor) {
      case "user": return <User className="h-4 w-4" />;
      case "app": return <Cpu className="h-4 w-4" />;
      case "ai": return <Brain className="h-4 w-4" />;
      case "system": return <Settings className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getActorColor = (actor: string) => {
    switch (actor) {
      case "user": return "bg-blue-600";
      case "app": return "bg-green-600";
      case "ai": return "bg-purple-600";
      case "system": return "bg-gray-600";
      default: return "bg-slate-600";
    }
  };

  const getStepStatus = (stepId: string) => {
    const trace = runtime?.traces.find(t => t.stepId === stepId);
    if (!trace) return "pending";
    return trace.success ? "completed" : "failed";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed": return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "running": return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getQuickActions = (node: FlowNode) => {
    const actions = [];

    // URL actions
    if (node.inputs?.url || node.inputs?.fileUrl) {
      actions.push({
        icon: <ExternalLink className="h-3 w-3" />,
        label: "Open",
        action: () => onOpenUrl?.(node.inputs?.url || node.inputs?.fileUrl)
      });
    }

    // Email actions
    if (node.tool?.includes("email") || node.inputs?.to) {
      actions.push({
        icon: <Mail className="h-3 w-3" />,
        label: "Email",
        action: () => onSendEmail?.({
          to: node.inputs?.to || "client@example.com",
          subject: node.inputs?.subject || node.label,
          body: node.inputs?.body
        })
      });
    }

    // Call actions
    if (node.tool?.includes("call") || node.inputs?.phone) {
      actions.push({
        icon: <Phone className="h-3 w-3" />,
        label: "Call",
        action: () => onMakeCall?.(node.inputs?.phone || "+1234567890")
      });
    }

    // Generic run action
    if (node.tool) {
      actions.push({
        icon: <Play className="h-3 w-3" />,
        label: "Run",
        action: () => onRunStep?.(node.id, "live")
      });
    }

    return actions;
  };

  const completedSteps = flow.nodes.filter(node => getStepStatus(node.id) === "completed").length;
  const progress = (completedSteps / flow.nodes.length) * 100;

  return (
    <div className={`flex flex-col h-full ${className}`} data-testid="workflow-step-runner">
      {/* Header with progress */}
      <div className="p-4 border-b border-border">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-sm">{flow.title}</h3>
            <p className="text-xs text-muted-foreground">
              {completedSteps} of {flow.nodes.length} steps completed
            </p>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Step List */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {flow.nodes.map((node, index) => {
            const status = getStepStatus(node.id);
            const isExpanded = expandedStep === node.id;
            const quickActions = getQuickActions(node);
            const isCurrentStep = runtime?.currentStep === node.id;

            return (
              <Card 
                key={node.id}
                className={`transition-all ${isCurrentStep ? 'ring-2 ring-primary' : ''} ${
                  status === 'completed' ? 'bg-green-50 dark:bg-green-950/20' : ''
                }`}
              >
                <CardContent className="p-3">
                  <div className="space-y-3">
                    {/* Step Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                            {index + 1}
                          </div>
                          <div className={`p-1.5 rounded-lg text-white ${getActorColor(node.actor)}`}>
                            {getActorIcon(node.actor)}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm leading-tight">{node.label}</h4>
                            {getStatusIcon(status)}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {node.type}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {node.actor}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedStep(isExpanded ? null : node.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Tool info */}
                    {node.tool && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Tool:</span>
                        <span className="ml-1 font-mono bg-muted px-1 py-0.5 rounded">
                          {node.tool}
                        </span>
                      </div>
                    )}

                    {/* Postconditions */}
                    {node.post && Object.keys(node.post).length > 0 && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Expects:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.keys(node.post).map(key => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    {quickActions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {quickActions.map((action, actionIndex) => (
                          <Button
                            key={actionIndex}
                            onClick={action.action}
                            size="sm"
                            variant={action.label === "Run" ? "default" : "outline"}
                            className="text-xs h-7"
                          >
                            {action.icon}
                            <span className="ml-1">{action.label}</span>
                          </Button>
                        ))}
                        <Button
                          onClick={() => navigator.share?.({ 
                            title: node.label,
                            text: `Step: ${node.label}`,
                            url: window.location.href 
                          })}
                          size="sm"
                          variant="outline"
                          className="text-xs h-7"
                        >
                          <Share className="h-3 w-3" />
                        </Button>
                      </div>
                    )}

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="pt-2 border-t border-border space-y-2">
                        {node.inputs && Object.keys(node.inputs).length > 0 && (
                          <div>
                            <div className="text-xs font-medium mb-1">Inputs:</div>
                            <div className="space-y-1">
                              {Object.entries(node.inputs).map(([key, value]) => (
                                <div key={key} className="text-xs bg-muted p-2 rounded">
                                  <span className="font-medium">{key}:</span>{" "}
                                  <span className="font-mono">
                                    {typeof value === "string" ? value : JSON.stringify(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {node.errors && node.errors.length > 0 && (
                          <div>
                            <div className="text-xs font-medium mb-1 text-destructive">
                              Possible Errors:
                            </div>
                            <div className="space-y-1">
                              {node.errors.map((error, errorIndex) => (
                                <div key={errorIndex} className="text-xs bg-destructive/10 p-2 rounded">
                                  <span className="font-medium">{error.code}:</span>{" "}
                                  <span>{error.explain}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Step traces */}
                        {runtime?.traces.filter(t => t.stepId === node.id).map((trace, traceIndex) => (
                          <div key={traceIndex} className="text-xs bg-muted p-2 rounded">
                            <div className="flex justify-between items-center">
                              <span>Last run:</span>
                              <span className="font-mono">
                                {new Date(trace.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            {trace.latency_ms && (
                              <div className="text-muted-foreground">
                                Took {trace.latency_ms}ms
                              </div>
                            )}
                            {trace.error && (
                              <div className="text-red-600 mt-1">{trace.error}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}