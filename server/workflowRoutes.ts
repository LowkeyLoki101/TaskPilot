import { Express, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import {
  Workflow,
  WorkflowStep,
  Tool,
  WorkflowExecution,
  WorkflowLog,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  ExecuteWorkflowRequest,
  ExecuteWorkflowResponse
} from '@shared/workflowTypes';
import { agentBrowserManager } from './agentBrowser';
import { AgentOrchestrator } from './agentOrchestrator';

// In-memory storage for workflows (replace with database later)
const workflows = new Map<string, Workflow>();
const executions = new Map<string, WorkflowExecution>();

export function registerWorkflowRoutes(app: Express) {
  // Get workflow for a project
  app.get('/api/projects/:projectId/workflow', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      
      // Find workflow for this project
      let workflow: Workflow | undefined;
      for (const [id, wf] of workflows) {
        if (wf.projectId === projectId) {
          workflow = wf;
          break;
        }
      }
      
      if (!workflow) {
        // Return a default empty workflow
        workflow = {
          id: randomUUID(),
          projectId,
          name: 'New Workflow',
          description: 'Configure your workflow',
          steps: [],
          tools: getDefaultTools(),
          variables: {},
          status: 'idle',
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      
      res.json(workflow);
    } catch (error) {
      console.error('Error fetching workflow:', error);
      res.status(500).json({ error: 'Failed to fetch workflow' });
    }
  });

  // Create or update workflow for a project
  app.post('/api/projects/:projectId/workflow', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const workflowData: CreateWorkflowRequest = req.body;
      
      // Find existing workflow
      let workflow: Workflow | undefined;
      for (const [id, wf] of workflows) {
        if (wf.projectId === projectId) {
          workflow = wf;
          break;
        }
      }
      
      if (workflow) {
        // Update existing workflow
        workflow.name = workflowData.name || workflow.name;
        workflow.description = workflowData.description || workflow.description;
        workflow.steps = workflowData.steps.map((step, index) => ({
          ...step,
          id: step.id || randomUUID(),
          order: index,
          status: 'pending'
        }));
        workflow.tools = workflowData.tools || workflow.tools;
        workflow.variables = workflowData.variables || workflow.variables;
        workflow.updatedAt = new Date();
      } else {
        // Create new workflow
        workflow = {
          id: randomUUID(),
          projectId,
          name: workflowData.name,
          description: workflowData.description,
          steps: workflowData.steps.map((step, index) => ({
            ...step,
            id: randomUUID(),
            order: index,
            status: 'pending'
          })),
          tools: workflowData.tools,
          variables: workflowData.variables || {},
          status: 'idle',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        workflows.set(workflow.id, workflow);
      }
      
      res.json(workflow);
    } catch (error) {
      console.error('Error saving workflow:', error);
      res.status(500).json({ error: 'Failed to save workflow' });
    }
  });

  // Execute workflow
  app.post('/api/projects/:projectId/workflow/execute', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const executeRequest: ExecuteWorkflowRequest = req.body;
      
      // Find workflow for this project
      let workflow: Workflow | undefined;
      for (const [id, wf] of workflows) {
        if (wf.projectId === projectId) {
          workflow = wf;
          break;
        }
      }
      
      if (!workflow) {
        return res.status(404).json({ error: 'Workflow not found' });
      }
      
      // Create execution record
      const execution: WorkflowExecution = {
        id: randomUUID(),
        workflowId: workflow.id,
        startedAt: new Date(),
        status: 'running',
        results: {},
        logs: []
      };
      
      executions.set(execution.id, execution);
      workflow.status = 'running';
      
      // Start async execution
      executeWorkflowAsync(workflow, execution, executeRequest);
      
      const response: ExecuteWorkflowResponse = {
        executionId: execution.id,
        status: 'started',
        estimatedDuration: workflow.steps.length * 2000 // Rough estimate
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error executing workflow:', error);
      res.status(500).json({ error: 'Failed to execute workflow' });
    }
  });

  // Get execution status
  app.get('/api/workflow/executions/:executionId', async (req: Request, res: Response) => {
    try {
      const { executionId } = req.params;
      const execution = executions.get(executionId);
      
      if (!execution) {
        return res.status(404).json({ error: 'Execution not found' });
      }
      
      res.json(execution);
    } catch (error) {
      console.error('Error fetching execution:', error);
      res.status(500).json({ error: 'Failed to fetch execution' });
    }
  });

  // Get workflow execution logs
  app.get('/api/workflow/executions/:executionId/logs', async (req: Request, res: Response) => {
    try {
      const { executionId } = req.params;
      const execution = executions.get(executionId);
      
      if (!execution) {
        return res.status(404).json({ error: 'Execution not found' });
      }
      
      res.json(execution.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      res.status(500).json({ error: 'Failed to fetch logs' });
    }
  });

  console.log('Workflow routes registered');
}

