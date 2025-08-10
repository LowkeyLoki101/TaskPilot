import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MindMap from "@/components/MindMap";
import TaskDetailPanel from "@/components/TaskDetailPanel";
import VoiceModal from "@/components/VoiceModal";
import { ChatPane } from "@/components/ChatPane";
import { InspectorPane } from "@/components/InspectorPane";
import { QuickCaptureButton } from "@/components/QuickCaptureButton";
import { MobileNav } from "@/components/MobileNav";
import { StepRunner } from "@/components/StepRunner";
import { CommandPalette } from "@/components/CommandPalette";
import { TraceCanvas } from "@/components/TraceCanvas";
import { WorkflowInspector } from "@/components/WorkflowInspector";
import { WorkflowStepRunner } from "@/components/WorkflowStepRunner";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useVoice } from "@/hooks/useVoice";
import { useWorkflow } from "@/hooks/useWorkflow";
import { useMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Sparkles, Calendar, Inbox, CheckCircle, Clock, User, Workflow, Mic } from "lucide-react";

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<'mindmap' | 'list' | 'calendar'>('mindmap');
  const [mobileTab, setMobileTab] = useState<'today' | 'inbox' | 'projects'>('today');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isStepRunnerOpen, setIsStepRunnerOpen] = useState(false);
  const [currentProjectId] = useState("default-project");
  const [workflowMode, setWorkflowMode] = useState(false); // Toggle between tasks and workflows
  
  const isMobile = useMobile();

  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    processVoiceCommand 
  } = useVoice();

  const {
    currentWorkflow,
    selectedNodeId,
    runtime,
    generateWorkflow,
    executeWorkflow,
    executeStep,
    selectNode,
    loadWorkflow,
    exportWorkflow,
    isGenerating,
    isExecuting
  } = useWorkflow();

  // Load a sample workflow for demonstration
  const loadSampleWorkflow = async () => {
    const { getRandomSampleWorkflow } = await import("@shared/sampleWorkflows");
    const sampleWorkflow = getRandomSampleWorkflow();
    loadWorkflow(sampleWorkflow);
  };

  useWebSocket(currentProjectId);

  // Voice command with workflow integration
  const handleVoiceCommand = async (transcript: string) => {
    if (workflowMode) {
      // Generate workflow from voice input
      generateWorkflow({ 
        userInput: transcript, 
        projectId: currentProjectId 
      });
    } else {
      // Process as regular voice command
      await processVoiceCommand(transcript, currentProjectId);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette (Cmd/Ctrl + K)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      
      // Toggle workflow mode (Cmd/Ctrl + W)
      if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault();
        setWorkflowMode(!workflowMode);
      }
      
      // Escape to close modals
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsStepRunnerOpen(false);
        setIsVoiceModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Mock data for demonstration
  const todayTasks = [
    {
      id: "task-1",
      title: "Review design mockups",
      status: "todo" as const,
      priority: "high" as const,
      dueDate: new Date().toISOString(),
      assignee: "You",
      tags: ["design", "review"],
      steps: [
        { id: "step-1", title: "Open Figma file", completed: false, actionType: "link" as const, actionData: { url: "https://figma.com" } },
        { id: "step-2", title: "Review layout designs", completed: false },
        { id: "step-3", title: "Provide feedback", completed: false, actionType: "email" as const, actionData: { email: "designer@company.com", message: "Feedback on mockups" } }
      ]
    },
    {
      id: "task-2", 
      title: "Call client about project timeline",
      status: "in-progress" as const,
      priority: "medium" as const,
      dueDate: new Date().toISOString(),
      assignee: "You",
      tags: ["client", "call"],
      steps: [
        { id: "step-4", title: "Prepare talking points", completed: true },
        { id: "step-5", title: "Call client", completed: false, actionType: "call" as const, actionData: { phone: "+1234567890" } },
        { id: "step-6", title: "Update project timeline", completed: false }
      ]
    }
  ];

  const inboxTasks = [
    {
      id: "task-3",
      title: "Set up new project repository",
      status: "todo" as const,
      priority: "low" as const,
      tags: ["setup", "git"],
      steps: []
    }
  ];

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      setIsVoiceModalOpen(false);
    } else {
      setIsVoiceModalOpen(true);
      startListening();
    }
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
    if (isMobile) {
      setIsStepRunnerOpen(true);
    }
  };

  const handleCloseTaskPanel = () => {
    setSelectedTaskId(null);
  };

  const handleTaskComplete = (taskId: string) => {
    console.log("Task completed:", taskId);
    setIsStepRunnerOpen(false);
    setSelectedTaskId(null);
  };

  const handleStepComplete = (taskId: string, stepId: string) => {
    console.log("Step completed:", taskId, stepId);
  };

  const handleTaskCreate = (task: { title: string; tags: string[]; priority: string }) => {
    console.log("Creating task:", task);
    // TODO: Implement task creation
  };

  const handleCommand = (commandId: string) => {
    console.log("Executing command:", commandId);
    // TODO: Implement command actions
    switch (commandId) {
      case "go-today":
        setMobileTab("today");
        break;
      case "go-inbox":
        setMobileTab("inbox");
        break;
      case "go-projects":
        setMobileTab("projects");
        break;
      // Add more command handlers
    }
  };

  const getCurrentTasks = () => {
    switch (mobileTab) {
      case "today": return todayTasks;
      case "inbox": return inboxTasks;
      case "projects": return [];
      default: return [];
    }
  };

  const selectedTask = todayTasks.concat(inboxTasks).find(task => task.id === selectedTaskId) || null;

  // Responsive layout based on screen size
  if (isMobile) {
    return (
      <div className="h-screen bg-background text-foreground font-inter">
        <Header 
          onVoiceToggle={handleVoiceToggle}
          isVoiceActive={isListening}
        />
        
        {/* Mobile Content */}
        <div className="h-[calc(100vh-4rem-4rem)] overflow-hidden">
          {mobileTab === 'today' && (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Today</h2>
                    <p className="text-sm text-muted-foreground">{todayTasks.length} tasks</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date().toLocaleDateString()}
                  </Badge>
                </div>
              </div>

              {/* Task List */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {todayTasks.map((task) => (
                    <Card 
                      key={task.id}
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => handleTaskSelect(task.id)}
                      data-testid={`task-card-${task.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium text-sm leading-tight">{task.title}</h3>
                            <Badge 
                              variant={task.priority === "high" ? "destructive" : "outline"}
                              className="text-xs ml-2 shrink-0"
                            >
                              {task.priority}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              <span>{task.steps.filter(s => s.completed).length}/{task.steps.length}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Due today</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{task.assignee}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {task.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {mobileTab === 'inbox' && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold">Inbox</h2>
                <p className="text-sm text-muted-foreground">{inboxTasks.length} new tasks</p>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {inboxTasks.map((task) => (
                    <Card key={task.id} className="cursor-pointer" onClick={() => handleTaskSelect(task.id)}>
                      <CardContent className="p-4">
                        <h3 className="font-medium text-sm">{task.title}</h3>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {mobileTab === 'projects' && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold">Projects</h2>
              </div>
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Projects view coming soon</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <MobileNav 
          currentTab={mobileTab}
          onTabChange={setMobileTab}
          todayCount={todayTasks.length}
          inboxCount={inboxTasks.length}
        />

        {/* Quick Capture Button */}
        <QuickCaptureButton onTaskCreate={handleTaskCreate} />

        {/* Step Runner */}
        <StepRunner
          task={selectedTask}
          isOpen={isStepRunnerOpen}
          onClose={() => setIsStepRunnerOpen(false)}
          onStepComplete={handleStepComplete}
          onTaskComplete={handleTaskComplete}
        />

        {/* Voice Modal */}
        {isVoiceModalOpen && (
          <VoiceModal
            isListening={isListening}
            transcript={transcript}
            onClose={() => setIsVoiceModalOpen(false)}
            onStop={stopListening}
            onProcess={() => handleVoiceCommand(transcript)}
          />
        )}
      </div>
    );
  }

  // Desktop Layout - Three Pane System
  return (
    <div className="h-screen bg-background text-foreground font-inter">
      <Header 
        onVoiceToggle={handleVoiceToggle}
        isVoiceActive={isListening}
      />
      
      {/* Desktop Three-Pane Layout */}
      <div className="h-[calc(100vh-4rem)] grid grid-cols-1 md:grid-cols-[360px,1fr] lg:grid-cols-[360px,1fr,360px]">
        {/* Left Pane - Chat (hidden on mobile, visible on md+) */}
        <ChatPane 
          projectId={currentProjectId}
          className="hidden md:flex"
        />

        {/* Center Pane - Canvas */}
        <div className="flex flex-col min-w-0 bg-background">
          {/* Toolbar */}
          <div className="bg-card border-b border-border p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-foreground">My Task Board</h2>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>3 collaborators online</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWorkflowMode(!workflowMode)}
                  className="hidden lg:flex"
                >
                  <Workflow className="h-4 w-4 mr-1" />
                  {workflowMode ? "Tasks" : "Workflows"}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCommandPaletteOpen(true)}
                  className="hidden lg:flex"
                >
                  <span className="text-xs">⌘K</span>
                </Button>
                
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  data-testid="button-add-task"
                >
                  {workflowMode ? "Create Workflow" : "Add Task"}
                </Button>
              </div>
            </div>
          </div>

          {/* Canvas Content */}
          <div className="flex-1 relative overflow-hidden">
            {workflowMode ? (
              currentWorkflow ? (
                <TraceCanvas
                  flow={currentWorkflow}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={selectNode}
                  className="h-full"
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
                  <div className="text-center max-w-md mx-auto p-8">
                    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                      <Workflow className="h-16 w-16 mx-auto mb-4" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-foreground">Workflow Composer</h3>
                    <p className="text-muted-foreground mb-6">
                      Speak or type a workflow to see it come to life as an interactive graph
                    </p>
                    <div className="space-y-3">
                      <Button 
                        onClick={() => loadSampleWorkflow()}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Workflow className="h-4 w-4 mr-2" />
                            Load Sample Workflow
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={() => setIsVoiceModalOpen(true)}
                        variant="outline"
                        className="w-full"
                        disabled={isGenerating}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Create Custom Workflow
                      </Button>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <>
                {currentView === 'mindmap' && (
                  <MindMap 
                    projectId={currentProjectId}
                    onTaskSelect={handleTaskSelect}
                  />
                )}
                {currentView === 'list' && (
                  <div className="p-8 text-center text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>List view coming soon...</p>
                  </div>
                )}
                {currentView === 'calendar' && (
                  <div className="p-8 text-center text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Calendar view coming soon...</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Pane - Inspector (hidden on mobile and md, visible on lg+) */}
        {workflowMode && currentWorkflow ? (
          <WorkflowInspector
            flow={currentWorkflow}
            selectedNode={currentWorkflow.nodes.find(n => n.id === selectedNodeId)}
            runtime={runtime}
            onRunFlow={(mode) => executeWorkflow({ workflow: currentWorkflow, mode })}
            onRunStep={(stepId, mode) => executeStep({ workflow: currentWorkflow, stepId, mode })}
            onExportFlow={exportWorkflow}
            className="hidden lg:flex"
          />
        ) : (
          <InspectorPane 
            selectedTaskId={selectedTaskId}
            className="hidden lg:flex"
          />
        )}

        {/* Sidebar for view switching */}
        <Sidebar 
          currentView={currentView}
          onViewChange={setCurrentView}
          projectId={currentProjectId}
        />
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onCommand={handleCommand}
      />

      {/* Task Detail Panel (for selected tasks on desktop) */}
      {selectedTaskId && !isMobile && (
        <TaskDetailPanel
          taskId={selectedTaskId}
          onClose={handleCloseTaskPanel}
        />
      )}

      {/* Voice Modal */}
      {isVoiceModalOpen && (
        <VoiceModal
          isListening={isListening}
          transcript={transcript}
          onClose={() => setIsVoiceModalOpen(false)}
          onStop={stopListening}
          onProcess={() => handleVoiceCommand(transcript)}
        />
      )}
    </div>
  );
}
