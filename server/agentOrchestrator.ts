// Agent Orchestrator - Coordinates multi-agent workflows and task distribution
import { AgentRegistry } from './agentRegistry';
import { MemoryService } from './memoryService';
import { ToolRegistryService } from './toolRegistryService';
import {
  AgentRole,
  AgentMessage,
  TaskAssignment,
  AgentResponse,
  DecisionContext,
  MultiAgentWorkflow,
  AgentLearningRecord
} from '@shared/agentTypes';
import { randomUUID } from 'crypto';

export interface OrchestrationRequest {
  type: 'task_completion' | 'code_review' | 'feature_development' | 'system_optimization';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  context: Record<string, any>;
  deadline?: Date;
  requiredSkills?: string[];
  constraints?: string[];
}

export interface OrchestrationResult {
  id: string;
  success: boolean;
  assignedAgents: string[];
  workflow: MultiAgentWorkflow;
  results: Record<string, AgentResponse>;
  duration: number;
  learningRecords: AgentLearningRecord[];
  recommendations: string[];
}

export class AgentOrchestrator {
  private static activeWorkflows: Map<string, MultiAgentWorkflow> = new Map();
  private static workflowResults: Map<string, OrchestrationResult> = new Map();

  static async initialize(): Promise<void> {
    // Initialize the agent registry
    await AgentRegistry.initialize();
    
    // Set up workflow monitoring
    this.startWorkflowMonitoring();
    
    console.log('🎭 Agent Orchestrator initialized');
  }

  // Main orchestration method - intelligently assigns and coordinates agents
  static async orchestrate(request: OrchestrationRequest): Promise<OrchestrationResult> {
    const orchestrationId = randomUUID();
    const startTime = Date.now();

    console.log(`🎭 Starting orchestration for: ${request.description}`);

    try {
      // Analyze the request and determine the best workflow strategy
      const workflowStrategy = await this.analyzeWorkflowStrategy(request);
      
      // Create workflow plan
      const workflow = await this.createWorkflowPlan(request, workflowStrategy);
      this.activeWorkflows.set(orchestrationId, workflow);

      // Execute the workflow
      const results = await this.executeWorkflow(workflow, request);
      
      // Collect learning records
      const learningRecords = await this.collectLearningRecords(workflow, results);
      
      // Generate recommendations for future improvements
      const recommendations = await this.generateRecommendations(request, results);

      const result: OrchestrationResult = {
        id: orchestrationId,
        success: Object.values(results).every(r => r.success),
        assignedAgents: workflow.agents.map(role => `${role}-001`), // Default IDs
        workflow,
        results,
        duration: Date.now() - startTime,
        learningRecords,
        recommendations
      };

      this.workflowResults.set(orchestrationId, result);
      
      // Record orchestration event in memory
      await MemoryService.recordEvent(
        'ORCHESTRATION_COMPLETED',
        {
          orchestrationId,
          requestType: request.type,
          success: result.success,
          agentsUsed: result.assignedAgents.length,
          duration: result.duration
        },
        `Orchestration completed: ${request.description}`
      );

      return result;

    } catch (error) {
      console.error('Orchestration failed:', error);
      
      const failedResult: OrchestrationResult = {
        id: orchestrationId,
        success: false,
        assignedAgents: [],
        workflow: {} as MultiAgentWorkflow,
        results: {},
        duration: Date.now() - startTime,
        learningRecords: [],
        recommendations: ['Review error logs', 'Consider simpler workflow', 'Check agent availability']
      };

      return failedResult;
    } finally {
      this.activeWorkflows.delete(orchestrationId);
    }
  }

  // Workflow strategy analysis - determines the best approach for the request
  private static async analyzeWorkflowStrategy(request: OrchestrationRequest): Promise<string> {
    const strategies = {
      'code_review': 'sequential_analysis',
      'feature_development': 'collaborative_design',
      'system_optimization': 'parallel_analysis',
      'task_completion': 'adaptive_delegation'
    };

    return strategies[request.type] || 'adaptive_delegation';
  }