// Async workflow execution
async function executeWorkflowAsync(
  workflow: Workflow,
  execution: WorkflowExecution,
  request: ExecuteWorkflowRequest
) {
  const variables = { ...workflow.variables, ...request.variables };
  
  try {
    // Execute each step in order
    for (const step of workflow.steps) {
      if (request.stepIds && !request.stepIds.includes(step.id)) {
        continue; // Skip steps not in the requested list
      }
      
      execution.logs.push({
        timestamp: new Date(),
        level: 'info',
        message: `Starting step: ${step.name}`,
        stepId: step.id
      });
      
      step.status = 'running';
      
      // Execute tools in the step
      for (const tool of step.tools) {
        try {
          const result = await executeTool(tool, variables, execution);
          
          // Store output variable if configured
          if (tool.config?.outputVariable) {
            variables[tool.config.outputVariable] = result;
            execution.results[tool.config.outputVariable] = result;
          }
          
          execution.logs.push({
            timestamp: new Date(),
            level: 'info',
            message: `Tool ${tool.name} completed`,
            stepId: step.id,
            toolId: tool.id,
            data: result
          });
        } catch (error) {
          execution.logs.push({
            timestamp: new Date(),
            level: 'error',
            message: `Tool ${tool.name} failed: ${error}`,
            stepId: step.id,
            toolId: tool.id
          });
          throw error;
        }
      }
      
      step.status = 'completed';
      step.outputs = { ...variables };
    }
    
    // Mark execution as completed
    execution.status = 'completed';
    execution.completedAt = new Date();
    workflow.status = 'completed';
    
    execution.logs.push({
      timestamp: new Date(),
      level: 'info',
      message: 'Workflow completed successfully'
    });
  } catch (error) {
    execution.status = 'failed';
    execution.completedAt = new Date();
    execution.error = error instanceof Error ? error.message : 'Unknown error';
    workflow.status = 'failed';
    
    execution.logs.push({
      timestamp: new Date(),
      level: 'error',
      message: `Workflow failed: ${execution.error}`
    });
  }
}

// Execute a single tool
async function executeTool(
  tool: Tool,
  variables: Record<string, any>,
  execution: WorkflowExecution
): Promise<any> {
  const config = tool.config;
  
  if (!config || !config.action) {
    throw new Error(`Tool ${tool.name} is not configured`);
  }
  
  switch (config.action) {
    case 'api_call':
      return await executeApiCall(config, variables);
      
    case 'file_operation':
      return await executeFileOperation(config, variables);
      
    case 'ai_prompt':
      return await executeAiPrompt(config, variables);
      
    case 'browser_action':
      return await executeBrowserAction(config, variables);
      
    case 'data_transform':
      return await executeDataTransform(config, variables);
      
    case 'notification':
      return await executeNotification(config, variables);
      
    default:
      throw new Error(`Unknown action type: ${config.action}`);
  }
}

