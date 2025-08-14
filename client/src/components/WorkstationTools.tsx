import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { DynamicToolCreator } from "@/components/DynamicToolCreator";
import { 
  Code2, Database, Globe, FileText, Bot, 
  GitBranch, Terminal, Palette, Shield, 
  Search, Calculator, Mail, Calendar,
  X, Maximize2, Minimize2, Settings, Package
} from "lucide-react";

interface Tool {
  id: string;
  name: string;
  icon: any;
  description: string;
  category: string;
  workspace?: React.ReactNode;
}

interface ActiveTool {
  toolId: string;
  instanceId: string;
  data?: any;
}

export function WorkstationTools({ projectId }: { projectId: string }) {
  const [activeTools, setActiveTools] = useState<ActiveTool[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const tools: Tool[] = [
    {
      id: "dynamic-creator",
      name: "Dynamic Tool Creator",
      icon: Package,
      description: "Create and test temporary tools in containers",
      category: "AI",
      workspace: <DynamicToolCreator projectId={projectId} />
    },
    {
      id: "code-editor",
      name: "Code Editor",
      icon: Code2,
      description: "Write and edit code with syntax highlighting",
      category: "Development",
      workspace: <CodeEditorWorkspace />
    },
    {
      id: "database-manager",
      name: "Database Manager",
      icon: Database,
      description: "Query and manage database tables",
      category: "Data",
      workspace: <DatabaseWorkspace />
    },
    {
      id: "api-tester",
      name: "API Tester",
      icon: Globe,
      description: "Test and debug API endpoints",
      category: "Development",
      workspace: <ApiTesterWorkspace />
    },
    {
      id: "document-editor",
      name: "Document Editor",
      icon: FileText,
      description: "Create and edit documentation",
      category: "Content",
      workspace: <DocumentWorkspace />
    },
    {
      id: "ai-assistant",
      name: "AI Assistant",
      icon: Bot,
      description: "Chat with AI for help and suggestions",
      category: "AI",
      workspace: <AIAssistantWorkspace />
    },
    {
      id: "git-manager",
      name: "Git Manager",
      icon: GitBranch,
      description: "Manage version control",
      category: "Development",
      workspace: <GitWorkspace />
    },
    {
      id: "terminal",
      name: "Terminal",
      icon: Terminal,
      description: "Command line interface",
      category: "System",
      workspace: <TerminalWorkspace />
    },
    {
      id: "design-tool",
      name: "Design Tool",
      icon: Palette,
      description: "Create UI mockups and designs",
      category: "Design",
      workspace: <DesignWorkspace />
    }
  ];

  const openTool = (toolId: string) => {
    const tool = tools.find(t => t.id === toolId);
    if (!tool) return;

    const instanceId = `${toolId}-${Date.now()}`;
    setActiveTools(prev => [...prev, { toolId, instanceId }]);
    setSelectedTool(instanceId);
  };

  const closeTool = (instanceId: string) => {
    setActiveTools(prev => prev.filter(t => t.instanceId !== instanceId));
    if (selectedTool === instanceId) {
      const remaining = activeTools.filter(t => t.instanceId !== instanceId);
      setSelectedTool(remaining.length > 0 ? remaining[0].instanceId : null);
    }
  };

  const getToolById = (toolId: string) => tools.find(t => t.id === toolId);

  return (
    <div className={`flex flex-col h-full ${isMaximized ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      {/* Tool Categories */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Workstation Tools</h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMaximized(!isMaximized)}
            >
              {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <ScrollArea className="w-full">
          <div className="flex gap-2">
            {tools.map(tool => (
              <Button
                key={tool.id}
                variant="outline"
                size="sm"
                onClick={() => openTool(tool.id)}
                className="flex items-center gap-2"
              >
                <tool.icon className="h-4 w-4" />
                {tool.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Active Tool Tabs */}
      {activeTools.length > 0 && (
        <Tabs value={selectedTool || undefined} onValueChange={setSelectedTool} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start border-b rounded-none h-10">
            {activeTools.map(activeTool => {
              const tool = getToolById(activeTool.toolId);
              if (!tool) return null;
              const Icon = tool.icon;
              
              return (
                <TabsTrigger
                  key={activeTool.instanceId}
                  value={activeTool.instanceId}
                  className="flex items-center gap-2 relative pr-8"
                >
                  <Icon className="h-4 w-4" />
                  {tool.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 h-4 w-4 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTool(activeTool.instanceId);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          {activeTools.map(activeTool => {
            const tool = getToolById(activeTool.toolId);
            if (!tool) return null;
            
            return (
              <TabsContent
                key={activeTool.instanceId}
                value={activeTool.instanceId}
                className="flex-1 p-4"
              >
                {tool.workspace}
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      {/* Empty State */}
      {activeTools.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No tools open</p>
            <p className="text-sm">Click a tool above to open it in the workspace</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Tool Workspace Components
function CodeEditorWorkspace() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 bg-muted/20 rounded-lg p-4 font-mono text-sm">
        <pre>{`function processTask(task) {
  // AI-generated code appears here
  console.log('Processing:', task.name);
  
  return {
    ...task,
    status: 'completed',
    timestamp: Date.now()
  };
}`}</pre>
      </div>
    </div>
  );
}

function DatabaseWorkspace() {
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="border rounded-lg p-3">
        <input
          className="w-full bg-transparent outline-none font-mono text-sm"
          placeholder="SELECT * FROM tasks WHERE status = 'active'"
        />
      </div>
      <div className="flex-1 border rounded-lg overflow-auto">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Title</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">1</td>
              <td className="p-2">Sample Task</td>
              <td className="p-2"><Badge>Active</Badge></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ApiTesterWorkspace() {
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex gap-2">
        <select className="border rounded px-2 py-1">
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>
        <input
          className="flex-1 border rounded px-2 py-1"
          placeholder="https://api.example.com/endpoint"
        />
        <Button>Send</Button>
      </div>
      <div className="flex-1 bg-muted/20 rounded-lg p-4 font-mono text-sm">
        <pre>{`{
  "status": "success",
  "data": []
}`}</pre>
      </div>
    </div>
  );
}

function DocumentWorkspace() {
  return (
    <div className="h-full">
      <textarea
        className="w-full h-full p-4 bg-transparent resize-none outline-none"
        placeholder="Start typing your documentation..."
      />
    </div>
  );
}

function AIAssistantWorkspace() {
  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Badge>AI</Badge>
            <p className="text-sm">How can I help you with this project?</p>
          </div>
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <input
          className="w-full bg-transparent outline-none"
          placeholder="Ask AI anything..."
        />
      </div>
    </div>
  );
}

function GitWorkspace() {
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="border rounded-lg p-3">
        <p className="text-sm font-medium mb-2">Current Branch: main</p>
        <div className="flex gap-2">
          <Button size="sm">Commit</Button>
          <Button size="sm" variant="outline">Push</Button>
          <Button size="sm" variant="outline">Pull</Button>
        </div>
      </div>
      <ScrollArea className="flex-1 border rounded-lg p-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500">M</Badge>
            <span>src/components/Task.tsx</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-500">D</Badge>
            <span>old-file.js</span>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

function TerminalWorkspace() {
  return (
    <div className="h-full bg-black text-green-400 p-4 font-mono text-sm rounded-lg">
      <div>$ npm run dev</div>
      <div>Starting development server...</div>
      <div>Server running on http://localhost:5000</div>
      <div className="flex items-center">
        <span>$ </span>
        <input
          className="flex-1 bg-transparent outline-none ml-2"
          placeholder="Enter command..."
        />
      </div>
    </div>
  );
}

function DesignWorkspace() {
  return (
    <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg">
      <div className="text-center text-muted-foreground">
        <Palette className="h-12 w-12 mx-auto mb-4" />
        <p>Design canvas</p>
        <p className="text-sm">Drag and drop UI elements here</p>
      </div>
    </div>
  );
}