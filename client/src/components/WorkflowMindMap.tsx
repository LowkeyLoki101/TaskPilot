import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Tool {
  id: string;
  type: 'youtube' | 'manual' | 'files' | 'art-generator' | 'web-search' | 'database' | 'custom';
  name: string;
  icon: any;
  description: string;
  config?: any;
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  tools: string[]; // Tool IDs assigned to this step
  completed?: boolean;
}

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
  const [showTools, setShowTools] = useState(true);
  const [showSteps, setShowSteps] = useState(false);
  const [tools, setTools] = useState<Tool[]>(defaultTools);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [draggedTool, setDraggedTool] = useState<string | null>(null);
  const [draggedStep, setDraggedStep] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);

  const addNewStep = () => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      title: `Step ${steps.length + 1}`,
      description: 'Describe what happens in this step',
      tools: []
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
  
  const addCustomTool = () => {
    const newTool: Tool = {
      id: `custom-${Date.now()}`,
      type: 'custom',
      name: 'Custom Tool',
      icon: Wrench,
      description: 'Click to configure'
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

  return (
    <div className={cn("h-full flex flex-col bg-gradient-to-br from-background to-muted/20 overflow-hidden", className)}>
      {/* Header Controls */}
      <div className="p-4 border-b border-border bg-background/95">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Workflow Orchestrator</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant={showTools ? "default" : "outline"}
              size="sm"
              onClick={() => setShowTools(!showTools)}
              data-testid="toggle-tools"
            >
              <Wrench className="h-4 w-4 mr-1" />
              Tools
            </Button>
            <Button
              variant={showSteps ? "default" : "outline"}
              size="sm"
              onClick={() => setShowSteps(!showSteps)}
              data-testid="toggle-steps"
            >
              <ArrowDown className="h-4 w-4 mr-1" />
              Steps
            </Button>
            <Button
              onClick={beginWorkflow}
              disabled={isExecuting || steps.length === 0}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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
                  Begin
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mind Map Canvas */}
      <div className="flex-1 relative overflow-auto">
        <div className="absolute inset-0 flex items-center justify-center">
          
          {/* Central Project Node */}
          <div className="relative">
            <Card className="w-48 h-32 border-2 border-primary shadow-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-bold text-lg">Project Core</h3>
                <p className="text-sm text-muted-foreground">Workflow Center</p>
              </CardContent>
            </Card>

            {/* Tools Display */}
            {showTools && (
              <div className="absolute top-full mt-8 left-1/2 transform -translate-x-1/2">
                <div className="flex flex-wrap gap-4 max-w-2xl">
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
                            if (tool.type === 'custom' && editingTool !== tool.id) {
                              setEditingTool(tool.id);
                              setToolName(tool.name);
                            }
                          }}
                        >
                          <CardContent className="p-3 text-center">
                            <IconComponent className="h-6 w-6 mx-auto mb-1 text-primary" />
                            {editingTool === tool.id ? (
                              <input
                                type="text"
                                value={toolName}
                                onChange={(e) => setToolName(e.target.value)}
                                onBlur={() => updateToolName(tool.id, toolName)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    updateToolName(tool.id, toolName);
                                  }
                                }}
                                className="text-xs font-medium bg-transparent border-b border-primary text-center w-full outline-none"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <p className="text-xs font-medium">{tool.name}</p>
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
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Workflow Steps</h4>
                    <Button onClick={addNewStep} size="sm" variant="outline">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Step
                    </Button>
                  </div>
                  
                  <ScrollArea className="h-96">
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
                                <span className="font-medium">{step.title}</span>
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
                            
                            <p className="text-sm text-muted-foreground mt-1 mb-3">
                              {step.description}
                            </p>
                            
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
    </div>
  );
}