import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, Users, Briefcase, Code, Database, Globe, 
  MessageSquare, Eye, Settings, Bot, Sparkles, Shield,
  Cpu, Network, Wrench, Save, Edit2, ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AIAgent {
  id: string;
  name: string;
  role: string;
  model: string;
  status: 'active' | 'idle' | 'processing';
  responsibilities: string[];
  tools: string[];
  instructions: string;
  reportingTo?: string;
  subordinates?: string[];
  performance: {
    tasksCompleted: number;
    successRate: number;
    avgResponseTime: number;
  };
}

const defaultAgents: AIAgent[] = [
  {
    id: "orchestrator",
    name: "Master Orchestrator",
    role: "Executive AI Director",
    model: "GPT-5",
    status: "active",
    responsibilities: [
      "Coordinate all AI agents and their tasks",
      "Strategic decision making and planning",
      "Resource allocation and priority management",
      "High-level user interaction and understanding",
      "Quality control and performance monitoring"
    ],
    tools: [
      "agent-coordination",
      "workflow-generation",
      "priority-management",
      "performance-analytics"
    ],
    instructions: `You are the Master Orchestrator powered by GPT-5. Your role is to:
1. Understand user intent at the highest level
2. Delegate tasks to appropriate specialist agents
3. Ensure quality and coherence across all agent outputs
4. Make strategic decisions about resource allocation
5. Maintain context across all conversations and tasks
6. Learn from user preferences and adapt strategies
7. Always prioritize user goals and satisfaction`,
    subordinates: ["task-manager", "research-analyst", "code-specialist", "data-analyst", "communication-hub"],
    performance: {
      tasksCompleted: 156,
      successRate: 94.2,
      avgResponseTime: 1.2
    }
  },
  {
    id: "task-manager",
    name: "Task Management Agent",
    role: "Project Coordinator",
    model: "GPT-4o",
    status: "active",
    reportingTo: "orchestrator",
    responsibilities: [
      "Create and organize tasks from voice/text input",
      "Maintain task dependencies and relationships",
      "Track project progress and milestones",
      "Generate task breakdowns and estimates",
      "Manage deadlines and priorities"
    ],
    tools: [
      "task-crud",
      "mindmap-generation",
      "calendar-management",
      "dependency-tracking"
    ],
    instructions: `You are the Task Management Agent. Your role is to:
1. Parse user input accurately without changing their words unnecessarily
2. Create well-structured tasks with clear titles and descriptions
3. Automatically categorize and tag tasks appropriately
4. Set realistic priorities and deadlines
5. Break down complex tasks into manageable steps
6. Track dependencies between tasks
7. Keep task descriptions exactly as the user said them unless clarification is needed`,
    performance: {
      tasksCompleted: 89,
      successRate: 91.5,
      avgResponseTime: 0.8
    }
  },
  {
    id: "research-analyst",
    name: "Research & Analysis Agent",
    role: "Information Specialist",
    model: "GPT-4o",
    status: "idle",
    reportingTo: "orchestrator",
    responsibilities: [
      "Web research and information gathering",
      "Data analysis and synthesis",
      "Fact-checking and verification",
      "Report generation",
      "Trend analysis and insights"
    ],
    tools: [
      "web-search",
      "document-analysis",
      "data-extraction",
      "report-generation"
    ],
    instructions: `You are the Research Agent. Your responsibilities:
1. Conduct thorough research on requested topics
2. Verify information from multiple sources
3. Synthesize complex information into clear insights
4. Generate comprehensive reports
5. Identify trends and patterns
6. Provide evidence-based recommendations`,
    performance: {
      tasksCompleted: 45,
      successRate: 88.9,
      avgResponseTime: 2.5
    }
  },
  {
    id: "code-specialist",
    name: "Code Development Agent",
    role: "Technical Implementation",
    model: "GPT-4o",
    status: "processing",
    reportingTo: "orchestrator",
    responsibilities: [
      "Write and review code",
      "Debug and optimize implementations",
      "Database schema design",
      "API integration",
      "Technical documentation"
    ],
    tools: [
      "code-generation",
      "debugging",
      "testing",
      "documentation",
      "version-control"
    ],
    instructions: `You are the Code Specialist. Your role:
1. Write clean, efficient, well-documented code
2. Follow best practices and design patterns
3. Ensure code security and performance
4. Test thoroughly before deployment
5. Maintain clear technical documentation
6. Collaborate with other agents on technical requirements`,
    performance: {
      tasksCompleted: 234,
      successRate: 92.3,
      avgResponseTime: 1.5
    }
  },
  {
    id: "data-analyst",
    name: "Data Analysis Agent",
    role: "Data Intelligence",
    model: "GPT-4o",
    status: "idle",
    reportingTo: "orchestrator",
    responsibilities: [
      "Database operations and queries",
      "Data visualization",
      "Pattern recognition",
      "Performance metrics",
      "Predictive analytics"
    ],
    tools: [
      "sql-execution",
      "data-visualization",
      "statistical-analysis",
      "pattern-detection"
    ],
    instructions: `You are the Data Analyst. Your responsibilities:
1. Manage database operations efficiently
2. Create meaningful data visualizations
3. Identify patterns and anomalies
4. Generate actionable insights
5. Monitor system performance metrics
6. Provide predictive analytics and forecasts`,
    performance: {
      tasksCompleted: 67,
      successRate: 95.5,
      avgResponseTime: 1.8
    }
  },
  {
    id: "communication-hub",
    name: "Communication Agent",
    role: "User Interface Specialist",
    model: "GPT-4o",
    status: "active",
    reportingTo: "orchestrator",
    responsibilities: [
      "Natural language processing",
      "Voice interaction handling",
      "Multi-modal communication",
      "User feedback processing",
      "Notification management"
    ],
    tools: [
      "voice-recognition",
      "natural-language",
      "notification-system",
      "feedback-analysis"
    ],
    instructions: `You are the Communication Agent. Your role:
1. Process voice commands accurately
2. Understand user intent from natural language
3. Provide clear, concise responses
4. Manage all user notifications
5. Analyze user feedback for improvements
6. Maintain conversation context and history`,
    performance: {
      tasksCompleted: 312,
      successRate: 89.7,
      avgResponseTime: 0.5
    }
  }
];