  // Create a detailed workflow plan based on the request and strategy
  private static async createWorkflowPlan(
    request: OrchestrationRequest, 
    strategy: string
  ): Promise<MultiAgentWorkflow> {
    const workflowTemplates = {
      'sequential_analysis': {
        agents: [AgentRole.CODE_ANALYST, AgentRole.SECURITY_AUDITOR, AgentRole.PERFORMANCE_OPTIMIZER],
        coordination: 'sequential' as const,
        entryPoint: AgentRole.CODE_ANALYST
      },
      'collaborative_design': {
        agents: [AgentRole.FEATURE_ARCHITECT, AgentRole.CODE_ANALYST, AgentRole.TASK_MANAGER],
        coordination: 'hybrid' as const,
        entryPoint: AgentRole.FEATURE_ARCHITECT
      },
      'parallel_analysis': {
        agents: [AgentRole.PERFORMANCE_OPTIMIZER, AgentRole.MEMORY_CURATOR, AgentRole.DATA_PROCESSOR],
        coordination: 'parallel' as const,
        entryPoint: AgentRole.PERFORMANCE_OPTIMIZER
      },
      'adaptive_delegation': {
        agents: [AgentRole.TASK_MANAGER, AgentRole.USER_INTERFACE],
        coordination: 'hybrid' as const,
        entryPoint: AgentRole.TASK_MANAGER
      }
    };

    const template = workflowTemplates[strategy] || workflowTemplates['adaptive_delegation'];

    return {
      id: randomUUID(),
      name: `${request.type}_workflow_${Date.now()}`,
      description: `Workflow for: ${request.description}`,
      agents: template.agents,
      coordination: template.coordination,
      entryPoint: template.entryPoint,
      completionCriteria: ['All agents completed successfully', 'Results validated'],
      errorHandling: 'escalate'
    };
  }

  // Execute the multi-agent workflow
  private static async executeWorkflow(
    workflow: MultiAgentWorkflow, 
    request: OrchestrationRequest
  ): Promise<Record<string, AgentResponse>> {
    const results: Record<string, AgentResponse> = {};

    if (workflow.coordination === 'sequential') {
      // Execute agents one by one
      let previousResult: AgentResponse | null = null;
      
      for (const agentRole of workflow.agents) {
        const agentId = `${agentRole}-001`;
        const task = this.createTaskAssignment(request, agentRole, previousResult);
        
        const result = await AgentRegistry.assignTask(task);
        results[agentRole] = result;
        previousResult = result;
        
        if (!result.success && workflow.errorHandling === 'escalate') {
          break; // Stop on first failure
        }
      }
    } else if (workflow.coordination === 'parallel') {
      // Execute all agents simultaneously
      const promises = workflow.agents.map(async (agentRole) => {
        const agentId = `${agentRole}-001`;
        const task = this.createTaskAssignment(request, agentRole);
        const result = await AgentRegistry.assignTask(task);
        return { agentRole, result };
      });

      const parallelResults = await Promise.allSettled(promises);
      
      parallelResults.forEach((promiseResult, index) => {
        if (promiseResult.status === 'fulfilled') {
          results[promiseResult.value.agentRole] = promiseResult.value.result;
        } else {
          results[workflow.agents[index]] = {
            success: false,
            error: 'Parallel execution failed'
          };
        }
      });
    } else {
      // Hybrid approach - start with entry point, then adaptive coordination
      const entryAgent = workflow.entryPoint;
      const entryTask = this.createTaskAssignment(request, entryAgent);
      const entryResult = await AgentRegistry.assignTask(entryTask);
      results[entryAgent] = entryResult;

      // Determine next steps based on entry result
      if (entryResult.success && entryResult.collaborationNeeded) {
        for (const neededRole of entryResult.collaborationNeeded) {
          if (workflow.agents.includes(neededRole)) {
            const task = this.createTaskAssignment(request, neededRole, entryResult);
            const result = await AgentRegistry.assignTask(task);
            results[neededRole] = result;
          }
        }
      }
    }

    return results;
  }

  // Create task assignment for specific agent role
  private static createTaskAssignment(
    request: OrchestrationRequest,
    agentRole: AgentRole,
    previousResult?: AgentResponse | null
  ): TaskAssignment {
    return {
      id: randomUUID(),
      taskId: `${request.type}_${Date.now()}`,
      assignedAgent: `${agentRole}-001`,
      priority: this.mapPriorityToNumber(request.priority),
      status: 'pending',
      metadata: {
        type: request.type,
        description: request.description,
        context: request.context,
        previousResult: previousResult?.result,
        requiredSkills: request.requiredSkills || [],
        constraints: request.constraints || []
      }
    };
  }

  private static mapPriorityToNumber(priority: string): number {
    const mapping = { low: 3, medium: 5, high: 7, critical: 10 };
    return mapping[priority] || 5;
  }

  // Collect learning records from the workflow execution
  private static async collectLearningRecords(
    workflow: MultiAgentWorkflow,
    results: Record<string, AgentResponse>
  ): Promise<AgentLearningRecord[]> {
    const records: AgentLearningRecord[] = [];

    for (const [agentRole, result] of Object.entries(results)) {
      const record: AgentLearningRecord = {
        agentId: `${agentRole}-001`,
        scenario: `${workflow.name}_execution`,
        decision: `Executed ${agentRole} role in ${workflow.coordination} workflow`,
        outcome: result.success ? 'success' : 'failure',
        feedback: result.error || 'Task completed successfully',
        improvementSuggestions: result.suggestions || [],
        timestamp: new Date()
      };

      records.push(record);
    }

    return records;
  }

