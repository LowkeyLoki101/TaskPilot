// AI Agent Registry - Manages specialized AI agents with role-based coordination
import {
  AgentRole,
  AgentConfig,
  AgentStatus,
  AgentMessage,
  AgentMetrics,
  TaskAssignment,
  AgentResponse,
  DecisionContext,
  AgentLearningRecord,
  AGENT_SPECIALIZATIONS,
  agentConfigSchema,
  agentMessageSchema,
  taskAssignmentSchema
} from '@shared/agentTypes';
import { MemoryService } from './memoryService';
import { ToolRegistryService } from './toolRegistryService';
import { randomUUID } from 'crypto';

// Base Agent Class
abstract class BaseAgent {
  protected config: AgentConfig;
  protected status: AgentStatus = AgentStatus.IDLE;
  protected currentTasks: Map<string, TaskAssignment> = new Map();
  protected metrics: AgentMetrics;
  protected messageQueue: AgentMessage[] = [];

  constructor(config: AgentConfig) {
    this.config = config;
    this.metrics = {
      agentId: config.id,
      tasksCompleted: 0,
      averageResponseTime: 0,
      successRate: 1.0,
      collaborationCount: 0,
      learningProgress: 0,
      uptime: 0,
      lastActivity: new Date()
    };
  }

  // Abstract methods that each specialized agent must implement
  abstract processTask(task: TaskAssignment): Promise<AgentResponse>;
  abstract handleMessage(message: AgentMessage): Promise<AgentResponse>;

  // Common agent functionality
  async executeTask(task: TaskAssignment): Promise<AgentResponse> {
    if (this.currentTasks.size >= this.config.maxConcurrentTasks) {
      return {
        success: false,
        error: 'Agent at maximum capacity',
        suggestions: ['Try again later', 'Delegate to another agent']
      };
    }

    this.status = AgentStatus.BUSY;
    this.currentTasks.set(task.id, task);
    
    const startTime = Date.now();
    
    try {
      // Record task start in memory
      await MemoryService.recordEvent(
        'AGENT_TASK_START',
        {
          agentId: this.config.id,
          taskId: task.id,
          role: this.config.role
        },
        `Agent ${this.config.name} started task ${task.taskId}`
      );

      const result = await this.processTask(task);
      
      // Update metrics
      const duration = Date.now() - startTime;
      this.updateMetrics(duration, result.success);
      
      // Record completion
      await MemoryService.recordEvent(
        'AGENT_TASK_COMPLETE',
        {
          agentId: this.config.id,
          taskId: task.id,
          success: result.success,
          duration
        },
        `Agent ${this.config.name} completed task with ${result.success ? 'success' : 'failure'}`
      );

      return result;
    } catch (error) {
      console.error(`Agent ${this.config.id} task execution error:`, error);
      this.updateMetrics(Date.now() - startTime, false);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        suggestions: ['Retry with different parameters', 'Escalate to human operator']
      };
    } finally {
      this.currentTasks.delete(task.id);
      this.status = this.currentTasks.size > 0 ? AgentStatus.BUSY : AgentStatus.IDLE;
    }
  }

  protected updateMetrics(duration: number, success: boolean): void {
    this.metrics.tasksCompleted++;
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.tasksCompleted - 1) + duration) / 
      this.metrics.tasksCompleted;
    
    this.metrics.successRate = 
      (this.metrics.successRate * (this.metrics.tasksCompleted - 1) + (success ? 1 : 0)) / 
      this.metrics.tasksCompleted;
    
    this.metrics.lastActivity = new Date();
  }

  // Agent communication
  async sendMessage(toAgent: string, messageType: AgentMessage['messageType'], payload: any): Promise<void> {
    const message: AgentMessage = {
      id: randomUUID(),
      fromAgent: this.config.id,
      toAgent,
      messageType,
      payload,
      priority: 'medium',
      timestamp: new Date()
    };

    await AgentRegistry.routeMessage(message);
  }

  getStatus(): AgentStatus {
    return this.status;
  }

  getMetrics(): AgentMetrics {
    return { ...this.metrics };
  }

  getConfig(): AgentConfig {
    return { ...this.config };
  }
}

