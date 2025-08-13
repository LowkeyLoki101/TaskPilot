import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";

import MindMap from "@/components/MindMap";
import { WorkflowMindMap } from "@/components/WorkflowMindMap";
import TaskDetailPanel from "@/components/TaskDetailPanel";
import VoiceModal from "@/components/VoiceModal";
// ChatPane now integrated into InspectorPane
import { InspectorPane } from "@/components/InspectorPane";
import { FeatureRequestPanel } from "@/components/FeatureRequestPanel";
import { DiagnosticsPanel } from "@/components/DiagnosticsPanel";
import { TaskListView } from "@/components/TaskListView";
import { QuickCaptureButton } from "@/components/QuickCaptureButton";
import { MobileNav } from "@/components/MobileNav";
import { StepRunner } from "@/components/StepRunner";
import { CommandPalette } from "@/components/CommandPalette";
import { TraceCanvas } from "@/components/TraceCanvas";
import { WorkflowInspector } from "@/components/WorkflowInspector";
import { WorkflowStepRunner } from "@/components/WorkflowStepRunner";
import CalendarView from "@/components/CalendarView";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useVoice } from "@/hooks/useVoice";
import { useWorkflow } from "@/hooks/useWorkflow";
import { useMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Sparkles, Calendar, Inbox, CheckCircle, Clock, User, Workflow, Mic, Monitor, Youtube, Bell, Bug, Globe, BarChart3, Settings, Plus, Search, Download } from "lucide-react";
import logoPath from "@assets/Emergent Transparent Logo_1755110400429.png";
import { Switch } from "@/components/ui/switch";

