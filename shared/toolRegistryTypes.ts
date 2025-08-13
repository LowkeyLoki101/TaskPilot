// Tool Registry Types for Emergent Intelligence

export interface Tool {
  id: string;
  name: string;
  description: string;
  type: 'internal' | 'external';
  category: ToolCategory;
  status: 'active' | 'inactive' | 'deprecated' | 'testing';
  version: string;
  icon?: string;
  permissions: ToolPermission[];
  configuration: ToolConfiguration;
  performance: ToolPerformanceMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export enum ToolCategory {
  WEB_AUTOMATION = 'WEB_AUTOMATION',
  DATA_PROCESSING = 'DATA_PROCESSING',
  COMMUNICATION = 'COMMUNICATION',
  FILE_MANAGEMENT = 'FILE_MANAGEMENT',
  AI_ANALYSIS = 'AI_ANALYSIS',
  PROJECT_MANAGEMENT = 'PROJECT_MANAGEMENT',
  CODE_GENERATION = 'CODE_GENERATION',
  MEDIA_PROCESSING = 'MEDIA_PROCESSING',
  RESEARCH = 'RESEARCH',
  INTEGRATION = 'INTEGRATION'
}

export interface ToolPermission {
  action: string; // e.g., 'read', 'write', 'execute', 'delete'
  resource: string; // e.g., 'files', 'network', 'database'
  level: 'none' | 'read' | 'write' | 'admin';
}

export interface ToolConfiguration {
  endpoint?: string; // For external tools
  apiKey?: string; // Encrypted
  authType?: 'none' | 'api_key' | 'oauth2' | 'basic';
  headers?: Record<string, string>;
  timeout?: number; // in milliseconds
  retryConfig?: {
    maxRetries: number;
    backoffMultiplier: number;
    maxBackoffMs: number;
  };
  rateLimit?: {
    requestsPerMinute: number;
    burstLimit: number;
  };
  sandbox?: boolean; // Whether to run in sandboxed environment
  schema?: any; // JSON Schema for tool input/output
}

export interface ToolPerformanceMetrics {
  totalCalls: number;
  successCount: number;
  failureCount: number;
  averageLatencyMs: number;
  lastUsed?: Date;
  errorRate: number; // Percentage
  commonErrors: ErrorPattern[];
  successRate: number; // Percentage
}

export interface ErrorPattern {
  errorType: string;
  message: string;
  count: number;
  lastOccurred: Date;
  suggestedFix?: string;
}

export interface ToolExecution {
  id: string;
  toolId: string;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'running' | 'success' | 'failure' | 'timeout';
  input: any;
  output?: any;
  error?: string;
  latencyMs?: number;
  userId?: string;
  taskId?: string;
  retryCount: number;
}

export interface ExternalToolRegistration {
  name: string;
  baseUrl: string;
  apiVersion: string;
  endpoints: ExternalEndpoint[];
  authentication: {
    type: 'api_key' | 'oauth2' | 'basic';
    credentials?: any; // Encrypted
  };
  documentation?: string;
  webhooks?: WebhookConfig[];
}

export interface ExternalEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  parameters: EndpointParameter[];
  responseSchema?: any; // JSON Schema
}

export interface EndpointParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description?: string;
  defaultValue?: any;
  validation?: any; // JSON Schema validation
}

export interface WebhookConfig {
  event: string;
  url: string;
  secret?: string;
  retryPolicy?: {
    maxRetries: number;
    retryDelayMs: number;
  };
}

export interface ToolRegistry {
  tools: Map<string, Tool>;
  
  registerTool(tool: Tool): Promise<void>;
  unregisterTool(toolId: string): Promise<void>;
  getTool(toolId: string): Tool | undefined;
  getToolsByCategory(category: ToolCategory): Tool[];
  getActiveTools(): Tool[];
  updateToolMetrics(toolId: string, execution: ToolExecution): Promise<void>;
  findToolForTask(taskDescription: string): Tool | undefined;
}