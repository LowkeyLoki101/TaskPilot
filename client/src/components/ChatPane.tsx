import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Send, Bot, User, Zap, Mic, MicOff, Upload, Paperclip } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { useVoice } from "@/hooks/useVoice";

interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  createdAt: string;
  metadata?: any;
}

interface ChatPaneProps {
  projectId: string;
  className?: string;
}

export function ChatPane({ projectId, className }: ChatPaneProps) {
  const [message, setMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  const { isListening, transcript, startListening, stopListening } = useVoice();

  // Get chat messages
  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/projects", projectId, "chat"],
    refetchInterval: 5000
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/projects/${projectId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content, role: "user" })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "chat"] });
      setMessage("");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const content = transcript || message;
    if (!content.trim() || sendMessage.isPending) return;
    
    const messageWithFiles = attachedFiles.length > 0 
      ? `${content}\n\nAttached files: ${attachedFiles.join(', ')}`
      : content;
    
    sendMessage.mutate(messageWithFiles);
    setAttachedFiles([]);
    if (transcript) {
      stopListening();
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleFileUpload = async () => {
    return {
      method: 'PUT' as const,
      url: '/api/objects/upload' // This will need to be implemented
    };
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const newFiles = result.successful.map((file: any) => file.name || 'uploaded-file');
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className={`flex flex-col max-h-[50vh] bg-card ${className}`} data-testid="chat-pane">
      {/* Header */}
      <div className="p-2 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-gradient-to-r from-primary to-secondary">
            <Bot className="h-3 w-3 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-xs">AI Assistant</h3>
          </div>
          <Badge variant="outline" className="ml-auto text-xs">
            {messages.length}
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-2 h-[300px]" ref={scrollAreaRef}>
        <div className="space-y-2">
          {messages.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <Bot className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Start a conversation</p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              <div className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`
                  p-2 rounded-lg shrink-0
                  ${msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-gradient-to-r from-primary/10 to-secondary/10'
                  }
                `}>
                  {msg.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                
                <Card className={`max-w-[85%] ${msg.role === 'user' ? 'ml-8' : 'mr-8'}`}>
                  <CardContent className="p-2">
                    <p className="text-xs whitespace-pre-wrap">{msg.content}</p>
                    
                    {msg.metadata?.actions && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Actions taken:</p>
                        <div className="flex flex-wrap gap-1">
                          {msg.metadata.actions.map((action: any, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              {action.type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className={`text-xs text-muted-foreground px-8 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          ))}

          {sendMessage.isPending && (
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10">
                <Bot className="h-4 w-4" />
              </div>
              <Card className="max-w-[80%]">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">AI is thinking...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-2 border-t border-border bg-muted/20">
        {/* Attached Files Display */}
        {attachedFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {attachedFiles.map((file, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Paperclip className="h-3 w-3 mr-1" />
                {file}
                <button
                  type="button"
                  onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex gap-1">
            <Input
              value={transcript || message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type or use voice..."
              className="flex-1 h-8 text-xs"
              disabled={sendMessage.isPending}
              data-testid="input-chat-message"
            />
            
            <ObjectUploader
              maxNumberOfFiles={3}
              maxFileSize={10485760} // 10MB
              onGetUploadParameters={handleFileUpload}
              onComplete={handleUploadComplete}
              buttonClassName="h-8 w-8 p-0"
            >
              <Upload className="h-3 w-3" />
            </ObjectUploader>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleVoiceToggle}
              className={`h-8 w-8 p-0 ${isListening ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
              data-testid="button-voice-chat"
            >
              {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
            </Button>
            
            <Button 
              type="submit" 
              size="sm"
              className="h-8 w-8 p-0"
              disabled={(!message.trim() && !transcript?.trim()) || sendMessage.isPending}
              data-testid="button-send-message"
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}