export default function Dashboard() {

  const [currentModule, setCurrentModule] = useState<'mindmap' | 'calendar' | 'tasks' | 'browser' | 'media' | 'diagnostics'>('mindmap');
  const [mobileTab, setMobileTab] = useState<'today' | 'inbox' | 'projects'>('today');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isStepRunnerOpen, setIsStepRunnerOpen] = useState(false);
  const [currentProjectId] = useState("default-project");
  const [workflowMode, setWorkflowMode] = useState(false); // Toggle between tasks and workflows
  const [autonomyMode, setAutonomyMode] = useState<'manual' | 'semi' | 'full'>('manual');
  const [lastMaintenanceRun, setLastMaintenanceRun] = useState<Date | null>(null);
  
  const isMobile = useMobile();
  const queryClient = useQueryClient();

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

  // Comprehensive Diagnostic System - runs immediately when toggled to full autonomy
  useEffect(() => {
    if (autonomyMode === 'full') {
      console.log('🔍 FULL AUTONOMY ACTIVATED - Running comprehensive diagnostic check...');
      runComprehensiveDiagnostic();
    }
  }, [autonomyMode]);

  // Autonomous AI maintenance loop
  useEffect(() => {
    if (autonomyMode === 'manual') return;
    
    const interval = setInterval(() => {
      runMaintenanceCheck();
    }, autonomyMode === 'full' ? 30000 : 60000); // 30s for full, 60s for semi
    
    return () => clearInterval(interval);
  }, [autonomyMode]);

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

  // Real AI Activity Tracking - fetches actual system activities
  const { data: aiActivityLog = [], refetch: refetchActivity } = useQuery({
    queryKey: ['/api/activity'],
    queryFn: async () => {
      const response = await fetch('/api/activity?limit=50');
      if (!response.ok) throw new Error('Failed to fetch activity log');
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Real AI Maintenance and Autonomous Functions
  const runMaintenanceCheck = async () => {
    console.log('Running autonomous maintenance check...');
    
    try {
      // Check system health endpoints
      const healthCheck = await fetch('/api/health');
      if (healthCheck.ok) {
        console.log('✅ System health check passed');
      }

      // In full autonomy mode, perform proactive AI actions
      if (autonomyMode === 'full') {
        await performAutonomousActions();
      }

      // Refresh activity log to show latest real data
      refetchActivity();

      // Update last maintenance timestamp
      setLastMaintenanceRun(new Date());
      
      console.log('🔄 Maintenance cycle completed at', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('❌ Maintenance cycle failed:', error);
    }
  };

  // Comprehensive Diagnostic System - runs immediately on full autonomy toggle
  const runComprehensiveDiagnostic = async () => {
    try {
      console.log('🔍 Running comprehensive workstation diagnostic...');
      
      // Call the comprehensive diagnostic endpoint
      const response = await fetch('/api/comprehensive-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: currentProjectId,
          workstationState: {
            currentModule,
            workflowMode,
            selectedTaskId,
            lastMaintenanceRun,
            activeConnections: true,
            systemUptime: performance.now()
          },
          toolsInventory: {
            voice: isListening,
            workflows: currentWorkflow !== null,
            websocket: true,
            ai: true,
            storage: true
          }
        })
      });

      if (response.ok) {
        const diagnostic = await response.json();
        console.log('📊 Comprehensive diagnostic completed:', diagnostic);
        
        // Log diagnostic results
        const activity = {
          id: crypto.randomUUID(),
          action: `🔍 System Diagnostic: ${diagnostic.status} - ${diagnostic.recommendations?.length || 0} recommendations`,
          timestamp: new Date(),
          type: 'maintenance' as const,
          time: new Date().toLocaleTimeString()
        };

        queryClient.setQueryData(['/api/activity'], (oldData: any[]) => [
          activity, 
          ...(oldData || []).slice(0, 19)
        ]);

        // Schedule AI tasks based on findings
        if (diagnostic.schedule && diagnostic.schedule.length > 0) {
          scheduleAITasks(diagnostic.schedule);
        }

        // Update AI logbook with findings
        updateAILogbook(diagnostic.findings);
      }
    } catch (error) {
      console.error('❌ Comprehensive diagnostic failed:', error);
    }
  };

  const performAutonomousActions = async () => {
    try {
      console.log('🤖 Performing autonomous AI actions...');
      
      // Generate AI suggestions and improvements
      const response = await fetch('/api/autonomous-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: currentProjectId,
          autonomyLevel: 'full',
          context: {
            currentModule,
            workflowMode,
            recentActivity: aiActivityLog.slice(0, 5).map((a: any) => ({
              action: a.action,
              type: a.type,
              timestamp: a.timestamp
            }))
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🤖 Autonomous actions generated:', result.actions?.length || 0);
        
        // Execute autonomous actions with staggered timing
        result.actions?.forEach((action: any, index: number) => {
          setTimeout(() => {
            console.log(`🤖 Executing: ${action.description}`);
            
            // Log the autonomous action
            const activity = {
              id: crypto.randomUUID(),
              action: `🤖 ${action.description}`,
              timestamp: new Date(),
              type: (action.type || 'enhancement') as 'maintenance' | 'enhancement' | 'bug' | 'task',
              time: new Date().toLocaleTimeString()
            };
            
            // Update the React Query cache with the new activity
            queryClient.setQueryData(['/api/activity'], (oldData: any[]) => [
              activity, 
              ...(oldData || []).slice(0, 19)
            ]);
            
            // Execute the actual action if needed
            if (action.execute && typeof window !== 'undefined') {
              try {
                // This would execute AI-generated improvements
                console.log(`Executing action: ${action.type}`);
              } catch (error) {
                console.error('Action execution failed:', error);
              }
            }
          }, index * 3000); // Stagger actions every 3 seconds
        });
      }
    } catch (error) {
      console.error('❌ Autonomous actions failed:', error);
    }
  };

  // AI Scheduling System
  const scheduleAITasks = (scheduledTasks: any[]) => {
    console.log('📅 Scheduling AI tasks:', scheduledTasks);
    scheduledTasks.forEach((task, index) => {
      setTimeout(() => {
        const activity = {
          id: crypto.randomUUID(),
          action: `📅 Scheduled: ${task.description}`,
          timestamp: new Date(),
          type: 'task' as const,
          time: new Date().toLocaleTimeString()
        };
        
        queryClient.setQueryData(['/api/activity'], (oldData: any[]) => [
          activity, 
          ...(oldData || []).slice(0, 19)
        ]);
      }, task.delay || (index * 5000)); // Default 5s delay between scheduled tasks
    });
  };

  // AI Logbook System
  const updateAILogbook = (findings: any) => {
    console.log('📝 Updating AI logbook with findings:', findings);
    const logbookEntry = {
      id: crypto.randomUUID(),
      action: `📝 Logbook: ${findings.summary || 'System analysis completed'}`,
      timestamp: new Date(),
      type: 'enhancement' as const,
      time: new Date().toLocaleTimeString(),
      findings: findings
    };
    
    queryClient.setQueryData(['/api/activity'], (oldData: any[]) => [
      logbookEntry, 
      ...(oldData || []).slice(0, 19)
    ]);
  };

  const getAutonomyColor = () => {
    switch (autonomyMode) {
      case 'full': return 'text-green-500';
      case 'semi': return 'text-yellow-500';
      case 'manual': return 'text-gray-500';
    }
  };

  const getAutonomyLabel = () => {
    switch (autonomyMode) {
      case 'full': return 'Fully Autonomous';
      case 'semi': return 'Semi-Autonomous';
      case 'manual': return 'Manual';
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
      
      {/* Desktop Two-Pane Layout - Workspace + Inspector */}
      <div className="h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-[1fr,400px]">

        {/* Center Pane - Canvas */}
        <div className="flex flex-col min-w-0 bg-background">
          {/* Autonomous AI Workstation Toolbar */}
          <div className="bg-card border-b border-border p-3">
            <div className="flex justify-between items-center">
              {/* Left Section - Title and AI Status */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <img 
                    src={logoPath} 
                    alt="Emergent Intelligence" 
                    className="h-8 object-contain"
                    style={{ 
                      filter: 'invert(1) brightness(0) saturate(100%) contrast(1.2)'
                    }}
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${autonomyMode === 'full' ? 'bg-green-400 animate-pulse' : autonomyMode === 'semi' ? 'bg-yellow-400' : 'bg-gray-400'}`}></div>
                    <span className={`text-xs ${getAutonomyColor()}`}>{getAutonomyLabel()}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    GPT-5 Active
                  </Badge>
                </div>
              </div>

              {/* Center Section - Module Selector */}
              <div className="flex items-center space-x-1">
                {!workflowMode && (
                  <div className="flex items-center border rounded-lg p-1 bg-muted/50">
                    <Button
                      variant={currentModule === 'mindmap' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentModule('mindmap')}
                      className="h-7 px-2"
                      data-testid="module-mindmap"
                    >
                      <Brain className="h-3 w-3 mr-1" />
                      Mind Map
                    </Button>
                    <Button
                      variant={currentModule === 'calendar' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentModule('calendar')}
                      className="h-7 px-2"
                      data-testid="module-calendar"
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Calendar
                    </Button>
                    <Button
                      variant={currentModule === 'tasks' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentModule('tasks')}
                      className="h-7 px-2"
                      data-testid="module-tasks"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Tasks
                    </Button>
                    <Button
                      variant={currentModule === 'browser' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentModule('browser')}
                      className="h-7 px-2"
                      data-testid="module-browser"
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      Browser
                    </Button>
                    <Button
                      variant={currentModule === 'diagnostics' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentModule('diagnostics')}
                      className="h-7 px-2"
                      data-testid="module-diagnostics"
                    >
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Debug
                    </Button>
                  </div>
                )}
              </div>

              {/* Right Section - Controls and Autonomy Toggle */}
              <div className="flex items-center space-x-3">
                {/* Autonomy Toggle */}
                <div className="flex items-center space-x-2 border rounded-lg p-2 bg-muted/30">
                  <label className="text-xs font-medium">Autonomy:</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAutonomyMode(autonomyMode === 'manual' ? 'semi' : autonomyMode === 'semi' ? 'full' : 'manual')}
                    className={`h-6 px-2 text-xs ${getAutonomyColor()}`}
                    data-testid="autonomy-toggle"
                  >
                    {autonomyMode === 'full' ? 'Full' : autonomyMode === 'semi' ? 'Semi' : 'Manual'}
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWorkflowMode(!workflowMode)}
                  className="hidden lg:flex h-7"
                >
                  <Workflow className="h-3 w-3 mr-1" />
                  {workflowMode ? "Tasks" : "Workflows"}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={runMaintenanceCheck}
                  className="hidden lg:flex h-7"
                  disabled={autonomyMode === 'manual'}
                  data-testid="run-maintenance"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Maintenance
                </Button>
                
                <Button 
                  size="sm"
                  className="bg-primary hover:bg-primary/90 h-7"
                  data-testid="button-add-task"
                >
                  {workflowMode ? "Create Workflow" : "Add Task"}
                </Button>
              </div>
            </div>
          </div>

          {/* Canvas Content - Module Container */}
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
                {currentModule === 'mindmap' && (
                  <WorkflowMindMap 
                    projectId={currentProjectId}
                  />
                )}
                {currentModule === 'tasks' && (
                  <TaskListView 
                    projectId={currentProjectId}
                    onTaskSelect={handleTaskSelect}
                  />
                )}
                {currentModule === 'calendar' && (
                  <CalendarView 
                    projectId={currentProjectId}
                    onTaskSelect={handleTaskSelect}
                  />
                )}
                {currentModule === 'browser' && (
                  <div className="h-full flex flex-col bg-background">
                    {/* Browser Header */}
                    <div className="p-4 border-b border-border bg-background/95">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">AI Web Browser</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">Beta</Badge>
                          <Button size="sm" variant="outline">
                            <Youtube className="h-3 w-3 mr-1" />
                            YouTube
                          </Button>
                          <Button size="sm" variant="outline">
                            <Search className="h-3 w-3 mr-1" />
                            Search
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Address Bar */}
                    <div className="p-3 border-b border-border bg-muted/30">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 flex items-center bg-background border rounded-lg px-3 py-2">
                          <Globe className="h-4 w-4 text-muted-foreground mr-2" />
                          <input 
                            type="text" 
                            placeholder="Enter URL or search query..."
                            className="flex-1 bg-transparent outline-none text-sm"
                            defaultValue="https://replit.com"
                          />
                        </div>
                        <Button size="sm">Go</Button>
                      </div>
                    </div>
                    
                    {/* Browser Content */}
                    <div className="flex-1 relative bg-white">
                      <iframe 
                        src="https://replit.com"
                        className="w-full h-full border-0"
                        title="AI Browser"
                        sandbox="allow-same-origin allow-scripts allow-forms"
                      />
                      {/* AI Overlay Controls */}
                      <div className="absolute top-4 right-4 space-y-2">
                        <Button size="sm" variant="secondary" className="bg-background/80 backdrop-blur">
                          <Brain className="h-3 w-3 mr-1" />
                          AI Annotate
                        </Button>
                        <Button size="sm" variant="secondary" className="bg-background/80 backdrop-blur">
                          <Download className="h-3 w-3 mr-1" />
                          Extract Data
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {currentModule === 'diagnostics' && (
                  <div className="h-full p-4">
                    <DiagnosticsPanel 
                      aiActivityLog={aiActivityLog}
                      lastMaintenanceRun={lastMaintenanceRun}
                      autonomyMode={autonomyMode}
                      onRunMaintenance={runMaintenanceCheck}
                    />
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
            currentModule={currentModule}
            autonomyMode={autonomyMode}
            aiActivityLog={aiActivityLog}
            lastMaintenanceRun={lastMaintenanceRun}
            onRunMaintenance={runMaintenanceCheck}
            projectId={currentProjectId}
            className="hidden lg:flex"
          />
        )}
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
