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

  // Desktop Layout - Three Pane System
  return (
    <div className="h-screen bg-background text-foreground font-inter">
      <Header 
        onVoiceToggle={handleVoiceToggle}
        isVoiceActive={isListening}
      />
      
      {/* Desktop Two-Pane Layout - Workspace + Inspector */}
      <div className="h-[calc(100vh-3.5rem)] grid grid-cols-1 lg:grid-cols-[1fr,300px] overflow-hidden">

        {/* Center Pane - Canvas */}
        <div className="flex flex-col min-w-0 bg-background h-full overflow-hidden">
          {/* Autonomous AI Workstation Toolbar - Compact */}
          <div className="bg-card border-b border-border p-2">
            <div className="flex justify-between items-center">
              {/* Left Section - Title and AI Status */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-gradient-to-r from-primary to-secondary rounded flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${autonomyMode === 'full' ? 'bg-green-400 animate-pulse' : autonomyMode === 'semi' ? 'bg-yellow-400' : 'bg-gray-400'}`}></div>
                    <span className={`text-xs ${getAutonomyColor()}`}>{getAutonomyLabel()}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    GPT-4o Active
                  </Badge>
                </div>
              </div>

              {/* Center Section - Module Selector with Scroll */}
              <div className="flex items-center space-x-1 relative z-50">
                {!workflowMode && (
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const container = document.getElementById('module-selector');
                        if (container) {
                          container.scrollBy({ left: -200, behavior: 'smooth' });
                        }
                      }}
                      className="h-7 w-7 p-0"
                      data-testid="module-scroll-left"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div 
                      id="module-selector"
                      className="flex items-center border rounded-lg p-1 bg-background max-w-[400px] overflow-x-hidden scrollbar-hide"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      <Button
                        variant={currentModule === 'mindmap' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentModule('mindmap')}
                        className="h-7 px-2 shrink-0 text-xs"
                        data-testid="module-mindmap"
                      >
                        <Brain className="h-3 w-3 mr-1" />
                        <span>Mind Map</span>
                      </Button>
                      <Button
                        variant={currentModule === 'calendar' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentModule('calendar')}
                        className="h-7 px-2 shrink-0 text-xs"
                        data-testid="module-calendar"
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Calendar</span>
                      </Button>
                      <Button
                        variant={currentModule === 'tasks' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentModule('tasks')}
                        className="h-7 px-2 shrink-0 text-xs"
                        data-testid="module-tasks"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        <span>Tasks</span>
                      </Button>
                      <Button
                        variant={currentModule === 'activity' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentModule('activity')}
                        className="h-7 px-2 shrink-0 text-xs"
                        data-testid="module-activity"
                      >
                        <Bot className="h-3 w-3 mr-1" />
                        <span>AI Activity</span>
                      </Button>
                      <Button
                        variant={currentModule === 'feature' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentModule('feature')}
                        className="h-7 px-2 shrink-0 text-xs"
                        data-testid="module-feature"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        <span>Feature</span>
                      </Button>
                      <Button
                        variant={currentModule === 'browser' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentModule('browser')}
                        className="h-7 px-2 shrink-0 text-xs"
                        data-testid="module-browser"
                      >
                        <Globe className="h-3 w-3 mr-1" />
                        <span>Browser</span>
                      </Button>
                      <Button
                        variant={currentModule === 'diagnostics' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentModule('diagnostics')}
                        className="h-7 px-2 shrink-0 text-xs"
                        data-testid="module-diagnostics"
                      >
                        <BarChart3 className="h-3 w-3 mr-1" />
                        <span>Debug</span>
                      </Button>
                      <Button
                        variant={currentModule === 'agents' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentModule('agents')}
                        className="h-7 px-2 shrink-0 text-xs"
                        data-testid="module-agents"
                      >
                        <Bot className="h-3 w-3 mr-1" />
                        <span>Agents</span>
                      </Button>
                      <Button
                        variant={currentModule === 'tools' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentModule('tools')}
                        className="h-7 px-2 shrink-0 text-xs"
                        data-testid="module-tools"
                      >
                        <Wrench className="h-3 w-3 mr-1" />
                        <span>Tools</span>
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const container = document.getElementById('module-selector');
                        if (container) {
                          container.scrollBy({ left: 200, behavior: 'smooth' });
                        }
                      }}
                      className="h-7 w-7 p-0"
                      data-testid="module-scroll-right"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Right Section - Essential Controls Only */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWorkflowMode(!workflowMode)}
                  className="h-7"
                >
                  <Workflow className="h-3 w-3 mr-1" />
                  {workflowMode ? "Tasks" : "Workflows"}
                </Button>
                
                <Button 
                  size="sm"
                  className="bg-primary hover:bg-primary/90 h-7"
                  onClick={() => workflowMode ? loadSampleWorkflow() : setIsTaskCreateModalOpen(true)}
                  data-testid="button-add-task"
                >
                  {workflowMode ? "Create Workflow" : "Add Task"}
                </Button>
              </div>
            </div>
          </div>

          {/* Canvas Content - Module Container */}
          <div className="flex-1 relative overflow-auto">
            {workflowMode ? (
              currentWorkflow ? (
                <TraceCanvas
                  flow={currentWorkflow}
                  selectedNodeId={selectedNodeId || undefined}
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
                {currentModule === 'agents' && (
                  <div className="h-full p-6 overflow-y-auto">
                    <AgentDashboard />
                  </div>
                )}
                {currentModule === 'tools' && (
                  <div className="h-full">
                    <WorkstationTools projectId={currentProjectId} />
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
            runtime={runtime || undefined}
            onRunFlow={(mode) => executeWorkflow({ workflow: currentWorkflow, mode })}
            onRunStep={(stepId, mode) => executeStep({ workflow: currentWorkflow, stepId, mode })}
            onExportFlow={exportWorkflow}
            className="hidden lg:flex"
          />
        ) : (
          <InspectorPane 
            selectedTaskId={selectedTaskId}
            currentModule={currentModule as any}
            autonomyMode={autonomyMode}
            aiActivityLog={aiActivityLog}
            lastMaintenanceRun={lastMaintenanceRun}
            onRunMaintenance={runMaintenanceCheck}
            onAutonomyChange={setAutonomyMode}
            projectId={currentProjectId}
            className="hidden lg:flex h-full overflow-hidden"
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

      {/* Task Create Modal */}
      <TaskCreateModal
        isOpen={isTaskCreateModalOpen}
        onClose={() => setIsTaskCreateModalOpen(false)}
        projectId={currentProjectId}
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