// Tool execution implementations
async function executeApiCall(config: any, variables: Record<string, any>) {
  const url = replaceVariables(config.endpoint || '', variables);
  const headers = config.headers || {};
  const body = config.body ? replaceVariables(JSON.stringify(config.body), variables) : undefined;
  
  const response = await fetch(url, {
    method: config.method || 'GET',
    headers,
    body
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  
  return await response.json();
}

async function executeFileOperation(config: any, variables: Record<string, any>) {
  // Simulate file operation
  const filePath = replaceVariables(config.filePath || '', variables);
  const content = replaceVariables(config.content || '', variables);
  
  console.log(`File operation: ${config.fileOperation} on ${filePath}`);
  
  return {
    success: true,
    operation: config.fileOperation,
    path: filePath,
    content: content
  };
}

async function executeAiPrompt(config: any, variables: Record<string, any>) {
  const prompt = replaceVariables(config.prompt || '', variables);
  
  // Use the agent orchestrator to generate AI response
  const response = await AgentOrchestrator.routeToAgent('orchestrator', {
    type: 'generate',
    prompt,
    model: config.model || 'gpt-4o',
    temperature: config.temperature || 0.7
  });
  
  return response;
}

async function executeBrowserAction(config: any, variables: Record<string, any>) {
  let sessionId = config.browserSessionId;
  
  // Create session if needed
  if (!sessionId) {
    sessionId = await agentBrowserManager.createSession();
  }
  
  switch (config.browserAction) {
    case 'navigate':
      const url = replaceVariables(config.url || '', variables);
      await agentBrowserManager.navigate(sessionId, url);
      return { success: true, url };
      
    case 'click':
      const clickSelector = replaceVariables(config.selector || '', variables);
      await agentBrowserManager.click(sessionId, clickSelector);
      return { success: true, action: 'clicked', selector: clickSelector };
      
    case 'type':
      const typeSelector = replaceVariables(config.selector || '', variables);
      const text = replaceVariables(config.text || '', variables);
      await agentBrowserManager.type(sessionId, typeSelector, text);
      return { success: true, action: 'typed', selector: typeSelector };
      
    case 'screenshot':
      const imageBase64 = await agentBrowserManager.screenshot(sessionId);
      return { success: true, imageBase64 };
      
    default:
      throw new Error(`Unknown browser action: ${config.browserAction}`);
  }
}

async function executeDataTransform(config: any, variables: Record<string, any>) {
  // Simulate data transformation
  return {
    transformed: true,
    timestamp: new Date().toISOString()
  };
}

async function executeNotification(config: any, variables: Record<string, any>) {
  // Simulate sending notification
  console.log('Sending notification:', config);
  return {
    sent: true,
    timestamp: new Date().toISOString()
  };
}

// Helper function to replace variables in strings
function replaceVariables(str: string, variables: Record<string, any>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return variables[varName] || match;
  });
}

// Get default tools
function getDefaultTools(): Tool[] {
  return [
    {
      id: 'api-tool',
      name: 'API Call',
      type: 'builtin',
      description: 'Make HTTP API requests',
      config: {
        action: 'api_call'
      }
    },
    {
      id: 'ai-tool',
      name: 'AI Assistant',
      type: 'builtin',
      description: 'Generate content with AI',
      config: {
        action: 'ai_prompt'
      }
    },
    {
      id: 'browser-tool',
      name: 'Web Browser',
      type: 'builtin',
      description: 'Automate web browsing',
      config: {
        action: 'browser_action'
      }
    },
    {
      id: 'file-tool',
      name: 'File Manager',
      type: 'builtin',
      description: 'Read and write files',
      config: {
        action: 'file_operation'
      }
    },
    {
      id: 'transform-tool',
      name: 'Data Transformer',
      type: 'builtin',
      description: 'Transform data formats',
      config: {
        action: 'data_transform'
      }
    },
    {
      id: 'notify-tool',
      name: 'Notifier',
      type: 'builtin',
      description: 'Send notifications',
      config: {
        action: 'notification'
      }
    }
  ];
}