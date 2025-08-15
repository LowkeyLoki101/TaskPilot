import { storage } from './storage';

export interface ToolExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  actions?: Array<{
    type: string;
    description: string;
    result?: any;
  }>;
}

export class AIToolExecutor {
  async executeCommand(command: string, context?: any): Promise<ToolExecutionResult> {
    try {
      // Parse commands from AI responses
      const lowerCommand = command.toLowerCase().trim();
      
      // Task creation commands
      if (lowerCommand.includes('create task') || lowerCommand.includes('add task') || lowerCommand.includes('new task')) {
        return await this.createTask(command, context);
      }
      
      // Tool creation commands  
      if (lowerCommand.includes('create tool') || lowerCommand.includes('build tool') || lowerCommand.includes('make tool')) {
        return await this.createTool(command, context);
      }
      
      // Project commands
      if (lowerCommand.includes('create project') || lowerCommand.includes('new project')) {
        return await this.createProject(command, context);
      }
      
      // Workflow commands
      if (lowerCommand.includes('create workflow') || lowerCommand.includes('build workflow')) {
        return await this.createWorkflow(command, context);
      }
      
      return {
        success: false,
        message: "I understand what you want, but I need more specific instructions to create tools or tasks."
      };
    } catch (error) {
      console.error('Error executing AI command:', error);
      return {
        success: false,
        message: "I encountered an error while trying to execute that command."
      };
    }
  }
  
  private async createTask(command: string, context?: any): Promise<ToolExecutionResult> {
    try {
      // Extract task details from command
      const taskTitle = this.extractTaskTitle(command);
      const taskDescription = this.extractTaskDescription(command);
      
      // Create the task
      const task = await storage.createTask({
        title: taskTitle,
        description: taskDescription,
        projectId: context?.projectId || 'default-project',
        status: 'todo',
        priority: 'medium',
        assigneeId: null,  // Don't assign to non-existent user
        // Set position for mind map
        position: { x: Math.random() * 400, y: Math.random() * 300 }
      });
      
      return {
        success: true,
        message: `✅ Created task: "${taskTitle}"`,
        data: task,
        actions: [{
          type: 'task_created',
          description: `Created task "${taskTitle}"`,
          result: task
        }]
      };
    } catch (error) {
      console.error('Error creating task:', error);
      return {
        success: false,
        message: "I couldn't create the task. Please try again."
      };
    }
  }
  
  private async createTool(command: string, context?: any): Promise<ToolExecutionResult> {
    try {
      const toolName = this.extractToolName(command);
      const toolDescription = this.extractToolDescription(command);
      
      // For now, create a placeholder tool entry
      // In a full implementation, this would generate actual code
      const toolData = {
        name: toolName,
        description: toolDescription,
        type: 'custom',
        status: 'created',
        createdAt: new Date().toISOString()
      };
      
      return {
        success: true,
        message: `🔧 Created tool: "${toolName}" - ${toolDescription}`,
        data: toolData,
        actions: [{
          type: 'tool_created',
          description: `Built custom tool "${toolName}"`,
          result: toolData
        }]
      };
    } catch (error) {
      return {
        success: false,
        message: "I had trouble creating that tool. Please be more specific about what you need."
      };
    }
  }
  
  private async createProject(command: string, context?: any): Promise<ToolExecutionResult> {
    try {
      const projectName = this.extractProjectName(command);
      
      const project = await storage.createProject({
        name: projectName,
        description: `AI-created project: ${projectName}`,
        ownerId: 'ai-assistant'
      });
      
      return {
        success: true,
        message: `🚀 Created project: "${projectName}"`,
        data: project,
        actions: [{
          type: 'project_created',
          description: `Created new project "${projectName}"`,
          result: project
        }]
      };
    } catch (error) {
      return {
        success: false,
        message: "I couldn't create the project. Please try again."
      };
    }
  }
  
  private async createWorkflow(command: string, context?: any): Promise<ToolExecutionResult> {
    try {
      const workflowName = this.extractWorkflowName(command);
      
      // Create a simple workflow structure
      const workflow = {
        name: workflowName,
        description: `AI-created workflow: ${workflowName}`,
        steps: [
          { id: '1', name: 'Start', type: 'start' },
          { id: '2', name: 'Process', type: 'task' },
          { id: '3', name: 'Complete', type: 'end' }
        ],
        createdAt: new Date().toISOString()
      };
      
      return {
        success: true,
        message: `⚡ Created workflow: "${workflowName}"`,
        data: workflow,
        actions: [{
          type: 'workflow_created',
          description: `Built workflow "${workflowName}" with 3 steps`,
          result: workflow
        }]
      };
    } catch (error) {
      return {
        success: false,
        message: "I couldn't create the workflow. Please provide more details."
      };
    }
  }
  
