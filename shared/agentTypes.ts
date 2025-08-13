// AI Agent System Types - Specialized agent roles and configurations
import { z } from 'zod';

// Agent Roles and Specializations
export enum AgentRole {
  TASK_MANAGER = 'task_manager',
  CODE_ANALYST = 'code_analyst',
  WORKFLOW_COORDINATOR = 'workflow_coordinator',
  MEMORY_CURATOR = 'memory_curator',
  FEATURE_ARCHITECT = 'feature_architect',
  PERFORMANCE_OPTIMIZER = 'performance_optimizer',
  SECURITY_AUDITOR = 'security_auditor',
  USER_INTERFACE = 'user_interface',
  DATA_PROCESSOR = 'data_processor',
  INTEGRATION_SPECIALIST = 'integration_specialist'
}

// Agent Capabilities
export interface AgentCapability {
  name: string;
  description: string;
  inputTypes: string[];
  outputTypes: string[];
  requiredTools: string[];
  confidence: number;
}

// Agent Status
export enum AgentStatus {
  IDLE = 'idle',
  ACTIVE = 'active',
  BUSY = 'busy',
  ERROR = 'error',
  OFFLINE = 'offline'
}

// Agent Communication Protocol
export interface AgentMessage {
  id: string;
  fromAgent: string;
  toAgent: string;
  messageType: 'REQUEST' | 'RESPONSE' | 'NOTIFICATION' | 'DELEGATION';
  payload: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  correlationId?: string;
}

// Agent Configuration
export interface AgentConfig {
  id: string;
  role: AgentRole;
  name: string;
  description: string;
  capabilities: AgentCapability[];
  maxConcurrentTasks: number;
  memorySize: number;
  toolAccess: string[];
  collaborationRules: CollaborationRule[];
  autonomyLevel: 'supervised' | 'semi_autonomous' | 'fully_autonomous';
  learningEnabled: boolean;
}

// Collaboration Rules
export interface CollaborationRule {
  condition: string;
  action: 'delegate' | 'consult' | 'escalate' | 'parallel' | 'sequence';
  targetAgent: AgentRole;
  priority: number;
}

// Agent Performance Metrics
export interface AgentMetrics {
  agentId: string;
  tasksCompleted: number;
  averageResponseTime: number;
  successRate: number;
  collaborationCount: number;
  learningProgress: number;
  uptime: number;
  lastActivity: Date;
}

// Task Assignment
export interface TaskAssignment {
  id: string;
  taskId: string;
  assignedAgent: string;
  priority: number;
  deadline?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
  metadata: Record<string, any>;
}

// Agent Decision Context
export interface DecisionContext {
  currentTask: string;
  availableAgents: AgentConfig[];
  systemLoad: number;
  userPreferences: Record<string, any>;
  historicalPerformance: AgentMetrics[];
  constraints: string[];
}

// Multi-Agent Workflow
export interface MultiAgentWorkflow {
  id: string;
  name: string;
  description: string;
  agents: AgentRole[];
  coordination: 'sequential' | 'parallel' | 'hybrid';
  entryPoint: AgentRole;
  completionCriteria: string[];
  errorHandling: 'retry' | 'escalate' | 'fallback';
}

// Agent Learning Record
export interface AgentLearningRecord {
  agentId: string;
  scenario: string;
  decision: string;
  outcome: 'success' | 'failure' | 'partial';
  feedback: string;
  improvementSuggestions: string[];
  timestamp: Date;
}

// Schema definitions for validation
export const agentConfigSchema = z.object({
  id: z.string(),
  role: z.nativeEnum(AgentRole),
  name: z.string(),
  description: z.string(),
  maxConcurrentTasks: z.number().min(1).max(10),
  memorySize: z.number().min(1),
  toolAccess: z.array(z.string()),
  autonomyLevel: z.enum(['supervised', 'semi_autonomous', 'fully_autonomous']),
  learningEnabled: z.boolean(),
});

