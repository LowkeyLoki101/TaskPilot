// Shared types for workflow system between client and server

export interface Tool {
  id: string;
  name: string;
  type: 'builtin' | 'custom';
  icon?: string;
  description: string;
  config?: ToolConfig;
  metadata?: Record<string, any>;
}

export interface ToolConfig {
  action?: 'api_call' | 'file_operation' | 'ai_prompt' | 'data_transform' | 'notification' | 'browser_action';
  // API call config
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  // File operation config
  fileOperation?: 'read' | 'write' | 'append' | 'delete';
  filePath?: string;
  content?: string;
  // AI prompt config
  prompt?: string;
  model?: string;
  temperature?: number;
  // Browser action config
  browserSessionId?: string;
  browserAction?: 'navigate' | 'click' | 'type' | 'screenshot';
  selector?: string;
  text?: string;
  url?: string;
  // Output configuration
  outputVariable?: string;
  outputType?: 'json' | 'text' | 'number' | 'boolean' | 'array';
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  tools: Tool[];
  order: number;
  conditions?: StepCondition[];
  outputs?: Record<string, any>;
  status?: 'pending' | 'running' | 'completed' | 'failed';
}

export interface StepCondition {
  type: 'if' | 'while' | 'foreach';
  expression: string;
  variable?: string;
}

export interface Workflow {
  id: string;
  projectId: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  tools: Tool[];
  variables: Record<string, any>;
  status: 'idle' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  executionHistory?: WorkflowExecution[];
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'running' | 'completed' | 'failed';
  results: Record<string, any>;
  logs: WorkflowLog[];
  error?: string;
}

export interface WorkflowLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  stepId?: string;
  toolId?: string;
  data?: any;
}

export interface CreateWorkflowRequest {
  name: string;
  description: string;
  steps: Omit<WorkflowStep, 'id' | 'status'>[];
  tools: Tool[];
  variables?: Record<string, any>;
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  steps?: WorkflowStep[];
  tools?: Tool[];
  variables?: Record<string, any>;
}

export interface ExecuteWorkflowRequest {
  variables?: Record<string, any>;
  stepIds?: string[];  // Optional: execute only specific steps
}

export interface ExecuteWorkflowResponse {
  executionId: string;
  status: 'started' | 'queued';
  estimatedDuration?: number;
}

export interface BrowserSessionRequest {
  url?: string;
  viewport?: { width: number; height: number };
}

export interface BrowserActionRequest {
  type: 'navigate' | 'click' | 'type' | 'screenshot' | 'getContent' | 'getInfo';
  url?: string;
  selector?: string;
  text?: string;
}

export interface BrowserActionResponse {
  success: boolean;
  message?: string;
  imageBase64?: string;
  content?: string;
  url?: string;
  title?: string;
  error?: string;
}