  // Generate recommendations for future orchestrations
  private static async generateRecommendations(
    request: OrchestrationRequest,
    results: Record<string, AgentResponse>
  ): Promise<string[]> {
    const recommendations: string[] = [];
    
    const successRate = Object.values(results).filter(r => r.success).length / Object.values(results).length;
    
    if (successRate < 0.5) {
      recommendations.push('Consider simplifying the workflow');
      recommendations.push('Check agent load balancing');
      recommendations.push('Review task decomposition strategy');
    } else if (successRate > 0.8) {
      recommendations.push('Current workflow is effective');
      recommendations.push('Consider applying this pattern to similar requests');
    }

    // Analyze specific agent performances
    for (const [agentRole, result] of Object.entries(results)) {
      if (!result.success) {
        recommendations.push(`Review ${agentRole} agent configuration`);
      }
      if (result.suggestions) {
        recommendations.push(...result.suggestions);
      }
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  // Monitor active workflows and handle timeouts
  private static startWorkflowMonitoring(): void {
    setInterval(() => {
      // Clean up old workflow results (keep for 1 hour)
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      
      for (const [id, result] of this.workflowResults.entries()) {
        if (Date.now() - result.duration > oneHourAgo) {
          this.workflowResults.delete(id);
        }
      }
    }, 300000); // Check every 5 minutes
  }

  // Public API methods
  static getActiveWorkflows(): MultiAgentWorkflow[] {
    return Array.from(this.activeWorkflows.values());
  }

  static getWorkflowResult(id: string): OrchestrationResult | undefined {
    return this.workflowResults.get(id);
  }

  static getSystemMetrics(): any {
    const agentMetrics = AgentRegistry.getSystemMetrics();
    
    return {
      ...agentMetrics,
      activeWorkflows: this.activeWorkflows.size,
      completedWorkflows: this.workflowResults.size,
      orchestrator: 'ready'
    };
  }

  // Smart task routing - automatically determines the best workflow for a request
  static async smartRoute(description: string, context: Record<string, any> = {}): Promise<OrchestrationResult> {
    // Analyze the description to determine request type
    const requestType = this.analyzeRequestType(description);
    
    // Determine priority based on keywords
    const priority = this.determinePriority(description);
    
    // Extract required skills from context
    const requiredSkills = this.extractRequiredSkills(description, context);

    const request: OrchestrationRequest = {
      type: requestType,
      description,
      priority,
      context,
      requiredSkills
    };

    return await this.orchestrate(request);
  }

  private static analyzeRequestType(description: string): OrchestrationRequest['type'] {
    const keywords = {
      'code_review': ['review', 'analyze', 'audit', 'check code', 'security'],
      'feature_development': ['feature', 'develop', 'implement', 'build', 'create'],
      'system_optimization': ['optimize', 'performance', 'speed up', 'efficiency', 'memory'],
      'task_completion': ['complete', 'finish', 'task', 'work on', 'handle']
    };

    const lowerDesc = description.toLowerCase();
    
    for (const [type, keywordList] of Object.entries(keywords)) {
      if (keywordList.some(keyword => lowerDesc.includes(keyword))) {
        return type as OrchestrationRequest['type'];
      }
    }

    return 'task_completion'; // Default
  }

  private static determinePriority(description: string): OrchestrationRequest['priority'] {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('urgent') || lowerDesc.includes('critical') || lowerDesc.includes('asap')) {
      return 'critical';
    }
    if (lowerDesc.includes('important') || lowerDesc.includes('priority')) {
      return 'high';
    }
    if (lowerDesc.includes('when convenient') || lowerDesc.includes('eventually')) {
      return 'low';
    }
    
    return 'medium'; // Default
  }

  private static extractRequiredSkills(description: string, context: Record<string, any>): string[] {
    const skills: string[] = [];
    const lowerDesc = description.toLowerCase();
    
    const skillKeywords = {
      'javascript': ['javascript', 'js', 'react', 'node'],
      'python': ['python', 'py', 'django', 'flask'],
      'database': ['database', 'sql', 'postgres', 'mysql'],
      'security': ['security', 'auth', 'encryption', 'vulnerability'],
      'performance': ['performance', 'optimization', 'speed', 'memory'],
      'ui_design': ['ui', 'design', 'interface', 'user experience']
    };

    for (const [skill, keywords] of Object.entries(skillKeywords)) {
      if (keywords.some(keyword => lowerDesc.includes(keyword))) {
        skills.push(skill);
      }
    }

    return skills;
  }
}