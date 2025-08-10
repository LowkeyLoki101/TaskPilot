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
import { 
  generateTasksFromText, 
  processVoiceCommand, 
  processChatMessage, 
  generateSubtasks,
  analyzeTaskPriorities,
  generateProjectSummary
} from "./openai";

// Using GPT-5 - the newest OpenAI model released August 7, 2025 with unified reasoning and enhanced capabilities
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export async function registerRoutes(app: Express): Promise<Server> {
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
        metadata: aiResponse.functions || null
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

  // Voice command processing
  app.post("/api/voice/process", async (req, res) => {
    try {
      const { transcript, projectId } = req.body;
      const response = await processVoiceCommand(transcript);
      
      // Create a chat message for the voice command
      const userMessage = await storage.createChatMessage({
        content: `🎤 Voice: ${transcript}`,
        role: "user",
        projectId: projectId || "default-project"
      });

      const assistantMessage = await storage.createChatMessage({
        content: response.message,
        role: "assistant", 
        projectId: projectId || "default-project",
        metadata: response.functions || null
      });

      // Broadcast both messages
      broadcastToProject(projectId || "default-project", {
        type: "chat_message",
        data: userMessage
      });
      
      broadcastToProject(projectId || "default-project", {
        type: "chat_message", 
        data: assistantMessage
      });

      // Execute function calls if any
      if (response.functions) {
        for (const func of response.functions) {
          await executeFunctionCall(func, projectId || "default-project");
        }
      }

      res.json({ 
        userMessage, 
        assistantMessage, 
        functions: response.functions 
      });
    } catch (error) {
      console.error("Error processing voice command:", error);
      res.status(500).json({ error: "Failed to process voice command" });
    }
  });

  // AI-powered task generation
  app.post("/api/ai/generate-tasks", async (req, res) => {
    try {
      const { text, projectId } = req.body;
      const result = await generateTasksFromText(text);
      
      // Create tasks in the system
      const createdTasks = [];
      for (const taskData of result.tasks) {
        const task = await storage.createTask({
          title: taskData.title,
          description: taskData.description || "",
          status: "todo",
          priority: "medium",
          projectId: projectId || "default-project"
        });
        createdTasks.push(task);
        
        // Broadcast task creation
        broadcastToProject(projectId || "default-project", {
          type: "task_created",
          data: task
        });
      }
      
      res.json({ 
        message: result.message,
        tasks: createdTasks
      });
    } catch (error) {
      console.error("Error generating tasks:", error);
      res.status(500).json({ error: "Failed to generate tasks" });
    }
  });

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
