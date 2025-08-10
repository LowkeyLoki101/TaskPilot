import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Settings, 
  Palette, 
  Layout, 
  Users, 
  Calendar,
  Mail,
  Phone,
  Globe,
  Zap,
  FileText,
  Hash,
  ArrowRight
} from "lucide-react";

interface Command {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  shortcut?: string;
  category: "tasks" | "navigation" | "actions" | "settings";
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand?: (commandId: string) => void;
}

export function CommandPalette({ isOpen, onClose, onCommand }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: Command[] = [
    // Tasks
    {
      id: "create-task",
      label: "Create Task",
      description: "Add a new task to your inbox",
      icon: <Plus className="h-4 w-4" />,
      shortcut: "⌘N",
      category: "tasks",
      action: () => onCommand?.("create-task")
    },
    {
      id: "create-project",
      label: "Create Project",
      description: "Start a new project",
      icon: <FileText className="h-4 w-4" />,
      shortcut: "⌘⇧N",
      category: "tasks",
      action: () => onCommand?.("create-project")
    },
    
    // Navigation
    {
      id: "go-inbox",
      label: "Go to Inbox",
      description: "Navigate to inbox view",
      icon: <Search className="h-4 w-4" />,
      shortcut: "G I",
      category: "navigation",
      action: () => onCommand?.("go-inbox")
    },
    {
      id: "go-today",
      label: "Go to Today",
      description: "Navigate to today view",
      icon: <Calendar className="h-4 w-4" />,
      shortcut: "G T",
      category: "navigation",
      action: () => onCommand?.("go-today")
    },
    {
      id: "go-projects",
      label: "Go to Projects",
      description: "Navigate to projects view",
      icon: <Layout className="h-4 w-4" />,
      shortcut: "G P",
      category: "navigation",
      action: () => onCommand?.("go-projects")
    },
    
    // Actions
    {
      id: "send-email",
      label: "Send Email",
      description: "Compose and send an email",
      icon: <Mail className="h-4 w-4" />,
      shortcut: "⌘E",
      category: "actions",
      action: () => onCommand?.("send-email")
    },
    {
      id: "make-call",
      label: "Make Call",
      description: "Initiate a phone call",
      icon: <Phone className="h-4 w-4" />,
      shortcut: "⌘⇧C",
      category: "actions",
      action: () => onCommand?.("make-call")
    },
    {
      id: "web-search",
      label: "Web Search",
      description: "Search the web and add results",
      icon: <Globe className="h-4 w-4" />,
      shortcut: "⌘⇧S",
      category: "actions",
      action: () => onCommand?.("web-search")
    },
    {
      id: "ai-assist",
      label: "AI Assistant",
      description: "Open AI control panel",
      icon: <Zap className="h-4 w-4" />,
      shortcut: "⌘J",
      category: "actions",
      action: () => onCommand?.("ai-assist")
    },
    
    // Settings
    {
      id: "settings",
      label: "Settings",
      description: "Open application settings",
      icon: <Settings className="h-4 w-4" />,
      shortcut: "⌘,",
      category: "settings",
      action: () => onCommand?.("settings")
    },
    {
      id: "theme",
      label: "Change Theme",
      description: "Switch between light and dark mode",
      icon: <Palette className="h-4 w-4" />,
      shortcut: "⌘⇧T",
      category: "settings",
      action: () => onCommand?.("theme")
    }
  ];

  const filteredCommands = commands.filter(command =>
    command.label.toLowerCase().includes(query.toLowerCase()) ||
    command.description.toLowerCase().includes(query.toLowerCase())
  );

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  const categoryLabels = {
    tasks: "Tasks",
    navigation: "Navigation", 
    actions: "Actions",
    settings: "Settings"
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const command = filteredCommands[selectedIndex];
        if (command) {
          command.action();
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  const handleCommandClick = (command: Command) => {
    command.action();
    onClose();
  };

  let currentIndex = 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-2xl" data-testid="command-palette">
        <div className="flex items-center px-4 py-3 border-b">
          <Search className="h-4 w-4 text-muted-foreground mr-3" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="border-0 focus-visible:ring-0 text-sm"
            autoFocus
            data-testid="command-palette-input"
          />
          <div className="ml-3 text-xs text-muted-foreground">
            <kbd className="px-2 py-1 text-xs bg-muted rounded">⌘K</kbd>
          </div>
        </div>

        <ScrollArea className="max-h-96">
          <div className="p-2">
            {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
              <div key={category} className="mb-4 last:mb-0">
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </div>
                
                {categoryCommands.map((command) => {
                  const isSelected = currentIndex === selectedIndex;
                  const itemIndex = currentIndex++;
                  
                  return (
                    <div
                      key={command.id}
                      onClick={() => handleCommandClick(command)}
                      className={`
                        flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-sm
                        ${isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}
                      `}
                      data-testid={`command-${command.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-md">
                          {command.icon}
                        </div>
                        <div>
                          <div className="font-medium">{command.label}</div>
                          <div className="text-xs text-muted-foreground">{command.description}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {command.shortcut && (
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            {command.shortcut}
                          </Badge>
                        )}
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {filteredCommands.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No commands found for "{query}"</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}