// Specialized Agent Implementations
class TaskManagerAgent extends BaseAgent {
  async processTask(task: TaskAssignment): Promise<AgentResponse> {
    const { taskId, metadata } = task;
    
    // Analyze task complexity and decompose if needed
    const complexity = await this.analyzeTaskComplexity(metadata);
    
    if (complexity.requiresDecomposition) {
      const subtasks = await this.decomposeTask(taskId, metadata);
      const assignments = await this.assignSubtasks(subtasks);
      
      return {
        success: true,
        result: {
          type: 'task_decomposition',
          subtasks,
          assignments
        },
        nextActions: ['Monitor subtask progress', 'Coordinate with assigned agents']
      };
    }

    // Simple task - delegate to appropriate specialist
    const specialist = await this.findBestSpecialist(metadata);
    
    return {
      success: true,
      result: {
        type: 'task_delegation',
        assignedAgent: specialist
      },
      collaborationNeeded: [specialist]
    };
  }

  async handleMessage(message: AgentMessage): Promise<AgentResponse> {
    switch (message.messageType) {
      case 'REQUEST':
        return await this.handleTaskRequest(message.payload);
      case 'RESPONSE':
        return await this.handleAgentResponse(message.payload);
      default:
        return { success: false, error: 'Unknown message type' };
    }
  }

  private async analyzeTaskComplexity(metadata: any): Promise<{ requiresDecomposition: boolean; complexity: number }> {
    // Implement complexity analysis logic
    const complexity = metadata.estimatedHours > 2 ? 0.8 : 0.3;
    return {
      requiresDecomposition: complexity > 0.6,
      complexity
    };
  }

  private async decomposeTask(taskId: string, metadata: any): Promise<string[]> {
    // Use AI to decompose task into subtasks
    return [`${taskId}_analysis`, `${taskId}_implementation`, `${taskId}_testing`];
  }

  private async assignSubtasks(subtasks: string[]): Promise<Record<string, AgentRole>> {
    return {
      [`${subtasks[0]}`]: AgentRole.CODE_ANALYST,
      [`${subtasks[1]}`]: AgentRole.FEATURE_ARCHITECT,
      [`${subtasks[2]}`]: AgentRole.PERFORMANCE_OPTIMIZER
    };
  }

  private async findBestSpecialist(metadata: any): Promise<AgentRole> {
    if (metadata.type === 'code_review') return AgentRole.CODE_ANALYST;
    if (metadata.type === 'performance') return AgentRole.PERFORMANCE_OPTIMIZER;
    if (metadata.type === 'feature_design') return AgentRole.FEATURE_ARCHITECT;
    return AgentRole.DATA_PROCESSOR;
  }

  private async handleTaskRequest(payload: any): Promise<AgentResponse> {
    return { success: true, result: 'Task request acknowledged' };
  }

  private async handleAgentResponse(payload: any): Promise<AgentResponse> {
    return { success: true, result: 'Agent response processed' };
  }
}

class CodeAnalystAgent extends BaseAgent {
  async processTask(task: TaskAssignment): Promise<AgentResponse> {
    const { metadata } = task;
    
    if (metadata.type === 'code_review') {
      return await this.performCodeReview(metadata.code, metadata.context);
    }
    
    if (metadata.type === 'security_audit') {
      return await this.performSecurityAudit(metadata.code);
    }
    
    return {
      success: false,
      error: 'Unknown task type for Code Analyst'
    };
  }

  async handleMessage(message: AgentMessage): Promise<AgentResponse> {
    if (message.messageType === 'REQUEST' && message.payload.type === 'code_analysis') {
      return await this.performCodeReview(message.payload.code, message.payload.context);
    }
    
    return { success: false, error: 'Unsupported message type' };
  }

  private async performCodeReview(code: string, context: any): Promise<AgentResponse> {
    // Simulate code analysis
    const issues = await this.analyzeCodeQuality(code);
    const suggestions = await this.generateImprovements(code, issues);
    
    return {
      success: true,
      result: {
        type: 'code_review',
        issues,
        suggestions,
        score: this.calculateQualityScore(issues),
        recommendations: suggestions.slice(0, 3)
      },
      suggestions: ['Apply suggested improvements', 'Run automated tests', 'Schedule follow-up review']
    };
  }

  private async performSecurityAudit(code: string): Promise<AgentResponse> {
    const vulnerabilities = await this.scanForVulnerabilities(code);
    
    return {
      success: true,
      result: {
        type: 'security_audit',
        vulnerabilities,
        riskLevel: this.assessRiskLevel(vulnerabilities),
        mitigations: this.suggestMitigations(vulnerabilities)
      }
    };
  }