export default function AgentsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState<AIAgent>(defaultAgents[0]);
  const [editingInstructions, setEditingInstructions] = useState(false);
  const [tempInstructions, setTempInstructions] = useState("");

  // Fetch agents configuration
  const { data: agents = defaultAgents } = useQuery({
    queryKey: ['/api/agents/config'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/agents/config');
        if (!response.ok) return defaultAgents;
        return await response.json();
      } catch {
        return defaultAgents;
      }
    }
  });

  // Update agent instructions mutation
  const updateInstructionsMutation = useMutation({
    mutationFn: async ({ agentId, instructions }: { agentId: string; instructions: string }) => {
      return apiRequest("PUT", `/api/agents/${agentId}/instructions`, { instructions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents/config'] });
      toast({
        title: "Instructions Updated",
        description: "Agent instructions have been successfully updated."
      });
      setEditingInstructions(false);
    }
  });

  const handleEditInstructions = () => {
    setTempInstructions(selectedAgent.instructions);
    setEditingInstructions(true);
  };

  const handleSaveInstructions = () => {
    updateInstructionsMutation.mutate({
      agentId: selectedAgent.id,
      instructions: tempInstructions
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'idle': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getModelBadgeColor = (model: string) => {
    return model === 'GPT-5' ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gradient-to-r from-blue-500 to-cyan-500';
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="h-7 w-7 text-primary" />
              AI Agents Management
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Monitor and configure your AI workforce
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Master Controller</div>
              <div className="font-semibold flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-purple-500" />
                GPT-5 Orchestrator
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 dark:bg-green-950">
              <div className={`h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse`} />
              System Active
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Agent List Sidebar */}
        <div className="w-80 border-r bg-muted/30">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {agents.map((agent: AIAgent) => (
                <Card
                  key={agent.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedAgent.id === agent.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-semibold text-sm">{agent.name}</div>
                          <div className="text-xs text-muted-foreground">{agent.role}</div>
                        </div>
                      </div>
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(agent.status)}`} />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <Badge className={`${getModelBadgeColor(agent.model)} text-white text-xs`}>
                        {agent.model}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{agent.performance.successRate}%</span>
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Agent Details */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              {/* Agent Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                      {selectedAgent.name}
                      <Badge className={`${getModelBadgeColor(selectedAgent.model)} text-white`}>
                        {selectedAgent.model}
                      </Badge>
                    </h2>
                    <p className="text-muted-foreground mt-1">{selectedAgent.role}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    <div className={`h-2 w-2 rounded-full ${getStatusColor(selectedAgent.status)} mr-2`} />
                    {selectedAgent.status}
                  </Badge>
                </div>
              </div>

              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="instructions">Instructions</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  {/* Responsibilities */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Responsibilities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedAgent.responsibilities.map((resp, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                            <span className="text-sm">{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Tools */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        Available Tools
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedAgent.tools.map((tool, idx) => (
                          <Badge key={idx} variant="secondary">
                            <Code className="h-3 w-3 mr-1" />
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="instructions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          Agent Instructions
                        </div>
                        {!editingInstructions ? (
                          <Button size="sm" onClick={handleEditInstructions}>
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingInstructions(false)}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={handleSaveInstructions}>
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                          </div>
                        )}
                      </CardTitle>
                      <CardDescription>
                        System prompts and behavioral instructions for this agent
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {editingInstructions ? (
                        <Textarea
                          value={tempInstructions}
                          onChange={(e) => setTempInstructions(e.target.value)}
                          className="min-h-[300px] font-mono text-sm"
                          placeholder="Enter agent instructions..."
                        />
                      ) : (
                        <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                          {selectedAgent.instructions}
                        </pre>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-2xl font-bold">{selectedAgent.performance.tasksCompleted}</div>
                        <p className="text-sm text-muted-foreground">Tasks Completed</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-2xl font-bold">{selectedAgent.performance.successRate}%</div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-2xl font-bold">{selectedAgent.performance.avgResponseTime}s</div>
                        <p className="text-sm text-muted-foreground">Avg Response Time</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="hierarchy" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Network className="h-5 w-5" />
                        Organizational Structure
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedAgent.reportingTo && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-2">Reports To:</div>
                          <Badge variant="outline" className="text-sm">
                            <Users className="h-3 w-3 mr-1" />
                            {agents.find((a: AIAgent) => a.id === selectedAgent.reportingTo)?.name}
                          </Badge>
                        </div>
                      )}
                      {selectedAgent.subordinates && selectedAgent.subordinates.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-2">Manages:</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedAgent.subordinates.map(subId => {
                              const sub = agents.find((a: AIAgent) => a.id === subId);
                              return sub ? (
                                <Badge key={subId} variant="secondary" className="text-sm">
                                  <Bot className="h-3 w-3 mr-1" />
                                  {sub.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}