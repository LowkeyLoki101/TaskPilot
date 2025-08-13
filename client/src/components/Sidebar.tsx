import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Search, 
  Calendar, 
  Users, 
  Settings, 
  Filter,
  Plus,
  Clock,
  CheckCircle
} from "lucide-react";

interface SidebarProps {
  currentView: 'mindmap' | 'list' | 'calendar';
  onViewChange: (view: 'mindmap' | 'list' | 'calendar') => void;
  projectId: string;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {

  return (
    <aside className="w-80 bg-card border-r border-border flex flex-col">
      {/* View Mode Switcher */}
      <div className="p-4 border-b border-border">
        <div className="flex bg-muted rounded-lg p-1">
          <button 
            onClick={() => onViewChange('mindmap')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              currentView === 'mindmap' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            data-testid="button-view-mindmap"
          >
            <i className="fas fa-project-diagram mr-2"></i>Mind Map
          </button>
          <button 
            onClick={() => onViewChange('list')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              currentView === 'list' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            data-testid="button-view-list"
          >
            <i className="fas fa-list mr-2"></i>List
          </button>
          <button 
            onClick={() => onViewChange('calendar')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              currentView === 'calendar' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            data-testid="button-view-calendar"
          >
            <i className="fas fa-calendar mr-2"></i>Calendar
          </button>
        </div>
      </div>

      {/* AI Assistant Chat */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground mb-2">AI Assistant</h3>
          <p className="text-sm text-muted-foreground">
            Ask me to create tasks, schedule events, or search for information.
          </p>
        </div>

        {/* Sidebar Content - Navigation only, chat moved to ChatPane */}
        <div className="flex-1 p-4">
          <div className="text-center text-muted-foreground">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-robot text-white"></i>
              </div>
              <p className="text-sm font-medium text-foreground mb-2">AI Assistant Active</p>
              <p className="text-xs">Use the chat panel on the left to interact with your AI assistant</p>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span>Voice Commands</span>
                <i className="fas fa-microphone text-primary"></i>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span>File Upload</span>
                <i className="fas fa-upload text-primary"></i>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span>Task Generation</span>
                <i className="fas fa-magic text-primary"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
