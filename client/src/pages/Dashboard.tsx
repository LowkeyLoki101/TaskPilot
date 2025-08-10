import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MindMap from "@/components/MindMap";
import TaskDetailPanel from "@/components/TaskDetailPanel";
import VoiceModal from "@/components/VoiceModal";
import { AIControlPanel } from "@/components/AIControlPanel";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useVoice } from "@/hooks/useVoice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Sparkles } from "lucide-react";

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<'mindmap' | 'list' | 'calendar'>('mindmap');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [currentProjectId] = useState("default-project");

  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    processVoiceCommand 
  } = useVoice();

  useWebSocket(currentProjectId);

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
  };

  const handleCloseTaskPanel = () => {
    setSelectedTaskId(null);
  };

  return (
    <div className="h-screen bg-background text-foreground font-inter">
      <Header 
        onVoiceToggle={handleVoiceToggle}
        isVoiceActive={isListening}
      />
      
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar 
          currentView={currentView}
          onViewChange={setCurrentView}
          projectId={currentProjectId}
        />
        
        <main className="flex-1 flex flex-col bg-background">
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
                {/* Search */}
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search tasks..." 
                    className="bg-input border border-border rounded-lg pl-10 pr-4 py-2 text-foreground placeholder-muted-foreground w-64 focus:outline-none focus:ring-2 focus:ring-primary"
                    data-testid="input-search-tasks"
                  />
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
                </div>

                {/* Actions */}
                <button 
                  className="bg-primary hover:bg-primary-600 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  data-testid="button-add-task"
                >
                  <i className="fas fa-plus mr-2"></i>Add Task
                </button>
                
                <button 
                  className="bg-muted hover:bg-accent text-foreground p-2 rounded-lg transition-colors duration-200"
                  data-testid="button-share-project"
                >
                  <i className="fas fa-share-alt"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Primary Content Area */}
            <div className="flex-1 relative">
              {currentView === 'mindmap' && (
                <MindMap 
                  projectId={currentProjectId}
                  onTaskSelect={handleTaskSelect}
                />
              )}
              {currentView === 'list' && (
                <div className="p-8 text-center text-muted-foreground">
                  <i className="fas fa-list text-4xl mb-4"></i>
                  <p>List view coming soon...</p>
                </div>
              )}
              {currentView === 'calendar' && (
                <div className="p-8 text-center text-muted-foreground">
                  <i className="fas fa-calendar text-4xl mb-4"></i>
                  <p>Calendar view coming soon...</p>
                </div>
              )}
            </div>

            {/* AI Control Panel - Right Side */}
            <div className="w-96 border-l border-border bg-card/50 overflow-y-auto">
              <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-secondary">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">AI Assistant</h3>
                    <p className="text-xs text-muted-foreground">Full website control enabled</p>
                  </div>
                  <Sparkles className="h-4 w-4 text-accent ml-auto animate-pulse" />
                </div>
              </div>
              
              <div className="p-4">
                <AIControlPanel />
              </div>
              
              {/* AI Capabilities Showcase */}
              <div className="p-4 border-t border-border">
                <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      AI Capabilities
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Your AI assistant can control everything on this website
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span>Modify any UI element or layout</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span>Create, update, delete tasks & projects</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                        <span>Send emails & notifications</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                        <span>Search web & integrate results</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                        <span>Customize themes & preferences</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div>
                        <span>Automate workflows & processes</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        {selectedTaskId && (
          <TaskDetailPanel
            taskId={selectedTaskId}
            onClose={handleCloseTaskPanel}
          />
        )}
      </div>

      {isVoiceModalOpen && (
        <VoiceModal
          isListening={isListening}
          transcript={transcript}
          onClose={() => setIsVoiceModalOpen(false)}
          onStop={stopListening}
          onProcess={() => processVoiceCommand(transcript, currentProjectId)}
        />
      )}
    </div>
  );
}
