import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MindMapFeatureCreator } from "./MindMapFeatureCreator";
import { 
  Target, 
  Plus, 
  Settings, 
  Play, 
  Youtube, 
  FileText, 
  Image, 
  Globe, 
  Database,
  Wrench,
  Brain,
  ArrowDown,
  GripVertical,
  X,
  Sparkles,
  Code,
  Send,
  File,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkflow, useWorkflowExecution } from "@/hooks/useWorkflowApi";
import { Tool as ToolType, WorkflowStep as WorkflowStepType, CreateWorkflowRequest } from "@shared/workflowTypes";
import { toast } from "@/hooks/use-toast";

// Extend the shared Tool type with UI-specific properties
interface Tool extends Omit<ToolType, 'type'> {
  type: 'youtube' | 'manual' | 'files' | 'art-generator' | 'web-search' | 'database' | 'custom' | 'builtin';
  icon: any;
}

// Use the shared WorkflowStep type directly
type WorkflowStep = WorkflowStepType;

interface WorkflowMindMapProps {
  projectId: string;
  className?: string;
}

const defaultTools: Tool[] = [
  {
    id: 'youtube-1',
    type: 'youtube',
    name: 'YouTube Research',
    icon: Youtube,
    description: 'Search and analyze YouTube videos'
  },
  {
    id: 'manual-1',
    type: 'manual',
    name: 'Product Manual',
    icon: FileText,
    description: 'Access product documentation'
  },
  {
    id: 'files-1',
    type: 'files',
    name: 'File Storage',
    icon: Database,
    description: 'Upload and manage files'
  },
  {
    id: 'art-1',
    type: 'art-generator',
    name: 'AI Art Generator',
    icon: Image,
    description: 'Create images with AI'
  },
  {
    id: 'web-1',
    type: 'web-search',
    name: 'Web Search',
    icon: Globe,
    description: 'Search the internet'
  }
];