export const agentMessageSchema = z.object({
  fromAgent: z.string(),
  toAgent: z.string(),
  messageType: z.enum(['REQUEST', 'RESPONSE', 'NOTIFICATION', 'DELEGATION']),
  payload: z.any(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
});

export const taskAssignmentSchema = z.object({
  taskId: z.string(),
  assignedAgent: z.string(),
  priority: z.number().min(1).max(10),
  deadline: z.date().optional(),
  metadata: z.record(z.any()),
});

// Agent Response Types
export type AgentResponse = {
  success: boolean;
  result?: any;
  error?: string;
  suggestions?: string[];
  nextActions?: string[];
  collaborationNeeded?: AgentRole[];
};

// Agent Specialization Configs
export const AGENT_SPECIALIZATIONS: Record<AgentRole, Partial<AgentConfig>> = {
  [AgentRole.TASK_MANAGER]: {
    name: 'Task Manager',
    description: 'Coordinates task planning, assignment, and tracking',
    capabilities: [
      {
        name: 'Task Decomposition',
        description: 'Break complex tasks into manageable subtasks',
        inputTypes: ['task_description', 'requirements'],
        outputTypes: ['task_list', 'dependencies'],
        requiredTools: ['task_analyzer'],
        confidence: 0.9
      },
      {
        name: 'Resource Allocation',
        description: 'Assign tasks to appropriate agents based on capabilities',
        inputTypes: ['task_list', 'agent_availability'],
        outputTypes: ['task_assignments'],
        requiredTools: ['agent_registry'],
        confidence: 0.85
      }
    ],
    autonomyLevel: 'semi_autonomous',
    maxConcurrentTasks: 5
  },
  [AgentRole.CODE_ANALYST]: {
    name: 'Code Analyst',
    description: 'Analyzes code quality, security, and suggests improvements',
    capabilities: [
      {
        name: 'Code Review',
        description: 'Analyze code for quality, bugs, and best practices',
        inputTypes: ['source_code'],
        outputTypes: ['review_report', 'suggestions'],
        requiredTools: ['static_analyzer', 'linter'],
        confidence: 0.92
      },
      {
        name: 'Security Audit',
        description: 'Identify security vulnerabilities and risks',
        inputTypes: ['source_code', 'dependencies'],
        outputTypes: ['security_report'],
        requiredTools: ['security_scanner'],
        confidence: 0.88
      }
    ],
    autonomyLevel: 'fully_autonomous',
    maxConcurrentTasks: 3
  },
  [AgentRole.WORKFLOW_COORDINATOR]: {
    name: 'Workflow Coordinator',
    description: 'Orchestrates complex multi-step workflows',
    capabilities: [
      {
        name: 'Workflow Design',
        description: 'Create optimized workflow sequences',
        inputTypes: ['requirements', 'constraints'],
        outputTypes: ['workflow_definition'],
        requiredTools: ['workflow_designer'],
        confidence: 0.87
      }
    ],
    autonomyLevel: 'semi_autonomous',
    maxConcurrentTasks: 4
  },
  [AgentRole.MEMORY_CURATOR]: {
    name: 'Memory Curator',
    description: 'Manages knowledge storage and retrieval optimization',
    capabilities: [
      {
        name: 'Knowledge Organization',
        description: 'Organize and structure knowledge for optimal retrieval',
        inputTypes: ['raw_data', 'context'],
        outputTypes: ['structured_knowledge'],
        requiredTools: ['memory_service'],
        confidence: 0.89
      }
    ],
    autonomyLevel: 'fully_autonomous',
    maxConcurrentTasks: 2
  },
  [AgentRole.FEATURE_ARCHITECT]: {
    name: 'Feature Architect',
    description: 'Designs and proposes new system features',
    capabilities: [
      {
        name: 'Feature Design',
        description: 'Design comprehensive feature specifications',
        inputTypes: ['requirements', 'user_feedback'],
        outputTypes: ['feature_spec', 'implementation_plan'],
        requiredTools: ['design_analyzer'],
        confidence: 0.86
      }
    ],
    autonomyLevel: 'supervised',
    maxConcurrentTasks: 2
  },
  [AgentRole.PERFORMANCE_OPTIMIZER]: {
    name: 'Performance Optimizer',
    description: 'Monitors and optimizes system performance',
    capabilities: [
      {
        name: 'Performance Analysis',
        description: 'Analyze system performance and identify bottlenecks',
        inputTypes: ['metrics', 'logs'],
        outputTypes: ['performance_report', 'optimization_plan'],
        requiredTools: ['performance_monitor'],
        confidence: 0.91
      }
    ],
    autonomyLevel: 'fully_autonomous',
    maxConcurrentTasks: 3
  },
  [AgentRole.SECURITY_AUDITOR]: {
    name: 'Security Auditor',
    description: 'Continuous security monitoring and threat assessment',
    capabilities: [
      {
        name: 'Threat Detection',
        description: 'Identify and assess security threats',
        inputTypes: ['system_logs', 'network_traffic'],
        outputTypes: ['threat_report'],
        requiredTools: ['security_monitor'],
        confidence: 0.93
      }
    ],
    autonomyLevel: 'fully_autonomous',
    maxConcurrentTasks: 2
  },
  [AgentRole.USER_INTERFACE]: {
    name: 'User Interface Agent',
    description: 'Handles user interactions and communication',
    capabilities: [
      {
        name: 'User Communication',
        description: 'Interpret user requests and provide responses',
        inputTypes: ['user_input'],
        outputTypes: ['response', 'action_plan'],
        requiredTools: ['nlp_processor'],
        confidence: 0.84
      }
    ],
    autonomyLevel: 'supervised',
    maxConcurrentTasks: 4
  },
  [AgentRole.DATA_PROCESSOR]: {
    name: 'Data Processor',
    description: 'Handles data transformation and analysis',
    capabilities: [
      {
        name: 'Data Analysis',
        description: 'Process and analyze various data formats',
        inputTypes: ['raw_data'],
        outputTypes: ['processed_data', 'insights'],
        requiredTools: ['data_analyzer'],
        confidence: 0.88
      }
    ],
    autonomyLevel: 'fully_autonomous',
    maxConcurrentTasks: 3
  },
  [AgentRole.INTEGRATION_SPECIALIST]: {
    name: 'Integration Specialist',
    description: 'Manages external API and service integrations',
    capabilities: [
      {
        name: 'API Integration',
        description: 'Set up and manage external service connections',
        inputTypes: ['api_spec', 'credentials'],
        outputTypes: ['integration_config'],
        requiredTools: ['api_client'],
        confidence: 0.85
      }
    ],
    autonomyLevel: 'semi_autonomous',
    maxConcurrentTasks: 3
  }
};