  private async analyzeCodeQuality(code: string): Promise<any[]> {
    return [
      { type: 'style', severity: 'low', description: 'Consider using const instead of let' },
      { type: 'performance', severity: 'medium', description: 'Expensive operation in loop' }
    ];
  }

  private async generateImprovements(code: string, issues: any[]): Promise<string[]> {
    return [
      'Extract repeated logic into helper functions',
      'Add error handling for async operations',
      'Implement input validation'
    ];
  }

  private calculateQualityScore(issues: any[]): number {
    const severityWeights: Record<string, number> = { low: 1, medium: 3, high: 5 };
    const totalWeight = issues.reduce((sum, issue) => sum + (severityWeights[issue.severity] || 1), 0);
    return Math.max(0, 100 - totalWeight * 2);
  }

  private async scanForVulnerabilities(code: string): Promise<any[]> {
    return []; // Placeholder for security scanning
  }

  private assessRiskLevel(vulnerabilities: any[]): string {
    return vulnerabilities.length > 0 ? 'medium' : 'low';
  }

  private suggestMitigations(vulnerabilities: any[]): string[] {
    return ['Update dependencies', 'Implement input sanitization'];
  }
}

class MemoryCuratorAgent extends BaseAgent {
  async processTask(task: TaskAssignment): Promise<AgentResponse> {
    const { metadata } = task;
    
    if (metadata.type === 'knowledge_organization') {
      return await this.organizeKnowledge(metadata.data);
    }
    
    if (metadata.type === 'memory_optimization') {
      return await this.optimizeMemory();
    }
    
    return {
      success: false,
      error: 'Unknown task type for Memory Curator'
    };
  }

  async handleMessage(message: AgentMessage): Promise<AgentResponse> {
    return { success: true, result: 'Message processed by Memory Curator' };
  }

  private async organizeKnowledge(data: any): Promise<AgentResponse> {
    // Organize data in memory system
    await MemoryService.recordEvent(
      'KNOWLEDGE_ORGANIZATION',
      data,
      'Knowledge organized by Memory Curator'
    );
    
    return {
      success: true,
      result: {
        type: 'knowledge_organized',
        itemsProcessed: Array.isArray(data) ? data.length : 1,
        categories: ['technical', 'user_preference', 'workflow']
      }
    };
  }

  private async optimizeMemory(): Promise<AgentResponse> {
    // Trigger memory optimization
    await MemoryService.stm.processDecay();
    
    return {
      success: true,
      result: {
        type: 'memory_optimized',
        action: 'decay_processed',
        timestamp: new Date()
      }
    };
  }
}

// Agent Registry - Central management system
export class AgentRegistry {
  private static agents: Map<string, BaseAgent> = new Map();
  private static messageQueue: AgentMessage[] = [];
  private static isProcessingMessages = false;

  static async initialize(): Promise<void> {
    // Initialize core agents
    await this.createAgent(AgentRole.TASK_MANAGER, 'task-manager-001');
    await this.createAgent(AgentRole.CODE_ANALYST, 'code-analyst-001');
    await this.createAgent(AgentRole.MEMORY_CURATOR, 'memory-curator-001');
    await this.createAgent(AgentRole.WORKFLOW_COORDINATOR, 'workflow-coordinator-001');
    await this.createAgent(AgentRole.FEATURE_ARCHITECT, 'feature-architect-001');

    // Start message processing
    this.startMessageProcessing();
    
    console.log('🤖 Agent Registry initialized with', this.agents.size, 'agents');
  }

  static async createAgent(role: AgentRole, id: string): Promise<BaseAgent> {
    const baseConfig = AGENT_SPECIALIZATIONS[role];
    const config: AgentConfig = {
      id,
      role,
      ...baseConfig,
      capabilities: baseConfig.capabilities || [],
      toolAccess: baseConfig.toolAccess || [],
      collaborationRules: [],
      learningEnabled: true
    } as AgentConfig;

    let agent: BaseAgent;
    
    switch (role) {
      case AgentRole.TASK_MANAGER:
        agent = new TaskManagerAgent(config);
        break;
      case AgentRole.CODE_ANALYST:
        agent = new CodeAnalystAgent(config);
        break;
      case AgentRole.MEMORY_CURATOR:
        agent = new MemoryCuratorAgent(config);
        break;
      default:
        // Generic agent for other roles
        agent = new TaskManagerAgent(config); // Fallback
    }

    this.agents.set(id, agent);
    
    // Record agent creation
    await MemoryService.recordEvent(
      'AGENT_CREATED',
      { agentId: id, role },
      `Created ${role} agent with ID ${id}`
    );

    return agent;
  }

