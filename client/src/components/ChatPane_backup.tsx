import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Send, Bot, User, Zap, Mic, MicOff, Upload } from "lucide-react";
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
      return apiRequest(`/api/projects/${projectId}/chat`, {
        method: "POST",
        body: JSON.stringify({ content })
      });
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
    
    sendMessage.mutate(content);
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
    <div className={`flex flex-col h-full bg-card ${className}`} data-testid="chat-pane">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-secondary">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Project chat and task management</p>
          </div>
          <Badge variant="outline" className="ml-auto text-xs">
            GPT-5
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Start a conversation with your AI assistant</p>
              <p className="text-xs mt-1">Ask about tasks, projects, or request help with anything</p>
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
                
                <Card className={`max-w-[80%] ${msg.role === 'user' ? 'ml-12' : 'mr-12'}`}>
                  <CardContent className="p-3">
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    
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
              
              <div className={`text-xs text-muted-foreground px-12 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(msg.createdAt).toLocaleTimeString()}
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

      <Separator />

      {/* Input */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={transcript || message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask the AI assistant anything..."
              className="flex-1"
              disabled={sendMessage.isPending}
              data-testid="chat-input"
            />
            <ObjectUploader
              maxNumberOfFiles={3}
              maxFileSize={10485760} // 10MB
              onGetUploadParameters={async () => {
                const response = await fetch("/api/objects/upload", { method: "POST" });
                const data = await response.json();
                return { method: "PUT" as const, url: data.uploadURL };
              }}
              onComplete={(result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
                if (result.successful.length > 0) {
                  const fileUrls = result.successful.map(file => file.uploadURL).join(", ");
                  setMessage(prev => prev + (prev ? "\n" : "") + `📎 Files: ${fileUrls}`);
                }
              }}
              buttonClassName="shrink-0"
            >
              <Upload className="h-4 w-4" />
            </ObjectUploader>
            <Button
              type="button"
              onClick={handleVoiceToggle}
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              className="shrink-0"
              data-testid="voice-toggle"
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button 
              type="submit"
              disabled={sendMessage.isPending || (!message.trim() && !transcript)}
              data-testid="send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {isListening && (
            <div className="text-xs text-muted-foreground text-center">
              🎤 Listening... Speak now or click mic to stop
            </div>
          )}
        </form>
      </div>
    </div>
  );
}