import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/Header";

import MindMap from "@/components/MindMap";
import { WorkflowMindMap } from "@/components/WorkflowMindMap";
import TaskDetailPanel from "@/components/TaskDetailPanel";
import VoiceModal from "@/components/VoiceModal";
import { InspectorPane } from "@/components/InspectorPane";
import { FeatureRequestPanel } from "@/components/FeatureRequestPanel";
import { DiagnosticsPanel } from "@/components/DiagnosticsPanel";
import TaskListView from "@/components/TaskListView";
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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type ModuleKey =
  | "mindmap"
  | "calendar"
  | "tasks"
  | "activity"
  | "feature"
  | "browser"
  | "diagnostics"
  | "agents"
  | "tools";

export default function Dashboard() {
  const [currentModule, setCurrentModule] = useState<ModuleKey>('mindmap');
  const [isTaskCreateModalOpen, setIsTaskCreateModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isStepRunnerOpen, setIsStepRunnerOpen] = useState(false);
  const [currentProjectId] = useState("default-project");
  const [workflowMode, setWorkflowMode] = useState(false);
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
  } = useWorkflow();

  // WebSocket for real-time updates
  const { sendMessage, isConnected: wsConnected } = useWebSocket(currentProjectId);

  // Fetch AI activity log
  const { data: aiActivityLog = [] } = useQuery({
    queryKey: ['/api/activity'],
    refetchInterval: 5000,
  });

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleVoiceCommand = (command: string) => {
    processVoiceCommand(command);
    setIsVoiceModalOpen(false);
  };

  const handleCommand = (command: string) => {
    console.log('Command:', command);
    setIsCommandPaletteOpen(false);
  };

  const handleTaskCreate = (task: any) => {
    console.log('Task created:', task);
    queryClient.invalidateQueries({ queryKey: ['/api/projects', currentProjectId, 'tasks'] });
  };

  const handleStepComplete = (stepId: string) => {
    console.log('Step completed:', stepId);
  };

  const handleTaskComplete = (taskId: string) => {
    console.log('Task completed:', taskId);
    setIsStepRunnerOpen(false);
  };

  const runMaintenanceCheck = async () => {
    try {
      console.log('Running maintenance check...');
      const response = await fetch('/api/maintenance', { method: 'POST' });
      if (response.ok) {
        setLastMaintenanceRun(new Date());
        queryClient.invalidateQueries({ queryKey: ['/api/activity'] });
      }
    } catch (error) {
      console.error('Maintenance check failed:', error);
    }
  };

  // Constants for layout
  const HEADER_HEIGHT = 56; // h-14
  const TOOLBAR_HEIGHT = 48; // h-12

  const toolbarItems = [
    { key: "mindmap" as const, label: "Mind Map", icon: Brain },
    { key: "calendar" as const, label: "Calendar", icon: Calendar },
    { key: "tasks" as const, label: "Tasks", icon: CheckCircle },
    { key: "activity" as const, label: "AI Activity", icon: Bot },
    { key: "feature" as const, label: "Feature", icon: Sparkles },
    { key: "browser" as const, label: "Browser", icon: Globe },
    { key: "diagnostics" as const, label: "Debug", icon: Bug },
    { key: "agents" as const, label: "Agents", icon: Users },
    { key: "tools" as const, label: "Tools", icon: Wrench },
  ];

  if (isMobile) {
    return (
      <div className="h-screen bg-background text-foreground font-inter flex flex-col">
        <Header 
          onVoiceToggle={handleVoiceToggle}
          isVoiceActive={isListening}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
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
            {currentModule === 'tools' && (
              <div className="h-full p-4">
                <WorkstationTools projectId={currentProjectId} />
              </div>
            )}
          </div>
          
          <div className="flex-[2] overflow-y-auto bg-muted/20">
            <InspectorPane
              projectId={currentProjectId}
              selectedTaskId={selectedTaskId}
              currentModule={currentModule as any}
              autonomyMode={autonomyMode}
              aiActivityLog={aiActivityLog}
              lastMaintenanceRun={lastMaintenanceRun}
              onRunMaintenance={runMaintenanceCheck}
              onAutonomyChange={setAutonomyMode}
            />
          </div>
        </div>

        <MobileNavigation 
          currentModule={currentModule}
          onModuleChange={setCurrentModule}
          className="mt-auto"
        />

        <QuickCaptureButton onTaskCreate={handleTaskCreate} />

        <StepRunner
          task={null}
          isOpen={isStepRunnerOpen}
          onClose={() => setIsStepRunnerOpen(false)}
          onStepComplete={handleStepComplete}
          onTaskComplete={handleTaskComplete}
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

  // Desktop Layout - Fixed Layout System
  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      {/* Global Header */}
      <Header 
        onVoiceToggle={handleVoiceToggle}
        isVoiceActive={isListening}
      />

      {/* Secondary Toolbar - Sticky below header */}
      <div
        className="sticky z-30 border-b bg-background/95 backdrop-blur"
        style={{ top: HEADER_HEIGHT }}
      >
        <div className="px-3 py-2 flex gap-2 overflow-x-auto whitespace-nowrap">
          {toolbarItems.map((item) => {
            const isActive = currentModule === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setCurrentModule(item.key)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm border flex items-center gap-1 shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card/50 hover:bg-card border-border"
                )}
                data-testid={`module-${item.key}`}
              >
                <Icon className="h-3 w-3" />
                {item.label}
              </button>
            );
          })}
          
          {/* Right side controls */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
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

      {/* Work area: 2-column grid (content | inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,24rem] flex-1 overflow-hidden">
        {/* CENTER COLUMN — only this scrolls */}
        <main className="min-w-0 overflow-auto">
          <div className="p-4">
            {workflowMode ? (
              <div className="h-full">
                <WorkflowMindMap projectId={currentProjectId} />
              </div>
            ) : (
              <>
                {currentModule === "mindmap" && (
                  <div className="h-full">
                    <MindMap
                      projectId={currentProjectId}
                      onTaskSelect={setSelectedTaskId}
                    />
                  </div>
                )}

                {currentModule === "calendar" && (
                  <div className="h-full">
                    <CalendarView 
                      projectId={currentProjectId}
                      onTaskSelect={setSelectedTaskId}
                    />
                  </div>
                )}

                {currentModule === "tasks" && (
                  <div className="h-full">
                    <TaskListView 
                      projectId={currentProjectId}
                      onTaskSelect={setSelectedTaskId}
                      onAddTask={() => setIsTaskCreateModalOpen(true)}
                    />
                  </div>
                )}

                {currentModule === "activity" && (
                  <div className="h-full">
                    <ComprehensiveActivityLogger />
                  </div>
                )}

                {currentModule === "feature" && (
                  <div className="h-full">
                    <FeatureRequestPanel />
                  </div>
                )}

                {currentModule === "browser" && (
                  <div className="h-full">
                    <AIBrowser />
                  </div>
                )}

                {currentModule === "diagnostics" && (
                  <div className="h-full">
                    <DiagnosticsPanel 
                      aiActivityLog={aiActivityLog}
                      lastMaintenanceRun={lastMaintenanceRun}
                      autonomyMode={autonomyMode}
                      onRunMaintenance={runMaintenanceCheck}
                    />
                  </div>
                )}

                {currentModule === "agents" && (
                  <div className="h-full">
                    <AgentDashboard />
                  </div>
                )}

                {currentModule === "tools" && (
                  <div className="h-full">
                    <WorkstationTools projectId={currentProjectId} />
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* RIGHT COLUMN — the inspector never overlays the toolbar */}
        <aside
          className="hidden lg:block border-l bg-card shrink-0"
          style={{
            position: "sticky",
            top: HEADER_HEIGHT + TOOLBAR_HEIGHT,
            height: `calc(100dvh - ${HEADER_HEIGHT + TOOLBAR_HEIGHT}px)`,
            overflowY: "auto",
          }}
        >
          <InspectorPane
            selectedTaskId={selectedTaskId}
            currentModule={currentModule === "agents" ? "agents" : "mindmap"}
            autonomyMode={autonomyMode}
            onAutonomyChange={setAutonomyMode}
            aiActivityLog={aiActivityLog}
            lastMaintenanceRun={lastMaintenanceRun}
            onRunMaintenance={runMaintenanceCheck}
            projectId={currentProjectId}
            className="h-full"
          />
        </aside>
      </div>

      {/* Modals */}
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