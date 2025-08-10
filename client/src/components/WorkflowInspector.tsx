import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FlowScript, FlowNode, FlowRuntime } from "@shared/flowscript";
import {
  Play,
  Pause,
  Square,
  Settings,
  FileText,
  Activity,
  MessageSquare,
  HelpCircle,
  Download,
  Share,
  User,
  Cpu,
  Brain,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap
} from "lucide-react";

interface WorkflowInspectorProps {
  flow: FlowScript;
  selectedNode?: FlowNode;
  runtime?: FlowRuntime;
  onRunFlow?: (mode: "simulate" | "live") => void;
  onRunStep?: (stepId: string, mode: "simulate" | "live") => void;
  onStopFlow?: () => void;
  onExplainNode?: (nodeId: string) => void;
  onExportFlow?: (format: "json" | "mermaid") => void;
  className?: string;
}

export function WorkflowInspector({
  flow,
  selectedNode,
  runtime,
  onRunFlow,
  onRunStep,
  onStopFlow,
  onExplainNode,
  onExportFlow,
  className
}: WorkflowInspectorProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const getActorIcon = (actor: string) => {
    switch (actor) {
      case "user": return <User className="h-4 w-4" />;
      case "app": return <Cpu className="h-4 w-4" />;
      case "ai": return <Brain className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed": return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "running": return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className={`flex flex-col h-full bg-card border-l border-border ${className}`} data-testid="workflow-inspector">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">Workflow Inspector</h3>
            <p className="text-xs text-muted-foreground">{flow.title}</p>
          </div>
          {getStatusIcon(runtime?.status)}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 pt-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="step" className="text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Step
            </TabsTrigger>
            <TabsTrigger value="runtime" className="text-xs">
              <Activity className="h-3 w-3 mr-1" />
              Runtime
            </TabsTrigger>
            <TabsTrigger value="debug" className="text-xs">
              <MessageSquare className="h-3 w-3 mr-1" />
              Debug
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="overview" className="h-full mt-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {/* Flow Controls */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Flow Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onRunFlow?.("simulate")}
                        disabled={runtime?.status === "running"}
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Simulate
                      </Button>
                      <Button
                        onClick={() => onRunFlow?.("live")}
                        disabled={runtime?.status === "running"}
                        size="sm"
                        className="flex-1"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Live Run
                      </Button>
                    </div>
                    {runtime?.status === "running" && (
                      <Button
                        onClick={onStopFlow}
                        size="sm"
                        variant="destructive"
                        className="w-full"
                      >
                        <Square className="h-3 w-3 mr-1" />
                        Stop
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Flow Info */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Flow Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Description</div>
                      <p className="text-sm">{flow.description || "No description provided"}</p>
                    </div>
                    
                    <div>
                      <div className="text-xs text-muted-foreground">Steps</div>
                      <p className="text-sm">{flow.nodes.length} nodes, {flow.edges.length} connections</p>
                    </div>

                    {flow.assumptions.length > 0 && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-2">Assumptions</div>
                        <div className="space-y-1">
                          {flow.assumptions.map((assumption, index) => (
                            <div key={index} className="text-xs bg-muted p-2 rounded">
                              {assumption}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Export Options */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Export & Share</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      onClick={() => onExportFlow?.("json")}
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Export JSON
                    </Button>
                    <Button
                      onClick={() => onExportFlow?.("mermaid")}
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      <Share className="h-3 w-3 mr-1" />
                      Export Mermaid
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="step" className="h-full mt-0">
            <ScrollArea className="h-full p-4">
              {selectedNode ? (
                <div className="space-y-4">
                  {/* Step Header */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        {getActorIcon(selectedNode.actor)}
                        <div>
                          <CardTitle className="text-sm">{selectedNode.label}</CardTitle>
                          <CardDescription className="text-xs">
                            {selectedNode.type} · {selectedNode.actor}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => onRunStep?.(selectedNode.id, "simulate")}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          Test Step
                        </Button>
                        <Button
                          onClick={() => onExplainNode?.(selectedNode.id)}
                          size="sm"
                          variant="outline"
                        >
                          <HelpCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step Details */}
                  {selectedNode.tool && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Tool Configuration</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="font-mono text-xs bg-muted p-2 rounded">
                          {selectedNode.tool}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedNode.inputs && Object.keys(selectedNode.inputs).length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Inputs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {Object.entries(selectedNode.inputs).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-xs">
                              <span className="font-medium">{key}:</span>
                              <span className="text-muted-foreground font-mono">
                                {typeof value === "string" ? value : JSON.stringify(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedNode.outputs && Object.keys(selectedNode.outputs).length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Expected Outputs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {Object.entries(selectedNode.outputs).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-xs">
                              <span className="font-medium">{key}:</span>
                              <span className="text-muted-foreground">{value as string}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a step to view details</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="runtime" className="h-full mt-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {runtime && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {getStatusIcon(runtime.status)}
                        Runtime Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Status:</span>
                        <Badge variant={runtime.status === "running" ? "default" : "outline"}>
                          {runtime.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Mode:</span>
                        <Badge variant="secondary">{runtime.mode}</Badge>
                      </div>
                      {runtime.currentStep && (
                        <div className="flex justify-between text-xs">
                          <span>Current Step:</span>
                          <span className="font-mono">{runtime.currentStep}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {runtime?.traces && runtime.traces.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Execution Traces</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {runtime.traces.slice(-5).map((trace, index) => (
                          <div key={index} className="text-xs bg-muted p-2 rounded">
                            <div className="flex justify-between items-center">
                              <span className="font-mono">{trace.stepId}</span>
                              <div className="flex items-center gap-2">
                                {trace.success ? (
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 text-red-600" />
                                )}
                                {trace.latency_ms && (
                                  <span className="text-muted-foreground">
                                    {trace.latency_ms}ms
                                  </span>
                                )}
                              </div>
                            </div>
                            {trace.error && (
                              <div className="mt-1 text-red-600">{trace.error}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="debug" className="h-full mt-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Assumptions & Questions</CardTitle>
                    <CardDescription className="text-xs">
                      AI's interpretation of your workflow
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Ask questions about this workflow or provide clarifications..."
                      className="min-h-[100px] text-xs"
                    />
                    <Button size="sm" className="mt-2">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Ask AI
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Contract Validation</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>All preconditions satisfied</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>No dangling outputs detected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 text-yellow-600" />
                      <span>2 steps missing error handling</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}