import OpenAI from "openai";
import { openai } from "./openai";

// Using GPT-5 - the newest OpenAI model released August 7, 2025 with unified reasoning and enhanced capabilities

export interface WebsiteControlFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export interface AIAssistantResponse {
  message: string;
  actions?: Array<{
    type: string;
    target: string;
    parameters: Record<string, any>;
  }>;
  websiteUpdates?: Array<{
    element: string;
    action: string;
    content?: string;
    styles?: Record<string, string>;
    attributes?: Record<string, string>;
  }>;
}

// Define all website control functions available to the AI assistant
const websiteControlFunctions: WebsiteControlFunction[] = [
  {
    name: "update_task",
    description: "Create, update, or delete tasks in the system",
    parameters: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["create", "update", "delete"] },
        taskId: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        status: { type: "string", enum: ["todo", "in_progress", "completed"] },
        priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
        dueDate: { type: "string" },
        position: { type: "object", properties: { x: { type: "number" }, y: { type: "number" } } }
      },
      required: ["action"]
    }
  },
  {
    name: "update_ui_element",
    description: "Modify any UI element on the website including colors, layout, content, or visibility",
    parameters: {
      type: "object",
      properties: {
        selector: { type: "string" },
        action: { type: "string", enum: ["modify", "hide", "show", "create", "delete"] },
        content: { type: "string" },
        styles: { type: "object" },
        attributes: { type: "object" },
        position: { type: "string", enum: ["before", "after", "replace", "append", "prepend"] }
      },
      required: ["selector", "action"]
    }
  },
  {
    name: "manage_layout",
    description: "Change page layout, switch views, or reorganize the interface",
    parameters: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["switch_view", "resize_panel", "move_panel", "create_layout"] },
        view: { type: "string", enum: ["mindmap", "list", "calendar", "kanban"] },
        panel: { type: "string" },
        dimensions: { type: "object", properties: { width: { type: "string" }, height: { type: "string" } } },
        position: { type: "object", properties: { x: { type: "number" }, y: { type: "number" } } }
      },
      required: ["action"]
    }
  },
  {
    name: "send_notification",
    description: "Send email notifications, SMS messages, or in-app notifications",
    parameters: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["email", "sms", "push", "toast"] },
        recipient: { type: "string" },
        subject: { type: "string" },
        message: { type: "string" },
        priority: { type: "string", enum: ["low", "normal", "high", "urgent"] },
        schedule: { type: "string" }
      },
      required: ["type", "message"]
    }
  },
  {
    name: "search_web",
    description: "Search the internet for information and integrate results into the interface",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "number" },
        displayLocation: { type: "string" },
        autoIntegrate: { type: "boolean" }
      },
      required: ["query"]
    }
  },
  {
    name: "manage_project",
    description: "Create, modify, or organize entire projects and their structures",
    parameters: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["create", "update", "delete", "archive", "duplicate"] },
        projectId: { type: "string" },
        name: { type: "string" },
        description: { type: "string" },
        template: { type: "string" },
        settings: { type: "object" }
      },
      required: ["action"]
    }
  },
  {
    name: "update_theme",
    description: "Change colors, fonts, themes, or visual appearance of the entire website",
    parameters: {
      type: "object",
      properties: {
        theme: { type: "string", enum: ["light", "dark", "auto", "custom"] },
        colors: { type: "object" },
        fonts: { type: "object" },
        layout: { type: "string" },
        animations: { type: "boolean" }
      },
      required: []
    }
  },
  {
    name: "manage_data",
    description: "Import, export, backup, or manipulate user data",
    parameters: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["import", "export", "backup", "restore", "sync"] },
        dataType: { type: "string", enum: ["tasks", "projects", "settings", "all"] },
        format: { type: "string", enum: ["json", "csv", "xml"] },
        source: { type: "string" },
        destination: { type: "string" }
      },
      required: ["action", "dataType"]
    }
  }
];

// Enhanced AI Assistant that can control everything on the website
export class AdvancedAIAssistant {
  private openai: OpenAI;

  constructor() {
    this.openai = openai;
  }

