import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  currentView: 'mindmap' | 'list' | 'calendar';
  onViewChange: (view: 'mindmap' | 'list' | 'calendar') => void;
  projectId: string;
}

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
}

export default function Sidebar({ currentView, onViewChange, projectId }: SidebarProps) {
  const [chatInput, setChatInput] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch chat messages
  const { data: chatMessages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/projects", projectId, "chat"],
  });

  // Send chat message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/chat`, {
        content
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/projects", projectId, "chat"]
      });
      setChatInput("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      sendMessageMutation.mutate(chatInput.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.length === 0 && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-robot text-white text-sm"></i>
              </div>
              <div className="bg-muted rounded-lg p-3 max-w-full">
                <p className="text-sm text-foreground">
                  Hello! I'm your AI assistant. I can help you create and manage tasks, schedule events, send emails, and search for information. What would you like to work on today?
                </p>
              </div>
            </div>
          )}

          {chatMessages.map((message) => (
            <div 
              key={message.id} 
              className={`flex items-start space-x-3 ${message.role === 'user' ? 'justify-end' : ''}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-robot text-white text-sm"></i>
                </div>
              )}
              
              <div className={`rounded-lg p-3 max-w-full ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-foreground'
              }`}>
                <p className="text-sm">{message.content}</p>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-foreground text-sm font-medium">U</span>
                </div>
              )}
            </div>
          ))}

          {sendMessageMutation.isPending && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-robot text-white text-sm"></i>
              </div>
              <div className="bg-muted rounded-lg p-3 max-w-full">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-border">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Ask your AI assistant..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              data-testid="input-chat-message"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || sendMessageMutation.isPending}
              size="icon"
              data-testid="button-send-message"
            >
              <i className="fas fa-paper-plane"></i>
            </Button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="flex space-x-2">
              <button 
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-attach-file"
              >
                <i className="fas fa-paperclip"></i>
              </button>
              <button 
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-voice-input"
              >
                <i className="fas fa-microphone"></i>
              </button>
            </div>
            <span className="text-xs text-muted-foreground">Press Enter to send</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