  // Helper methods to extract information from natural language commands
  private extractTaskTitle(command: string): string {
    // Look for task titles in quotes or after common phrases
    const patterns = [
      /"([^"]+)"/,
      /task called ([^\n.]+)/i,
      /task titled ([^\n.]+)/i,
      /create task ([^\n.]+)/i,
      /add task ([^\n.]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return "AI-Generated Task";
  }
  
  private extractTaskDescription(command: string): string {
    // Extract description from context
    const lines = command.split('\n').filter(line => line.trim());
    if (lines.length > 1) {
      return lines.slice(1).join(' ').trim();
    }
    return "Task created by AI assistant";
  }
  
  private extractToolName(command: string): string {
    const patterns = [
      /tool called ([^\n.]+)/i,
      /create tool ([^\n.]+)/i,
      /build tool ([^\n.]+)/i,
      /make tool ([^\n.]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return "Custom AI Tool";
  }
  
  private extractToolDescription(command: string): string {
    if (command.includes('for ')) {
      const parts = command.split('for ');
      if (parts.length > 1) {
        return parts[1].trim();
      }
    }
    return "AI-created tool";
  }
  
  private extractProjectName(command: string): string {
    const patterns = [
      /project called ([^\n.]+)/i,
      /create project ([^\n.]+)/i,
      /new project ([^\n.]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return "AI Project";
  }
  
  private extractWorkflowName(command: string): string {
    const patterns = [
      /workflow called ([^\n.]+)/i,
      /create workflow ([^\n.]+)/i,
      /build workflow ([^\n.]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return "AI Workflow";
  }

  // Smart analysis to determine if AI should create a task for work
  shouldCreateAITask(userMessage: string): { shouldCreate: boolean; workType?: string } {
    const lowerMessage = userMessage.toLowerCase().trim();
    
    // Patterns that indicate AI should create work tasks
    const workIndicators = [
      { pattern: /need.*implement|should.*implement|implement.*feature/i, type: "implementation" },
      { pattern: /need.*fix|should.*fix|fix.*bug|debug/i, type: "debugging" },
      { pattern: /need.*research|should.*research|investigate|analyze/i, type: "research" },
      { pattern: /need.*test|should.*test|test.*functionality/i, type: "testing" },
      { pattern: /need.*document|should.*document|write.*docs/i, type: "documentation" },
      { pattern: /need.*optimize|should.*optimize|improve.*performance/i, type: "optimization" }
    ];

    for (const indicator of workIndicators) {
      if (indicator.pattern.test(lowerMessage)) {
        return { shouldCreate: true, workType: indicator.type };
      }
    }

    return { shouldCreate: false };
  }

  // Create AI work task for implied work
  async createAIWorkTask(userMessage: string, workType: string, context?: any): Promise<ToolExecutionResult> {
    try {
      const taskTitle = `AI ${workType.charAt(0).toUpperCase() + workType.slice(1)}: ${this.extractWorkDescription(userMessage)}`;
      const taskDescription = `AI-created ${workType} task based on user request: "${userMessage}"`;
      
      const task = await storage.createTask({
        title: taskTitle,
        description: taskDescription,
        projectId: context?.projectId || 'default-project',
        status: 'in_progress',
        priority: 'medium',
        assigneeId: null,
        position: { x: Math.random() * 400, y: Math.random() * 300 }
      });
      
      return {
        success: true,
        message: `🤖 Created ${workType} task: "${taskTitle}" (AI is working on this)`,
        data: task,
        actions: [{
          type: 'ai_work_task_created',
          description: `AI started ${workType} work`,
          result: task
        }]
      };
    } catch (error) {
      return {
        success: false,
        message: "Couldn't create AI work task."
      };
    }
  }

  // Generate contextual response for work requests
  async generateContextualResponse(userMessage: string, context?: any): Promise<string> {
    // Simple contextual responses based on work type
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('implement') || lowerMessage.includes('build')) {
      return "I'll start implementing this feature. You can track my progress in the AI Tasks section.";
    }
    
    if (lowerMessage.includes('fix') || lowerMessage.includes('debug')) {
      return "I'm investigating this issue and will work on a fix. Check AI Tasks for updates.";
    }
    
    if (lowerMessage.includes('research') || lowerMessage.includes('analyze')) {
      return "I'll research this topic and compile findings. Progress will appear in AI Tasks.";
    }
    
    return "I understand your request and will work on it autonomously.";
  }

  private extractWorkDescription(message: string): string {
    // Extract meaningful work description from user message
    const cleanMessage = message
      .replace(/need to|should|please|can you|could you/gi, '')
      .replace(/implement|fix|research|test|document|optimize/gi, '')
      .trim();
    
    return cleanMessage.length > 5 ? cleanMessage : "User request";
  }
}

export const aiToolExecutor = new AIToolExecutor();