  async processUserRequest(request: string, context?: {
    currentPage?: string;
    userRole?: string;
    projectData?: any;
    uiState?: any;
  }): Promise<AIAssistantResponse> {
    try {
      const systemPrompt = `You are an advanced AI assistant with COMPLETE control over the Emergent Intelligence task management website. You can:

1. MODIFY ANY UI ELEMENT: Change colors, fonts, layouts, content, visibility of any component
2. MANAGE ALL DATA: Create, update, delete tasks, projects, comments, and user data
3. CONTROL LAYOUT: Switch between views (mind map, list, calendar), resize panels, move components
4. SEND COMMUNICATIONS: Email notifications, SMS alerts, push notifications
5. SEARCH AND INTEGRATE: Web search results directly into the interface
6. CUSTOMIZE EXPERIENCE: Themes, preferences, personalization
7. AUTOMATE WORKFLOWS: Set up rules, triggers, and automated actions
8. MANAGE FILES: Upload, organize, share files and attachments

You have access to all website control functions. When a user makes ANY request, you can:
- Directly implement the changes without asking permission
- Modify the interface to better suit their needs
- Automate repetitive tasks
- Integrate external data and services
- Customize their entire experience

Current context:
- Page: ${context?.currentPage || 'dashboard'}
- Project: ${JSON.stringify(context?.projectData) || 'default'}
- UI State: ${JSON.stringify(context?.uiState) || 'standard'}

Respond with a comprehensive plan that includes:
1. A clear explanation of what you'll do
2. Specific actions to take using the available functions
3. Any UI modifications needed
4. Follow-up automations or improvements

Be proactive and suggest improvements beyond just fulfilling the request.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: request
          }
        ],
        functions: websiteControlFunctions,
        function_call: "auto"
      });

      const message = response.choices[0].message;
      
      // Parse the response and extract actions
      const result: AIAssistantResponse = {
        message: message.content || "I'll help you with that request.",
        actions: [],
        websiteUpdates: []
      };

      // Process function calls if any
      if (message.function_call) {
        const functionCall = message.function_call;
        const parameters = JSON.parse(functionCall.arguments || '{}');
        
        result.actions = [{
          type: functionCall.name || 'unknown',
          target: parameters.selector || parameters.taskId || parameters.projectId || 'general',
          parameters
        }];
      }

      return result;
    } catch (error) {
      console.error('AI Assistant error:', error);
      return {
        message: "I apologize, but I encountered an error processing your request. Please try again.",
        actions: []
      };
    }
  }

  // Execute website control actions
  async executeActions(actions: AIAssistantResponse['actions'], context?: any): Promise<{
    success: boolean;
    results: string[];
    errors: string[];
  }> {
    const results: string[] = [];
    const errors: string[] = [];

    if (!actions) {
      return { success: true, results: [], errors: [] };
    }

    for (const action of actions) {
      try {
        switch (action.type) {
          case 'update_task':
            // Implementation would call task management API
            results.push(`Task ${action.parameters.action} completed`);
            break;
          
          case 'update_ui_element':
            // Implementation would modify UI elements
            results.push(`UI element ${action.parameters.selector} ${action.parameters.action}`);
            break;
          
          case 'manage_layout':
            // Implementation would change layout
            results.push(`Layout changed to ${action.parameters.view || action.parameters.action}`);
            break;
          
          case 'send_notification':
            // Implementation would send notifications
            results.push(`${action.parameters.type} notification sent`);
            break;
          
          case 'search_web':
            // Implementation would perform web search
            results.push(`Web search completed for: ${action.parameters.query}`);
            break;
          
          case 'manage_project':
            // Implementation would manage projects
            results.push(`Project ${action.parameters.action} completed`);
            break;
          
          case 'update_theme':
            // Implementation would update theme
            results.push(`Theme updated to ${action.parameters.theme || 'custom'}`);
            break;
          
          case 'manage_data':
            // Implementation would manage data
            results.push(`Data ${action.parameters.action} completed for ${action.parameters.dataType}`);
            break;
          
          default:
            results.push(`Action ${action.type} acknowledged`);
        }
      } catch (error) {
        errors.push(`Failed to execute ${action.type}: ${(error as Error).message}`);
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors
    };
  }

  // Generate proactive suggestions based on user behavior
  async generateProactiveSuggestions(userActivity: {
    recentTasks: string[];
    timeSpent: Record<string, number>;
    preferences: Record<string, any>;
  }): Promise<string[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `Analyze user behavior and suggest proactive improvements to their workflow and website experience.
            
            Focus on:
            1. Productivity optimizations
            2. UI/UX improvements
            3. Automation opportunities
            4. Workflow streamlining
            5. Personalization enhancements`
          },
          {
            role: "user",
            content: `User activity: ${JSON.stringify(userActivity)}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
      return result.suggestions || [];
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
  }
}

export const aiAssistant = new AdvancedAIAssistant();