// Agents Page - Dedicated page for AI agent management and orchestration
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AgentDashboard } from '@/components/AgentDashboard';
import { Brain, Users, Network } from 'lucide-react';

export default function AgentsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-500" />
              AI Agent System
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Advanced multi-agent coordination and intelligent task management
            </p>
          </div>
        </div>

        {/* Key Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Specialized Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                10 specialized AI agents including Task Manager, Code Analyst, Memory Curator, 
                Feature Architect, and Performance Optimizer working in coordination.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Network className="h-5 w-5 text-blue-500" />
                Multi-Agent Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Sequential, parallel, and hybrid orchestration patterns for complex 
                task coordination with intelligent agent selection and fallback handling.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Autonomous Learning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Self-improving agents that learn from task outcomes, collaboration patterns, 
                and user feedback to optimize future performance.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Agent Dashboard */}
        <AgentDashboard />
      </div>
    </div>
  );
}