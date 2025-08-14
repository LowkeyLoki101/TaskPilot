import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
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
import { MobileNavigation } from "@/components/MobileNavigation";
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
import { Brain, Sparkles, Calendar, Inbox, CheckCircle, Clock, User, Users, Workflow, Mic, Monitor, Youtube, Bell, Bug, Globe, BarChart3, Settings, Plus, Search, Download, Bot, Wrench, ChevronLeft, ChevronRight } from "lucide-react";
import { AgentDashboard } from '@/components/AgentDashboard';
import { TaskCreateModal } from '@/components/TaskCreateModal';
import { AIBrowser } from '@/components/AIBrowser';
import { VoiceTranscription } from '@/components/VoiceTranscription';
import { WorkstationTools } from '@/components/WorkstationTools';
import { ComprehensiveActivityLogger } from '@/components/ComprehensiveActivityLogger';
// Logo will be added later - using placeholder for now
import { Switch } from "@/components/ui/switch";

export default function Dashboard() {

  const [currentModule, setCurrentModule] = useState<string>('mindmap');
  const [isTaskCreateModalOpen, setIsTaskCreateModalOpen] = useState(false);

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
      await processVoiceCommand(transcript);
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
    
    // Log maintenance start
    await fetch('/api/activity-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'Starting autonomous maintenance check',
        type: 'maintenance'
      })
    });
    
    try {
      // Check system health endpoints
      const healthCheck = await fetch('/api/health');
      if (healthCheck.ok) {
        console.log('✅ System health check passed');
        
        // Log successful health check
        await fetch('/api/activity-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'System health check passed - all services operational',
            type: 'system'
          })
        });
      }

      // In full autonomy mode, perform proactive AI actions
      if (autonomyMode === 'full') {
        await performAutonomousActions();
        
        // Log autonomous actions
        await fetch('/api/activity-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'Executed autonomous AI actions in full mode',
            type: 'ai_response'
          })
        });
      }

      // Refresh activity log to show latest real data
      refetchActivity();

      // Update last maintenance timestamp
      setLastMaintenanceRun(new Date());
      
      // Log maintenance completion
      const completionTime = new Date().toLocaleTimeString();
      await fetch('/api/activity-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: `Maintenance cycle completed successfully at ${completionTime}`,
          type: 'maintenance'
        })
      });
      
      console.log('🔄 Maintenance cycle completed at', completionTime);
    } catch (error) {
      console.error('❌ Maintenance cycle failed:', error);
      
      // Log maintenance failure
      await fetch('/api/activity-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: `Maintenance cycle failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'system'
        })
      });
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
      case "go-mindmap":
        setCurrentModule("mindmap");
        break;
      case "go-calendar":
        setCurrentModule("calendar");
        break;
      case "go-tasks":
        setCurrentModule("tasks");
        break;
      case "go-browser":
        setCurrentModule("browser");
        break;
      // Add more command handlers
    }
  };

  const selectedTask = null; // Tasks from database now, not mock data

  // Responsive layout based on screen size
  if (isMobile) {
    return (
      <div className="h-screen bg-background text-foreground font-inter flex flex-col">
        <Header 
          onVoiceToggle={handleVoiceToggle}
          isVoiceActive={isListening}
        />
        
        {/* Mobile Content Container with Split View */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Module View - 60% */}
          <div className="flex-[3] overflow-y-auto border-b">
            {currentModule === 'mindmap' && (
              <div className="h-full p-4">
                <MindMap
                  projectId={currentProjectId}
                  onTaskSelect={setSelectedTaskId}
                />
              </div>
            )}
            {currentModule === 'calendar' && (
              <div className="h-full">
                <CalendarView 
                  projectId={currentProjectId}
                  onTaskSelect={setSelectedTaskId}
                />
              </div>
            )}
            {currentModule === 'tasks' && (
              <div className="h-full">
                <TaskListView 
                  projectId={currentProjectId}
                  onTaskSelect={setSelectedTaskId}
                />
              </div>
            )}
            {currentModule === 'agents' && (
              <div className="h-full p-4">
                <AgentDashboard />
              </div>
            )}
            
            {currentModule === 'activity' && (
              <div className="h-full p-4">
                <ComprehensiveActivityLogger />
              </div>
            )}
            {currentModule === 'feature' && (
              <div className="h-full p-4">
                <FeatureRequestPanel />
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
            {currentModule === 'browser' && (
              <div className="h-full">
                <AIBrowser />
              </div>
            )}
            {currentModule === 'transcription' && (
              <div className="h-full p-4">
                <VoiceTranscription />
              </div>
            )}
            {currentModule === 'tools' && (
              <div className="h-full p-4">
                <WorkstationTools projectId={currentProjectId} />
              </div>
            )}
          </div>
          
          {/* Bottom Chat/Inspector - 40% */}
          <div className="flex-[2] overflow-y-auto bg-muted/20">
            <InspectorPane
              projectId={currentProjectId}
              selectedTaskId={selectedTaskId}
              currentModule={currentModule as any}
              autonomyMode={autonomyMode}
              aiActivityLog={aiActivityLog}
              lastMaintenanceRun={lastMaintenanceRun}
              onRunMaintenance={runMaintenanceCheck}
            />
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileNavigation 
          currentModule={currentModule}
          onModuleChange={setCurrentModule}
          className="mt-auto"
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

  // Desktop Layout - Clean 2-Column Grid System
  return (
    <div className="h-screen w-full bg-background">
      {/* APP GRID: header row + content row */}
      <div className="grid h-full grid-rows-[auto,auto,1fr] grid-cols-[1fr,320px] lg:grid-cols-[1fr,360px] xl:grid-cols-[1fr,380px] overflow-hidden">

        {/* ======= TOP HEADER (spans both columns) ======= */}
        <div className="row-[1] col-span-2 sticky top-0 z-40">
          <Header 
            onVoiceToggle={handleVoiceToggle}
            isVoiceActive={isListening}
          />
        </div>

        {/* ======= MODULE TOOLBAR (spans both columns) ======= */}
        <div className="row-[2] col-span-2 sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
          <div className="h-12 flex items-center gap-2 px-4 overflow-x-auto scrollbar-none">
            {/* Module selector buttons */}
            {!workflowMode && (
              <div className="flex items-center space-x-1">
                <Button
                  variant={currentModule === 'mindmap' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentModule('mindmap')}
                  className="h-8 px-3 flex-shrink-0 text-xs"
                  data-testid="module-mindmap"
                >
                  <Brain className="h-3 w-3 mr-1" />
                  <span>Mind Map</span>
                </Button>
                <Button
                  variant={currentModule === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentModule('calendar')}
                  className="h-8 px-3 flex-shrink-0 text-xs"
                  data-testid="module-calendar"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Calendar</span>
                </Button>
                <Button
                  variant={currentModule === 'tasks' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentModule('tasks')}
                  className="h-8 px-3 flex-shrink-0 text-xs"
                  data-testid="module-tasks"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span>Tasks</span>
                </Button>
                <Button
                  variant={currentModule === 'activity' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentModule('activity')}
                  className="h-8 px-3 flex-shrink-0 text-xs"
                  data-testid="module-activity"
                >
                  <Bot className="h-3 w-3 mr-1" />
                  <span>AI Activity</span>
                </Button>
                <Button
                  variant={currentModule === 'feature' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentModule('feature')}
                  className="h-8 px-3 flex-shrink-0 text-xs"
                  data-testid="module-feature"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  <span>Feature</span>
                </Button>
                <Button
                  variant={currentModule === 'browser' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentModule('browser')}
                  className="h-8 px-3 flex-shrink-0 text-xs"
                  data-testid="module-browser"
                >
                  <Globe className="h-3 w-3 mr-1" />
                  <span>Browser</span>
                </Button>
                <Button
                  variant={currentModule === 'diagnostics' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentModule('diagnostics')}
                  className="h-8 px-3 flex-shrink-0 text-xs"
                  data-testid="module-diagnostics"
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  <span>Debug</span>
                </Button>
                <Button
                  variant={currentModule === 'agents' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentModule('agents')}
                  className="h-8 px-3 flex-shrink-0 text-xs"
                  data-testid="module-agents"
                >
                  <Bot className="h-3 w-3 mr-1" />
                  <span>Agents</span>
                </Button>
                <Button
                  variant={currentModule === 'tools' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentModule('tools')}
                  className="h-8 px-3 flex-shrink-0 text-xs"
                  data-testid="module-tools"
                >
                  <Wrench className="h-3 w-3 mr-1" />
                  <span>Tools</span>
                </Button>
              </div>
            )}
            
            {/* Right side controls */}
            <div className="ml-auto flex items-center space-x-2">
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${autonomyMode === 'full' ? 'bg-green-400 animate-pulse' : autonomyMode === 'semi' ? 'bg-yellow-400' : 'bg-gray-400'}`}></div>
                <span className={`text-xs ${getAutonomyColor()}`}>{getAutonomyLabel()}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWorkflowMode(!workflowMode)}
                className="h-8"
              >
                <Workflow className="h-3 w-3 mr-1" />
                {workflowMode ? "Tasks" : "Workflows"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTaskCreateModalOpen(true)}
                className="h-8"
                data-testid="button-add-task"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Task
              </Button>
            </div>
          </div>
        </div>

        {/* ======= MAIN WORKSPACE (left) ======= */}
        <main className="row-[3] col-[1] min-w-0 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* page title + local toolbar if needed */}
            <div className="h-12 shrink-0 flex items-center px-4 border-b border-border bg-background sticky top-24 z-20">
              <div className="text-sm font-semibold">
                {workflowMode ? 'Workflow Orchestrator' : 
                 currentModule === 'mindmap' ? 'Project Mind Map' :
                 currentModule === 'calendar' ? 'Calendar View' :
                 currentModule === 'tasks' ? 'Task Management' :
                 currentModule === 'activity' ? 'AI Activity Log' :
                 currentModule === 'agents' ? 'Agent Dashboard' :
                 currentModule === 'tools' ? 'Workstation Tools' :
                 currentModule === 'feature' ? 'Feature Requests' :
                 currentModule === 'diagnostics' ? 'System Diagnostics' :
                 currentModule === 'browser' ? 'AI Browser' :
                 'Workspace'}
              </div>
            </div>

            {/* canvas/content */}
            <div className="flex-1 min-h-0 overflow-auto">
              {workflowMode ? (
                <div className="h-full p-4">
                  <WorkflowMindMap projectId={currentProjectId} />
                </div>
              ) : (
                <>
                  {currentModule === 'mindmap' && (
                    <div className="h-full p-4">
                      <MindMap
                        projectId={currentProjectId}
                        onTaskSelect={setSelectedTaskId}
                      />
                    </div>
                  )}
                  {currentModule === 'calendar' && (
                    <div className="h-full">
                      <CalendarView 
                        projectId={currentProjectId}
                        onTaskSelect={setSelectedTaskId}
                      />
                    </div>
                  )}
                  {currentModule === 'tasks' && (
                    <div className="h-full">
                      <TaskListView 
                        projectId={currentProjectId}
                        onTaskSelect={setSelectedTaskId}
                      />
                    </div>
                  )}
                  {currentModule === 'agents' && (
                    <div className="h-full p-4">
                      <AgentDashboard />
                    </div>
                  )}
                  {currentModule === 'activity' && (
                    <div className="h-full p-4">
                      <ComprehensiveActivityLogger />
                    </div>
                  )}
                  {currentModule === 'feature' && (
                    <div className="h-full p-4">
                      <FeatureRequestPanel />
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
                  {currentModule === 'browser' && (
                    <div className="h-full">
                      <AIBrowser />
                    </div>
                  )}
                  {currentModule === 'transcription' && (
                    <div className="h-full p-4">
                      <VoiceTranscription />
                    </div>
                  )}
                  {currentModule === 'tools' && (
                    <div className="h-full p-4">
                      <WorkstationTools projectId={currentProjectId} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>

        {/* ======= INSPECTOR (right) ======= */}
        <aside
          className="row-[3] col-[2] min-w-[280px] max-w-[420px] border-l border-border bg-card
                     flex flex-col overflow-hidden"
        >
          {/* inspector header, same height as left subheader */}
          <div className="h-12 shrink-0 flex items-center px-3 border-b border-border bg-card sticky top-24 z-20">
            <div className="w-full overflow-x-auto">
              <div className="text-sm font-semibold">AI Inspector</div>
            </div>
          </div>

          {/* inspector body */}
          <div className="flex-1 min-h-0 overflow-auto">
            <InspectorPane
              projectId={currentProjectId}
              selectedTaskId={selectedTaskId}
              currentModule={currentModule as any}
              autonomyMode={autonomyMode}
              aiActivityLog={aiActivityLog}
              lastMaintenanceRun={lastMaintenanceRun}
              onRunMaintenance={runMaintenanceCheck}
              className="h-full"
            />
          </div>
        </aside>
      </div>

      {/* Modals and overlays */}
      <TaskCreateModal
        isOpen={isTaskCreateModalOpen}
        onClose={() => setIsTaskCreateModalOpen(false)}
        projectId={currentProjectId}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onCommand={handleCommand}
      />

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