  static getAgent(id: string): BaseAgent | undefined {
    return this.agents.get(id);
  }

  static getAgentsByRole(role: AgentRole): BaseAgent[] {
    return Array.from(this.agents.values()).filter(agent => 
      agent.getConfig().role === role
    );
  }

  static getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  static async assignTask(task: TaskAssignment): Promise<AgentResponse> {
    const agent = this.agents.get(task.assignedAgent);
    if (!agent) {
      return {
        success: false,
        error: `Agent ${task.assignedAgent} not found`
      };
    }

    return await agent.executeTask(task);
  }

  static async routeMessage(message: AgentMessage): Promise<void> {
    this.messageQueue.push(message);
    
    if (!this.isProcessingMessages) {
      this.processMessageQueue();
    }
  }

  private static async processMessageQueue(): Promise<void> {
    this.isProcessingMessages = true;
    
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      const agent = this.agents.get(message.toAgent);
      
      if (agent) {
        try {
          await agent.handleMessage(message);
        } catch (error) {
          console.error('Error processing agent message:', error);
        }
      }
    }
    
    this.isProcessingMessages = false;
  }

  private static startMessageProcessing(): void {
    setInterval(() => {
      if (this.messageQueue.length > 0 && !this.isProcessingMessages) {
        this.processMessageQueue();
      }
    }, 1000);
  }

  static getSystemMetrics(): any {
    const agents = this.getAllAgents();
    return {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.getStatus() === AgentStatus.ACTIVE).length,
      busyAgents: agents.filter(a => a.getStatus() === AgentStatus.BUSY).length,
      totalTasksCompleted: agents.reduce((sum, a) => sum + a.getMetrics().tasksCompleted, 0),
      averageSuccessRate: agents.reduce((sum, a) => sum + a.getMetrics().successRate, 0) / agents.length,
      queuedMessages: this.messageQueue.length
    };
  }

  // Smart task assignment based on agent capabilities and current load
  static async findBestAgentForTask(
    taskType: string, 
    requirements: string[], 
    context: DecisionContext
  ): Promise<string | null> {
    const candidates = this.getAllAgents().filter(agent => {
      const config = agent.getConfig();
      const metrics = agent.getMetrics();
      
      // Check if agent has required capabilities
      const hasCapability = config.capabilities.some(cap => 
        cap.inputTypes.includes(taskType) || 
        requirements.some(req => cap.name.toLowerCase().includes(req.toLowerCase()))
      );
      
      // Check availability
      const isAvailable = agent.getStatus() !== AgentStatus.ERROR && 
                         agent.getStatus() !== AgentStatus.OFFLINE;
      
      // Check success rate
      const hasGoodPerformance = metrics.successRate > 0.7;
      
      return hasCapability && isAvailable && hasGoodPerformance;
    });

    if (candidates.length === 0) {
      return null;
    }

    // Score candidates based on multiple factors
    const scoredCandidates = candidates.map(agent => {
      const metrics = agent.getMetrics();
      const config = agent.getConfig();
      
      let score = 0;
      
      // Performance score (40%)
      score += metrics.successRate * 0.4;
      
      // Availability score (30%)
      const loadFactor = agent.getStatus() === AgentStatus.IDLE ? 1 : 0.5;
      score += loadFactor * 0.3;
      
      // Response time score (20%)
      const responseScore = Math.max(0, 1 - (metrics.averageResponseTime / 10000));
      score += responseScore * 0.2;
      
      // Specialization match (10%)
      const specializationMatch = config.capabilities.some(cap => 
        requirements.some(req => cap.name.toLowerCase().includes(req.toLowerCase()))
      ) ? 1 : 0.5;
      score += specializationMatch * 0.1;
      
      return { agent, score };
    });

    // Return the best candidate
    scoredCandidates.sort((a, b) => b.score - a.score);
    return scoredCandidates[0].agent.getConfig().id;
  }
}