import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import OpenAI from "openai";
import { 
  insertProjectSchema, 
  insertTaskSchema, 
  insertCommentSchema,
  insertChatMessageSchema 
} from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { aiAssistant } from "./aiAssistant";
import { generateWorkflowFromPrompt } from "./openai";

// AI Voice Processing - Intelligent voice command handling
async function processVoiceIntelligently(text: string) {
  const prompt = `Analyze this voice input and determine the appropriate action:

Voice Input: "${text}"

Classify as one of:
1. TASK_CREATE - User wants to create a task/todo item
2. WORKFLOW_CREATE - User wants to create a workflow/process 
3. QUESTION - User is asking a question
4. COMMAND - User wants to execute an action

For TASK_CREATE, extract:
- title (clear, actionable task name)
- tags (relevant categorization)
- priority (low/medium/high/urgent based on urgency words)

For WORKFLOW_CREATE, identify:
- workflow type and steps
- tools needed

For QUESTION/COMMAND, provide appropriate response.

Respond with JSON only:
{
  "action": "TASK_CREATE|WORKFLOW_CREATE|QUESTION|COMMAND",
  "title": "extracted title",
  "tags": ["tag1", "tag2"],
  "priority": "medium",
  "response": "response text if question",
  "workflow_request": "workflow description if workflow"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user  
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("AI processing error:", error);
    throw new Error("Failed to process voice input");
  }
}

// Using GPT-5 - the newest OpenAI model released August 7, 2025 with unified reasoning and enhanced capabilities
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Object storage routes for file upload
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Serve uploaded files
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // AI image generation endpoint
  app.post("/api/ai/generate-image", async (req, res) => {
    try {
      const { enhancedAI } = await import("./openai");
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const result = await enhancedAI.generateImage(prompt);
      res.json(result);
    } catch (error) {
      console.error("Error generating image:", error);
      res.status(500).json({ error: "Failed to generate image" });
    }
  });

  // AI image analysis endpoint
  app.post("/api/ai/analyze-image", async (req, res) => {
    try {
      const { enhancedAI } = await import("./openai");
      const { base64Image } = req.body;
      
      if (!base64Image) {
        return res.status(400).json({ error: "Base64 image is required" });
      }

      const result = await enhancedAI.analyzeImage(base64Image);
      res.json({ analysis: result });
    } catch (error) {
      console.error("Error analyzing image:", error);
      res.status(500).json({ error: "Failed to analyze image" });
    }
  });

  // Projects
  app.get("/api/projects", async (req, res) => {
    try {
      // For now, using a mock user ID - in real app this would come from auth
      const projects = await storage.getProjectsByOwner("mock-user-id");
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validated = insertProjectSchema.parse(req.body);
      const project = await storage.createProject({
        ...validated,
        ownerId: "mock-user-id" // In real app, get from auth
      });
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Tasks
  app.get("/api/projects/:projectId/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasksByProject(req.params.projectId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/projects/:projectId/tasks", async (req, res) => {
    try {
      const validated = insertTaskSchema.parse({
        ...req.body,
        projectId: req.params.projectId
      });
      const task = await storage.createTask(validated);
      
      // Broadcast to WebSocket clients
      broadcastToProject(req.params.projectId, {
        type: "task_created",
        data: task
      });
      
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.put("/api/tasks/:taskId", async (req, res) => {
    try {
      const task = await storage.updateTask(req.params.taskId, req.body);
      
      // Broadcast to WebSocket clients
      broadcastToProject(task.projectId, {
        type: "task_updated",
        data: task
      });
      
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:taskId", async (req, res) => {
    try {
      const task = await storage.getTask(req.params.taskId);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      await storage.deleteTask(req.params.taskId);
      
      // Broadcast to WebSocket clients
      broadcastToProject(task.projectId, {
        type: "task_deleted",
        data: { id: req.params.taskId }
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Comments
  app.get("/api/tasks/:taskId/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByTask(req.params.taskId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/tasks/:taskId/comments", async (req, res) => {
    try {
      const validated = insertCommentSchema.parse({
        ...req.body,
        taskId: req.params.taskId,
        authorId: "mock-user-id" // In real app, get from auth
      });
      const comment = await storage.createComment(validated);
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  // Chat Messages
  app.get("/api/projects/:projectId/chat", async (req, res) => {
    try {
      const messages = await storage.getChatMessagesByProject(req.params.projectId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/projects/:projectId/chat", async (req, res) => {
    try {
      const userMessage = insertChatMessageSchema.parse({
        ...req.body,
        projectId: req.params.projectId,
        userId: "mock-user-id",
        role: "user"
      });
      
      await storage.createChatMessage(userMessage);

      // Process with OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant for a task management system. You can help users:
1. Create and manage tasks
2. Schedule events
3. Send emails and SMS
4. Search the web for information
5. Generate subtasks and organize projects

When users request actions, respond with JSON containing both a human-readable message and function calls if needed.
Format: { "message": "human response", "functions": [{"name": "function_name", "params": {...}}] }`
          },
          {
            role: "user",
            content: req.body.content
          }
        ],
        response_format: { type: "json_object" }
      });

      const aiResponse = JSON.parse(response.choices[0].message.content || '{"message": "I apologize, but I encountered an error processing your request."}');
      
      const assistantMessage = await storage.createChatMessage({
        content: aiResponse.message,
        role: "assistant",
        projectId: req.params.projectId,
        metadata: aiResponse.functions ? JSON.stringify(aiResponse.functions) : null
      });

      // Broadcast to WebSocket clients
      broadcastToProject(req.params.projectId, {
        type: "chat_message",
        data: assistantMessage
      });

      // Execute function calls if any
      if (aiResponse.functions) {
        for (const func of aiResponse.functions) {
          await executeFunctionCall(func, req.params.projectId);
        }
      }

      res.json(assistantMessage);
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Voice Processing - AI-powered intelligent voice command handling  
  app.post("/api/voice/process", async (req, res) => {
    try {
      const { text, projectId = 'default-project' } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: "Text input required" });
      }

      // Save user's voice input to chat
      const userMessage = await storage.createChatMessage({
        content: text,
        role: "user",
        projectId: projectId,
        userId: "mock-user-id",
        metadata: null
      });

      // Use AI to intelligently process the voice input
      const aiAnalysis = await processVoiceIntelligently(text);
      
      let result: any = { action: aiAnalysis.action };
      let chatResponse = "";

      if (aiAnalysis.action === 'TASK_CREATE') {
        // Auto-create task with AI-determined properties and position
        const existingTasks = await storage.getProjectTasks(projectId);
        const angle = (existingTasks.length * 2 * Math.PI) / (existingTasks.length + 1);
        const radius = 250;
        const centerX = 400; // Approximate center
        const centerY = 300;
        
        const task = await storage.createTask({
          title: aiAnalysis.title || text,
          description: "",
          status: "todo",
          priority: aiAnalysis.priority || 'medium',
          projectId: projectId,
          position: {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
          }
        });
        
        result = {
          action: 'task_created',
          task: task,
          message: `Task "${task.title}" created automatically with AI organization`
        };
        
        chatResponse = `✅ I created the task "${task.title}" for you with ${aiAnalysis.priority || 'medium'} priority. You can find it in your task list.`;
        
      } else if (aiAnalysis.action === 'WORKFLOW_CREATE') {
        // Generate workflow using AI
        try {
          const workflowContent = await generateWorkflowFromPrompt(
            aiAnalysis.workflow_request || text,
            ['dropbox', 'email', 'slack', 'calendar', 'sms']
          );
          
          result = {
            action: 'workflow_created',
            workflow: {
              title: aiAnalysis.title || 'AI Generated Workflow',
              content: workflowContent
            },
            message: `Workflow "${aiAnalysis.title}" created and ready to execute`
          };
          
          chatResponse = `🔄 I created a workflow "${aiAnalysis.title || 'AI Generated Workflow'}" for you. It's ready to execute with the tools you need.`;
          
        } catch (error) {
          console.error("Workflow generation error:", error);
          chatResponse = "I understand you want to create a workflow, but I need more specific details about the steps involved.";
          result = {
            action: 'question_answered',
            response: chatResponse
          };
        }
        
      } else if (aiAnalysis.action === 'QUESTION') {
        chatResponse = aiAnalysis.response || "I'm here to help you manage tasks and workflows. What would you like to do?";
        result = {
          action: 'question_answered',
          response: chatResponse
        };
        
      } else {
        // Default to task creation if unclear - with position
        const existingTasks = await storage.getProjectTasks(projectId);
        const angle = (existingTasks.length * 2 * Math.PI) / (existingTasks.length + 1);
        const radius = 250;
        const centerX = 400; 
        const centerY = 300;
        
        const task = await storage.createTask({
          title: text.substring(0, 100), // Limit title length
          description: "Created via voice input",
          status: "todo",
          priority: 'medium',
          projectId: projectId,
          position: {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
          }
        });
        
        chatResponse = `✅ I created a task from your voice input: "${task.title}". You can find it in your task list.`;
        result = {
          action: 'task_created',
          task: task,
          message: "Created task from your voice input"
        };
      }

      // Save AI response to chat so user can see what happened
      const assistantMessage = await storage.createChatMessage({
        content: chatResponse,
        role: "assistant",
        projectId: projectId,
        metadata: [result]
      });

      // Broadcast to WebSocket clients
      broadcastToProject(projectId, {
        type: "voice_processed",
        data: { userMessage, assistantMessage, result }
      });

      res.json(result);
    } catch (error) {
      console.error("Voice processing error:", error);
      res.status(500).json({ 
        error: "Failed to process voice input",
        action: 'error',
        message: "Sorry, I couldn't understand that. Please try again."
      });
    }
  });

  // Object Storage Routes
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Function calling endpoints
  app.post("/api/functions/send-email", async (req, res) => {
    try {
      // Integration with SendGrid would go here
      console.log("Send email function called:", req.body);
      res.json({ success: true, message: "Email sent successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  app.post("/api/functions/send-sms", async (req, res) => {
    try {
      // Integration with Twilio would go here
      console.log("Send SMS function called:", req.body);
      res.json({ success: true, message: "SMS sent successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to send SMS" });
    }
  });

  app.post("/api/functions/search-web", async (req, res) => {
    try {
      // Integration with search API would go here
      console.log("Web search function called:", req.body);
      res.json({ 
        success: true, 
        results: [
          { title: "Sample Result", url: "https://example.com", snippet: "Sample search result" }
        ]
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to search web" });
    }
  });

  // Enhanced AI Assistant endpoints
  app.post("/api/ai/control", async (req, res) => {
    try {
      const { request, context } = req.body;
      const response = await aiAssistant.processUserRequest(request, context);
      
      // Execute the actions immediately
      const executionResult = await aiAssistant.executeActions(response.actions, context);
      
      res.json({
        message: response.message,
        actions: response.actions,
        websiteUpdates: response.websiteUpdates,
        execution: executionResult
      });
    } catch (error) {
      console.error("Error with AI control:", error);
      res.status(500).json({ error: "Failed to process AI control request" });
    }
  });

  app.get("/api/ai/suggestions", async (req, res) => {
    try {
      // Mock user activity data - in real app this would come from analytics
      const userActivity = {
        recentTasks: ["Complete project proposal", "Review team feedback", "Schedule client meeting"],
        timeSpent: { "tasks": 120, "chat": 45, "mindmap": 30 },
        preferences: { "view": "mindmap", "theme": "dark", "notifications": true }
      };
      
      const suggestions = await aiAssistant.generateProactiveSuggestions(userActivity);
      res.json({ suggestions });
    } catch (error) {
      console.error("Error generating suggestions:", error);
      res.status(500).json({ error: "Failed to generate suggestions" });
    }
  });



  // Workflow routes - Conversational Workflow Composer
  app.post("/api/workflows/generate", async (req, res) => {
    try {
      const { userInput, projectId } = req.body;
      
      if (!userInput) {
        return res.status(400).json({ error: "User input is required" });
      }

      const { generateWorkflowFromSpeech } = await import("./aiWorkflowGenerator");
      const workflow = await generateWorkflowFromSpeech(userInput, { projectId });
      
      res.json({ workflow });
    } catch (error) {
      console.error("Error generating workflow:", error);
      res.status(500).json({ error: "Failed to generate workflow" });
    }
  });

  app.post("/api/workflows/:id/execute", async (req, res) => {
    try {
      const { id } = req.params;
      const { workflow, mode = "simulate" } = req.body;
      
      if (!workflow) {
        return res.status(400).json({ error: "Workflow is required" });
      }

      const { workflowEngine } = await import("./workflowEngine");
      const runtime = await workflowEngine.executeFlow(workflow, mode);
      
      res.json({ runtime });
    } catch (error) {
      console.error("Error executing workflow:", error);
      res.status(500).json({ error: "Failed to execute workflow" });
    }
  });

  app.post("/api/workflows/:id/step/:stepId", async (req, res) => {
    try {
      const { id, stepId } = req.params;
      const { workflow, mode = "simulate" } = req.body;
      
      if (!workflow) {
        return res.status(400).json({ error: "Workflow is required" });
      }

      const { workflowEngine } = await import("./workflowEngine");
      const trace = await workflowEngine.executeStep(workflow, stepId);
      
      res.json({ trace });
    } catch (error) {
      console.error("Error executing step:", error);
      res.status(500).json({ error: "Failed to execute step" });
    }
  });

  app.get("/api/workflows/:id/runtime", async (req, res) => {
    try {
      const { id } = req.params;
      
      const { workflowEngine } = await import("./workflowEngine");
      const runtime = workflowEngine.getRuntime(id);
      
      if (!runtime) {
        return res.status(404).json({ error: "Runtime not found" });
      }
      
      res.json({ runtime });
    } catch (error) {
      console.error("Error getting runtime:", error);
      res.status(500).json({ error: "Failed to get runtime" });
    }
  });

  app.post("/api/workflows/:id/refine", async (req, res) => {
    try {
      const { workflow, feedback } = req.body;
      
      if (!workflow || !feedback) {
        return res.status(400).json({ error: "Workflow and feedback are required" });
      }

      const { refineWorkflow } = await import("./aiWorkflowGenerator");
      const refinedWorkflow = await refineWorkflow(workflow, feedback);
      
      res.json({ workflow: refinedWorkflow });
    } catch (error) {
      console.error("Error refining workflow:", error);
      res.status(500).json({ error: "Failed to refine workflow" });
    }
  });

  app.post("/api/workflows/step/:stepId/explain", async (req, res) => {
    try {
      const { stepId } = req.params;
      const { workflow, level = "user" } = req.body;
      
      if (!workflow) {
        return res.status(400).json({ error: "Workflow is required" });
      }

      const { explainWorkflowStep } = await import("./aiWorkflowGenerator");
      const explanation = await explainWorkflowStep(workflow, stepId, level);
      
      res.json({ explanation });
    } catch (error) {
      console.error("Error explaining step:", error);
      res.status(500).json({ error: "Failed to explain step" });
    }
  });

  // Create HTTP server (will be passed from index.ts)
  const httpServer = createServer(app);

  // WebSocket setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const projectConnections = new Map<string, Set<WebSocket>>();

  wss.on('connection', (ws) => {
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'join_project') {
          const projectId = message.projectId;
          if (!projectConnections.has(projectId)) {
            projectConnections.set(projectId, new Set());
          }
          projectConnections.get(projectId)!.add(ws);
          
          ws.on('close', () => {
            projectConnections.get(projectId)?.delete(ws);
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
  });

  function broadcastToProject(projectId: string, data: any) {
    const connections = projectConnections.get(projectId);
    if (connections) {
      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      });
    }
  }

  async function executeFunctionCall(func: any, projectId: string) {
    try {
      switch (func.name) {
        case 'create_task':
          const task = await storage.createTask({
            ...func.params,
            projectId,
            assigneeId: "mock-user-id"
          });
          broadcastToProject(projectId, {
            type: "task_created",
            data: task
          });
          break;
        
        case 'send_email':
          // Would integrate with SendGrid here
          console.log("Executing send_email:", func.params);
          break;
          
        case 'schedule_event':
          // Would integrate with Google Calendar here
          console.log("Executing schedule_event:", func.params);
          break;
          
        default:
          console.log("Unknown function:", func.name);
      }
    } catch (error) {
      console.error("Error executing function call:", error);
    }
  }

  return httpServer;
}
