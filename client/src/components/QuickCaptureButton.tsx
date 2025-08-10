import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Mic, Plus, Send, Hash, Calendar, User } from "lucide-react";
import { useVoice } from "@/hooks/useVoice";

interface QuickCaptureButtonProps {
  onTaskCreate?: (task: { title: string; tags: string[]; priority: string }) => void;
}

export function QuickCaptureButton({ onTaskCreate }: QuickCaptureButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priority, setPriority] = useState("medium");
  
  const { isListening, transcript, startListening, stopListening } = useVoice();

  const suggestedTags = ["urgent", "email", "call", "meeting", "follow-up", "research", "planning"];

  const handleVoiceCapture = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        setTaskTitle(transcript);
      }
    } else {
      startListening();
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (!taskTitle.trim()) return;

    onTaskCreate?.({
      title: taskTitle,
      tags: selectedTags,
      priority
    });

    // Reset form
    setTaskTitle("");
    setSelectedTags([]);
    setPriority("medium");
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          size="lg"
          className="fixed right-4 bottom-20 md:hidden h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50"
          data-testid="button-quick-capture"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="bottom" 
        className="h-[60vh] rounded-t-2xl p-0"
        data-testid="sheet-quick-capture"
      >
        <div className="p-6 space-y-4">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Capture
            </SheetTitle>
            <SheetDescription>
              Speak or type to capture a task. Add tags and priority.
            </SheetDescription>
          </SheetHeader>

          {/* Voice/Text Input */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={transcript || taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="flex-1"
                data-testid="input-task-title"
              />
              <Button
                onClick={handleVoiceCapture}
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                className="shrink-0"
                data-testid="button-voice-capture"
              >
                <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
              </Button>
            </div>

            {isListening && (
              <div className="text-sm text-muted-foreground text-center">
                🎤 Listening... Tap mic again to stop
              </div>
            )}
          </div>

          {/* Quick Tags */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Hash className="h-4 w-4" />
              Quick Tags
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTagToggle(tag)}
                  data-testid={`tag-${tag}`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              Priority
            </div>
            <div className="flex gap-2">
              {["low", "medium", "high", "urgent"].map((p) => (
                <Badge
                  key={p}
                  variant={priority === p ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => setPriority(p)}
                  data-testid={`priority-${p}`}
                >
                  {p}
                </Badge>
              ))}
            </div>
          </div>

          {/* Submit */}
          <Button 
            onClick={handleSubmit}
            className="w-full"
            disabled={!taskTitle.trim()}
            data-testid="button-create-task"
          >
            <Send className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}