export function WorkflowMindMap({ projectId, className }: WorkflowMindMapProps) {
  const [showTools, setShowTools] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [tools, setTools] = useState<Tool[]>(defaultTools);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [draggedTool, setDraggedTool] = useState<string | null>(null);
  const [draggedStep, setDraggedStep] = useState<string | null>(null);
  const [editingStepDesc, setEditingStepDesc] = useState<string | null>(null);
  const [stepDescription, setStepDescription] = useState<string>('');
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  
  // Use the real API hooks
  const { workflow, isLoading, saveWorkflow, executeWorkflow } = useWorkflow(projectId);
  const { execution, logs } = useWorkflowExecution(currentExecutionId);
  
  // Helper function to get icon for tool
  const getToolIcon = (tool: ToolType) => {
    switch(tool.config?.action) {
      case 'api_call': return Globe;
      case 'file_operation': return File;
      case 'ai_prompt': return Brain;
      case 'data_transform': return Code;
      case 'notification': return Bell;
      default: return Wrench;
    }
  };
  
  // Sync workflow data from API
  useEffect(() => {
    if (workflow) {
      console.log('Loading workflow from API:', workflow);
      const mappedTools = workflow.tools.map(t => ({ 
        ...t, 
        icon: getToolIcon(t), 
        type: t.type as Tool['type'] 
      })) as Tool[];
      console.log('Mapped tools:', mappedTools);
      setTools(mappedTools);
      setSteps(workflow.steps);
    }
  }, [workflow]);

  const addNewStep = () => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      name: `Step ${steps.length + 1}`,
      description: 'Describe what happens in this step',
      tools: [],
      order: steps.length
    };
    setSteps([...steps, newStep]);
  };

  const deleteStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
  };

  const addToolToStep = (stepId: string, toolId: string) => {
    setSteps(steps.map(step => 
      step.id === stepId 
        ? { ...step, tools: [...step.tools, toolId] }
        : step
    ));
  };

  const removeToolFromStep = (stepId: string, toolId: string) => {
    setSteps(steps.map(step => 
      step.id === stepId 
        ? { ...step, tools: step.tools.filter(t => t !== toolId) }
        : step
    ));
  };

  const reorderSteps = (dragIndex: number, hoverIndex: number) => {
    const draggedStep = steps[dragIndex];
    const newSteps = [...steps];
    newSteps.splice(dragIndex, 1);
    newSteps.splice(hoverIndex, 0, draggedStep);
    setSteps(newSteps);
  };

  const beginWorkflow = async () => {
    if (steps.length === 0) {
      alert('Please add some steps first');
      return;
    }

    setIsExecuting(true);
    setCurrentStep(0);
    
    // Execute step by step
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      const step = steps[i];
      
      // Show only tools for current step
      console.log(`Executing Step ${i + 1}: ${step.title}`);
      console.log('Required tools:', step.tools.map(toolId => 
        tools.find(t => t.id === toolId)?.name
      ).join(', '));
      
      // Simulate step execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSteps(prev => prev.map((s, idx) => 
        idx === i ? { ...s, completed: true } : s
      ));
    }
    
    setIsExecuting(false);
    setCurrentStep(null);
  };

  const [editingTool, setEditingTool] = useState<string | null>(null);
  const [toolName, setToolName] = useState('');
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [configuredTool, setConfiguredTool] = useState<Tool | null>(null);
  const [toolConfig, setToolConfig] = useState<Tool['config']>({
    action: 'ai_prompt'
  });
  
  const addCustomTool = () => {
    const newTool: Tool = {
      id: `custom-${Date.now()}`,
      type: 'custom',
      name: 'Custom Tool',
      icon: Wrench,
      description: 'Click to configure',
      config: { action: 'ai_prompt' }
    };
    setTools([...tools, newTool]);
    setEditingTool(newTool.id);
    setToolName(newTool.name);
  };
  
  const updateToolName = (toolId: string, newName: string) => {
    setTools(tools.map(tool => 
      tool.id === toolId ? { ...tool, name: newName } : tool
    ));
    setEditingTool(null);
  };
  
  const openToolConfig = (tool: Tool) => {
    setConfiguredTool(tool);
    setToolConfig(tool.config || { action: 'ai_prompt' });
    setShowConfigDialog(true);
  };
  
  const saveToolConfig = () => {
    if (configuredTool) {
      setTools(tools.map(tool => 
        tool.id === configuredTool.id 
          ? { ...tool, config: toolConfig, description: getToolDescription(toolConfig) }
          : tool
      ));
    }
    setShowConfigDialog(false);
  };
  
  const getToolDescription = (config?: Tool['config']) => {
    if (!config?.action) return 'Click to configure';
    switch (config.action) {
      case 'api_call':
        return `API: ${config.method || 'GET'} ${config.endpoint || 'Not configured'}`;
      case 'file_operation':
        return `File: ${config.fileOperation || 'read'} ${config.filePath || 'Not configured'}`;
      case 'ai_prompt':
        return `AI: ${config.prompt?.substring(0, 30) || 'Generate content'}...`;
      case 'data_transform':
        return 'Transform data between formats';
      case 'notification':
        return 'Send notification or alert';
      default:
        return 'Click to configure';
    }
  };
  
  const getActionIcon = (action?: string) => {
    switch (action) {
      case 'api_call': return Globe;
      case 'file_operation': return File;
      case 'ai_prompt': return Brain;
      case 'data_transform': return Code;
      case 'notification': return Bell;
      default: return Wrench;
    }
  };

  return (
    <div className={cn("h-full flex flex-col bg-gradient-to-br from-background to-muted/20", className)}>
      {/* Header Controls */}
      <div className="p-4 border-b border-border bg-background/95">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Workflow Orchestrator</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Click "Tools" to see available tools • Click "Steps" to build your workflow
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={showTools ? "default" : "outline"}
              size="sm"
              onClick={() => {
                console.log('Tools button clicked! Current state:', showTools);
                setShowTools(!showTools);
              }}
              data-testid="toggle-tools"
              className="font-medium"
            >
              <Wrench className="h-4 w-4 mr-1" />
              Tools {showTools ? '(Hide)' : '(Show)'}
            </Button>
            <Button
              variant={showSteps ? "default" : "outline"}
              size="sm"
              onClick={() => {
                console.log('Steps button clicked! Current state:', showSteps);
                setShowSteps(!showSteps);
              }}
              data-testid="toggle-steps"
              className="font-medium"
            >
              <ArrowDown className="h-4 w-4 mr-1" />
              Steps {showSteps ? '(Hide)' : '(Show)'}
            </Button>
            <Button
              onClick={() => {
                console.log('Begin workflow clicked! Steps length:', steps.length);
                beginWorkflow();
              }}
              disabled={isExecuting || steps.length === 0}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-medium"
              data-testid="begin-workflow"
            >
              {isExecuting ? (
                <>
                  <Sparkles className="h-4 w-4 mr-1 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  {steps.length === 0 ? 'Add Steps First' : 'Begin Workflow'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mind Map Canvas */}
      <div className="flex-1 relative overflow-auto">
        <div className="absolute inset-0 flex items-center justify-center min-h-full p-8">
          
          {/* Central Project Node */}
          <div className="relative">
            <Card 
              className="w-48 h-32 border-2 border-primary shadow-xl bg-gradient-to-br from-primary/20 to-primary/5 cursor-pointer hover:shadow-2xl transition-all transform hover:scale-105"
              onClick={() => {
                console.log('Project core clicked!');
                if (!showTools && !showSteps) {
                  setShowTools(true);
                }
              }}
              data-testid="project-core"
            >
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-bold text-lg">Project Core</h3>
                <p className="text-xs text-muted-foreground">
                  {showTools || showSteps ? 'Workflow Active' : 'Click to start →'}
                </p>
              </CardContent>
            </Card>

            {/* Tools Display */}
            {showTools && (
              <div className="absolute top-full mt-8 left-1/2 transform -translate-x-1/2">
                <div className="relative">
                  <p className="text-xs text-center mb-4 text-muted-foreground">
                    Available Tools ({tools.length})
                  </p>
                  {tools.map((tool, index) => {
                    const angle = (index * 60) - 90; // Spread tools in arc
                    const radius = 200;
                    const x = Math.cos(angle * Math.PI / 180) * radius;
                    const y = Math.sin(angle * Math.PI / 180) * radius;
                    
                    const IconComponent = tool.icon;
                    
                    return (
                      <div
                        key={tool.id}
                        className="absolute"
                        style={{
                          left: x,
                          top: y,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <Card 
                          className="w-32 h-24 cursor-pointer hover:shadow-lg transition-all border-muted-foreground/20 hover:border-primary/50"
                          draggable={editingTool !== tool.id}
                          onDragStart={() => setDraggedTool(tool.id)}
                          onDragEnd={() => setDraggedTool(null)}
                          onClick={() => {
                            if (tool.type === 'custom') {
                              if (editingTool === tool.id) {
                                // If already editing name, save and open config
                                updateToolName(tool.id, toolName);
                                openToolConfig(tool);
                              } else {
                                // Start editing name
                                setEditingTool(tool.id);
                                setToolName(tool.name);
                              }
                            }
                          }}
                          onDoubleClick={() => {
                            if (tool.type === 'custom') {
                              openToolConfig(tool);
                            }
                          }}
                        >
                          <CardContent className="p-3 text-center">
                            {tool.config?.action ? (
                              React.createElement(getActionIcon(tool.config.action), {
                                className: "h-6 w-6 mx-auto mb-1 text-primary"
                              })
                            ) : (
                              <IconComponent className="h-6 w-6 mx-auto mb-1 text-primary" />
                            )}
                            {editingTool === tool.id ? (
                              <input
                                type="text"
                                value={toolName}
                                onChange={(e) => setToolName(e.target.value)}
                                onBlur={() => updateToolName(tool.id, toolName)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    updateToolName(tool.id, toolName);
                                    openToolConfig(tool);
                                  }
                                }}
                                className="text-xs font-medium bg-transparent border-b border-primary text-center w-full outline-none"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <>
                                <p className="text-xs font-medium">{tool.name}</p>
                                {tool.type === 'custom' && (
                                  <p className="text-[10px] text-muted-foreground mt-1 truncate">
                                    {tool.description}
                                  </p>
                                )}
                              </>
                            )}
                          </CardContent>
                        </Card>
                        
                        {/* Connection line to center */}
                        <svg className="absolute inset-0 pointer-events-none" style={{ 
                          width: Math.abs(x) + 100, 
                          height: Math.abs(y) + 50,
                          left: x > 0 ? -x : 0,
                          top: y > 0 ? -y : 0
                        }}>
                          <line
                            x1={x > 0 ? x : Math.abs(x)}
                            y1={y > 0 ? y : Math.abs(y)}
                            x2={x > 0 ? Math.abs(x) : x}
                            y2={y > 0 ? Math.abs(y) : y}
                            stroke="rgb(var(--primary))"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            opacity="0.3"
                          />
                        </svg>
                      </div>
                    );
                  })}
                  
                  {/* Add Tool Button */}
                  <Button
                    onClick={addCustomTool}
                    variant="outline"
                    size="sm"
                    className="absolute -bottom-16 left-1/2 transform -translate-x-1/2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Tool
                  </Button>
                </div>
              </div>
            )}

            {/* Steps Display */}
            {showSteps && (
              <div className="absolute left-full ml-8 top-1/2 transform -translate-y-1/2">
                <div className="w-80">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Workflow Steps ({steps.length})</h4>
                      <Button onClick={addNewStep} size="sm">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Step
                      </Button>
                    </div>
                    {steps.length === 0 && (
                      <p className="text-xs text-muted-foreground">Click "Add Step" to build your workflow</p>
                    )}
                  </div>
                  
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {steps.map((step, index) => (
                        <Card 
                          key={step.id}
                          className={cn(
                            "border-l-4 transition-all",
                            currentStep === index 
                              ? "border-l-green-500 bg-green-50 dark:bg-green-950/20" 
                              : step.completed 
                                ? "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20"
                                : "border-l-muted-foreground/20"
                          )}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedTool) {
                              addToolToStep(step.id, draggedTool);
                              setDraggedTool(null);
                            }
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-2">
                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                <Badge variant="outline" className="text-xs">
                                  {index + 1}
                                </Badge>
                                <span className="font-medium">{step.name || step.title}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteStep(step.id)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            {editingStepDesc === step.id ? (
                              <Input
                                type="text"
                                value={stepDescription}
                                onChange={(e) => setStepDescription(e.target.value)}
                                onBlur={() => {
                                  setSteps(steps.map(s => 
                                    s.id === step.id 
                                      ? { ...s, description: stepDescription }
                                      : s
                                  ));
                                  setEditingStepDesc(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    setSteps(steps.map(s => 
                                      s.id === step.id 
                                        ? { ...s, description: stepDescription }
                                        : s
                                    ));
                                    setEditingStepDesc(null);
                                  }
                                }}
                                className="text-sm mt-1 mb-3"
                                placeholder="Describe what happens in this step"
                                autoFocus
                              />
                            ) : (
                              <p 
                                className="text-sm text-muted-foreground mt-1 mb-3 cursor-pointer hover:text-foreground"
                                onClick={() => {
                                  setEditingStepDesc(step.id);
                                  setStepDescription(step.description);
                                }}
                              >
                                {step.description || 'Click to describe what happens in this step'}
                              </p>
                            )}
                            
                            {/* Assigned Tools */}
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                Required Tools:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {step.tools.map(toolId => {
                                  const tool = tools.find(t => t.id === toolId);
                                  if (!tool) return null;
                                  
                                  const IconComponent = tool.icon;
                                  return (
                                    <Badge 
                                      key={toolId}
                                      variant="secondary"
                                      className="text-xs flex items-center gap-1"
                                    >
                                      <IconComponent className="h-3 w-3" />
                                      {tool.name}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeToolFromStep(step.id, toolId)}
                                        className="h-4 w-4 p-0 ml-1"
                                      >
                                        <X className="h-2 w-2" />
                                      </Button>
                                    </Badge>
                                  );
                                })}
                                {step.tools.length === 0 && (
                                  <span className="text-xs text-muted-foreground italic">
                                    Drag tools here
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Control Panel */}
      <div className="p-4 border-t border-border bg-background/95">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-medium">GPT-5 Assistant</span>
            <Badge variant="outline" className="text-xs">
              Ready to orchestrate
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Globe className="h-3 w-3 mr-1" />
              Web Search
            </Button>
            <Button variant="outline" size="sm">
              <Image className="h-3 w-3 mr-1" />
              Generate Image
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-3 w-3 mr-1" />
              Knowledge Base
            </Button>
          </div>
        </div>
      </div>

      {/* Tool Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Tool: {configuredTool?.name}</DialogTitle>
            <DialogDescription>
              Define what this tool does and how it integrates with your workflow
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="action">Tool Action</Label>
              <Select 
                value={toolConfig?.action} 
                onValueChange={(value) => setToolConfig({...toolConfig, action: value as any})}
              >
                <SelectTrigger id="action">
                  <SelectValue placeholder="Select an action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai_prompt">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      AI Content Generation
                    </div>
                  </SelectItem>
                  <SelectItem value="api_call">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      API Call
                    </div>
                  </SelectItem>
                  <SelectItem value="file_operation">
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4" />
                      File Operation
                    </div>
                  </SelectItem>
                  <SelectItem value="data_transform">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Data Transformation
                    </div>
                  </SelectItem>
                  <SelectItem value="notification">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Send Notification
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* AI Prompt Configuration */}
            {toolConfig?.action === 'ai_prompt' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prompt">AI Prompt Template</Label>
                  <Textarea
                    id="prompt"
                    value={toolConfig.prompt || ''}
                    onChange={(e) => setToolConfig({...toolConfig, prompt: e.target.value})}
                    placeholder="Example: Generate a professional flyer for {{product_name}} featuring {{key_features}}"
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use {`{{variable}}`} for dynamic content that will be filled during workflow execution
                  </p>
                </div>
              </div>
            )}

            {/* API Configuration */}
            {toolConfig?.action === 'api_call' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="endpoint">API Endpoint</Label>
                  <Input
                    id="endpoint"
                    value={toolConfig.endpoint || ''}
                    onChange={(e) => setToolConfig({...toolConfig, endpoint: e.target.value})}
                    placeholder="https://api.example.com/endpoint"
                  />
                </div>
                <div>
                  <Label htmlFor="method">HTTP Method</Label>
                  <Select 
                    value={toolConfig.method || 'GET'} 
                    onValueChange={(value) => setToolConfig({...toolConfig, method: value})}
                  >
                    <SelectTrigger id="method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="body">Request Body (JSON)</Label>
                  <Textarea
                    id="body"
                    value={toolConfig.body || ''}
                    onChange={(e) => setToolConfig({...toolConfig, body: e.target.value})}
                    placeholder='{"key": "value"}'
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            )}

            {/* File Operation Configuration */}
            {toolConfig?.action === 'file_operation' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fileOp">Operation Type</Label>
                  <Select 
                    value={toolConfig.fileOperation || 'read'} 
                    onValueChange={(value) => setToolConfig({...toolConfig, fileOperation: value as any})}
                  >
                    <SelectTrigger id="fileOp">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Read File</SelectItem>
                      <SelectItem value="write">Write File</SelectItem>
                      <SelectItem value="delete">Delete File</SelectItem>
                      <SelectItem value="copy">Copy File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="filePath">File Path</Label>
                  <Input
                    id="filePath"
                    value={toolConfig.filePath || ''}
                    onChange={(e) => setToolConfig({...toolConfig, filePath: e.target.value})}
                    placeholder="/path/to/file.txt"
                  />
                </div>
              </div>
            )}

            {/* Output Variable */}
            <div>
              <Label htmlFor="output">Output Variable Name</Label>
              <Input
                id="output"
                value={toolConfig?.outputVariable || ''}
                onChange={(e) => setToolConfig({...toolConfig, outputVariable: e.target.value})}
                placeholder="result_data"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This variable will be available to subsequent tools in the workflow
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveToolConfig}>
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Interactive Guide Overlay */}
      {showGuide && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-96 max-w-[90vw]">
            <CardContent className="p-6 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-bold mb-3">Welcome to Workflow Orchestrator!</h3>
              <div className="space-y-2 text-sm text-left">
                <p className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary" />
                  <span><strong>Tools:</strong> Click to see available workflow tools</span>
                </p>
                <p className="flex items-center gap-2">
                  <ArrowDown className="h-4 w-4 text-primary" />
                  <span><strong>Steps:</strong> Click to build your workflow sequence</span>
                </p>
                <p className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span><strong>Project Core:</strong> Central hub - click to activate</span>
                </p>
              </div>
              <Button 
                onClick={() => setShowGuide(false)}
                className="mt-4 w-full"
                data-testid="close-guide"
              >
                Got it! Let's start
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}