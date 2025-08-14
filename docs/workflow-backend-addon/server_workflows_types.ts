// server/workflows/types.ts
export type ToolAction = 'api_call' | 'file_operation' | 'ai_prompt' | 'data_transform' | 'notification';

export type ToolType = 'youtube' | 'manual' | 'files' | 'art-generator' | 'web-search' | 'database' | 'custom';

export interface ToolConfig {
  action?: ToolAction;
  endpoint?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  outputVariable?: string;
  prompt?: string;
  fileOperation?: 'read' | 'write' | 'delete' | 'copy';
  filePath?: string;
}

export interface Tool {
  id: string;
  type: ToolType;
  name: string;
  description: string;
  config?: ToolConfig;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  tools: string[]; // tool ids
  completed?: boolean;
}

export interface Workflow {
  projectId: string;
  steps: WorkflowStep[];
  tools: Tool[];
}

export type ExecuteResult = {
  stepId: string;
  logs: string[];
  outputs: Record<string, any>;
  success: boolean;
};
