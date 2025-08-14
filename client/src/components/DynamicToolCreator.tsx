import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Code2, Play, Save, Trash2, Package, 
  FlaskConical, CheckCircle, XCircle,
  Loader2, Sparkles, Container, GitBranch
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface DynamicTool {
  id: string;
  name: string;
  description: string;
  code: string;
  language: string;
  status: 'draft' | 'testing' | 'validated' | 'failed';
  containerId?: string;
  createdAt: Date;
  testResults?: TestResult[];
  isTemporary: boolean;
}

interface TestResult {
  id: string;
  input: string;
  output: string;
  success: boolean;
  executionTime: number;
  error?: string;
}

export function DynamicToolCreator({ projectId }: { projectId: string }) {
  const [activeTab, setActiveTab] = useState("create");
  const [currentTool, setCurrentTool] = useState<Partial<DynamicTool>>({
    name: "",
    description: "",
    code: "",
    language: "javascript",
    isTemporary: true
  });
  const [testInput, setTestInput] = useState("");
  const queryClient = useQueryClient();

  // Fetch existing dynamic tools
  const { data: tools = [], isLoading } = useQuery<DynamicTool[]>({
    queryKey: ['/api/dynamic-tools', projectId],
    enabled: !!projectId
  });

  // Create/update tool mutation
  const createToolMutation = useMutation({
    mutationFn: async (tool: Partial<DynamicTool>) => {
      const response = await fetch('/api/dynamic-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tool, projectId })
      });
      if (!response.ok) throw new Error('Failed to create tool');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dynamic-tools'] });
      setCurrentTool({
        name: "",
        description: "",
        code: "",
        language: "javascript",
        isTemporary: true
      });
    }
  });

  // Test tool mutation
  const testToolMutation = useMutation({
    mutationFn: async ({ toolId, input }: { toolId: string; input: string }) => {
      const response = await fetch(`/api/dynamic-tools/${toolId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });
      if (!response.ok) throw new Error('Failed to test tool');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dynamic-tools'] });
    }
  });

  // Deploy tool permanently
  const deployToolMutation = useMutation({
    mutationFn: async (toolId: string) => {
      const response = await fetch(`/api/dynamic-tools/${toolId}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to deploy tool');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dynamic-tools'] });
    }
  });

  // Delete tool mutation
  const deleteToolMutation = useMutation({
    mutationFn: async (toolId: string) => {
      const response = await fetch(`/api/dynamic-tools/${toolId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete tool');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dynamic-tools'] });
    }
  });

  const handleCreateTool = () => {
    if (!currentTool.name || !currentTool.code) return;
    createToolMutation.mutate(currentTool);
  };

  const handleTestTool = (toolId: string) => {
    testToolMutation.mutate({ toolId, input: testInput });
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">
            <Code2 className="h-4 w-4 mr-2" />
            Create Tool
          </TabsTrigger>
          <TabsTrigger value="test">
            <FlaskConical className="h-4 w-4 mr-2" />
            Test Container
          </TabsTrigger>
          <TabsTrigger value="manage">
            <Package className="h-4 w-4 mr-2" />
            Tool Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="flex-1 space-y-4 p-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                AI Tool Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tool-name">Tool Name</Label>
                <Input
                  id="tool-name"
                  value={currentTool.name}
                  onChange={(e) => setCurrentTool({ ...currentTool, name: e.target.value })}
                  placeholder="e.g., Data Transformer, API Connector"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tool-description">Description</Label>
                <Textarea
                  id="tool-description"
                  value={currentTool.description}
                  onChange={(e) => setCurrentTool({ ...currentTool, description: e.target.value })}
                  placeholder="What does this tool do?"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tool-code">Tool Code</Label>
                  <select
                    value={currentTool.language}
                    onChange={(e) => setCurrentTool({ ...currentTool, language: e.target.value })}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="typescript">TypeScript</option>
                    <option value="bash">Bash</option>
                  </select>
                </div>
                <Textarea
                  id="tool-code"
                  value={currentTool.code}
                  onChange={(e) => setCurrentTool({ ...currentTool, code: e.target.value })}
                  placeholder="// Your tool implementation here..."
                  className="font-mono text-sm"
                  rows={10}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="temporary"
                  checked={currentTool.isTemporary}
                  onChange={(e) => setCurrentTool({ ...currentTool, isTemporary: e.target.checked })}
                />
                <Label htmlFor="temporary">Temporary tool (auto-cleanup after session)</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateTool}
                  disabled={createToolMutation.isPending}
                  className="flex-1"
                >
                  {createToolMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Container className="h-4 w-4 mr-2" />
                  )}
                  Create in Container
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // AI-assisted generation
                    setCurrentTool({
                      ...currentTool,
                      code: `// AI-generated tool based on: ${currentTool.description}\n\nfunction process(input) {\n  // Implementation here\n  return output;\n}`
                    });
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="flex-1 space-y-4 p-4">
          <Card>
            <CardHeader>
              <CardTitle>Container Testing Environment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tools.filter(t => t.status === 'testing').map(tool => (
                <div key={tool.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={tool.status === 'validated' ? 'default' : 'secondary'}>
                        {tool.status}
                      </Badge>
                      <span className="font-medium">{tool.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleTestTool(tool.id)}
                        disabled={testToolMutation.isPending}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Run Test
                      </Button>
                      {tool.status === 'validated' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deployToolMutation.mutate(tool.id)}
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Deploy
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Test Input</Label>
                    <Textarea
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      placeholder="Enter test input..."
                      rows={3}
                      className="font-mono text-sm"
                    />
                  </div>

                  {tool.testResults && tool.testResults.length > 0 && (
                    <div className="space-y-2">
                      <Label>Test Results</Label>
                      <ScrollArea className="h-32 border rounded p-2">
                        {tool.testResults.map((result) => (
                          <div key={result.id} className="mb-2 p-2 bg-muted rounded">
                            <div className="flex items-center gap-2 mb-1">
                              {result.success ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="text-xs text-muted-foreground">
                                {result.executionTime}ms
                              </span>
                            </div>
                            <pre className="text-xs font-mono">
                              {result.output || result.error}
                            </pre>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  )}
                </div>
              ))}

              {tools.filter(t => t.status === 'testing').length === 0 && (
                <Alert>
                  <AlertDescription>
                    No tools in testing. Create a tool to start testing in the container.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="flex-1 space-y-4 p-4">
          <Card>
            <CardHeader>
              <CardTitle>Tool Library</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {tools.map(tool => (
                    <div key={tool.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <span className="font-medium">{tool.name}</span>
                          {tool.isTemporary && (
                            <Badge variant="outline" className="text-xs">
                              Temporary
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            tool.status === 'validated' ? 'default' :
                            tool.status === 'failed' ? 'destructive' :
                            'secondary'
                          }>
                            {tool.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteToolMutation.mutate(tool.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{tool.language}</span>
                        <span>Created {new Date(tool.createdAt).toLocaleDateString()}</span>
                        {tool.containerId && (
                          <span className="flex items-center gap-1">
                            <Container className="h-3 w-3" />
                            {tool.containerId.slice(0, 8)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}