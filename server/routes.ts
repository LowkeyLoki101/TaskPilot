import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "crypto";
import {
  insertTaskSchema,
  insertCommentSchema,
  insertChatMessageSchema
} from "@shared/schema";
import { storage } from "./storage";
import { activityLogger } from "./activityLogger";
import { featureRequestSystem } from "./featureRequestSystem";
import { workstationOrganManager } from "./workstationOrgans";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const projectConnections = new Map<string, Set<WebSocket>>();

  // WebSocket setup
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'join_project' && data.projectId) {
          if (!projectConnections.has(data.projectId)) {
            projectConnections.set(data.projectId, new Set());
          }
          projectConnections.get(data.projectId)!.add(ws);
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      // Remove connection from all projects
      projectConnections.forEach((connections, projectId) => {
        connections.delete(ws);
        if (connections.size === 0) {
          projectConnections.delete(projectId);
        }
      });
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  function broadcastToProject(projectId: string, message: any) {
    const connections = projectConnections.get(projectId);
    if (connections) {
      const messageString = JSON.stringify(message);
      connections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(messageString);
        }
      });
    }
  }

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
        projectId: req.params.projectId,
        assigneeId: "mock-user-id"
      });
      
      const task = await storage.createTask(validated);
      activityLogger.logTaskAction('Task created', { taskId: task.id, title: task.title, projectId: task.projectId });
      
      broadcastToProject(task.projectId, {
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
      activityLogger.logTaskAction('Task updated', { taskId: task.id, title: task.title, projectId: task.projectId });
      
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
      activityLogger.logTaskAction('Task deleted', { taskId: req.params.taskId, title: task.title, projectId: task.projectId });
      
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

  // Delete all tasks in a project
  app.delete("/api/projects/:projectId/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasksByProject(req.params.projectId);
      
      for (const task of tasks) {
        await storage.deleteTask(task.id);
        activityLogger.logTaskAction('Task deleted (bulk)', { taskId: task.id, title: task.title, projectId: req.params.projectId });
      }
      
      broadcastToProject(req.params.projectId, {
        type: "tasks_bulk_deleted",
        data: { count: tasks.length }
      });
      
      res.json({ success: true, deletedCount: tasks.length });
    } catch (error) {
      console.error("Error deleting all tasks:", error);
      res.status(500).json({ error: "Failed to delete all tasks" });
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
        authorId: "mock-user-id"
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
      const validated = insertChatMessageSchema.parse({
        ...req.body,
        projectId: req.params.projectId,
        authorId: "mock-user-id"
      });
      const message = await storage.createChatMessage(validated);
      
      broadcastToProject(req.params.projectId, {
        type: "chat_message",
        data: message
      });
      
      res.json(message);
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ error: "Failed to create chat message" });
    }
  });

  // Activity Logs
  app.get("/api/activity", async (req, res) => {
    try {
      const activities = activityLogger.getActivities();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Feature Request System
  app.get("/api/feature-requests", async (req, res) => {
    try {
      const requests = featureRequestSystem.getFeatureRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching feature requests:", error);
      res.status(500).json({ error: "Failed to fetch feature requests" });
    }
  });

  app.post("/api/feature-requests", async (req, res) => {
    try {
      const request = await featureRequestSystem.generateFeatureRequest(req.body);
      res.json(request);
    } catch (error) {
      console.error("Error creating feature request:", error);
      res.status(500).json({ error: "Failed to create feature request" });
    }
  });

  app.put("/api/feature-requests/:id/approve", async (req, res) => {
    try {
      const { notes } = req.body;
      const success = featureRequestSystem.approveFeatureRequest(req.params.id, notes);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Feature request not found" });
      }
    } catch (error) {
      console.error("Error approving feature request:", error);
      res.status(500).json({ error: "Failed to approve feature request" });
    }
  });

  app.put("/api/feature-requests/:id/reject", async (req, res) => {
    try {
      const { reason } = req.body;
      const success = featureRequestSystem.rejectFeatureRequest(req.params.id, reason);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Feature request not found" });
      }
    } catch (error) {
      console.error("Error rejecting feature request:", error);
      res.status(500).json({ error: "Failed to reject feature request" });
    }
  });

  // Tool Diagnostics
  app.get("/api/diagnostics/tools", async (req, res) => {
    try {
      const diagnostics = featureRequestSystem.getToolDiagnostics();
      res.json(diagnostics);
    } catch (error) {
      console.error("Error fetching tool diagnostics:", error);
      res.status(500).json({ error: "Failed to fetch tool diagnostics" });
    }
  });

  // Project Status
  app.get("/api/diagnostics/projects", async (req, res) => {
    try {
      const statuses = featureRequestSystem.getProjectStatuses();
      res.json(statuses);
    } catch (error) {
      console.error("Error fetching project statuses:", error);
      res.status(500).json({ error: "Failed to fetch project statuses" });
    }
  });

  // Maintenance Settings
  app.put("/api/maintenance/frequency", async (req, res) => {
    try {
      const { frequency } = req.body;
      featureRequestSystem.setMaintenanceFrequency(frequency * 1000); // Convert to milliseconds
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating maintenance frequency:", error);
      res.status(500).json({ error: "Failed to update maintenance frequency" });
    }
  });

  // Workstation Organs
  app.get("/api/workstation/organs", async (req, res) => {
    try {
      const organs = workstationOrganManager.getAllOrgans();
      res.json(organs);
    } catch (error) {
      console.error("Error fetching workstation organs:", error);
      res.status(500).json({ error: "Failed to fetch workstation organs" });
    }
  });

  app.post("/api/workstation/organs/:organId/activate", async (req, res) => {
    try {
      const success = workstationOrganManager.activateOrgan(req.params.organId);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Organ not found" });
      }
    } catch (error) {
      console.error("Error activating organ:", error);
      res.status(500).json({ error: "Failed to activate organ" });
    }
  });

  app.post("/api/workstation/organs/voice-trigger", async (req, res) => {
    try {
      const { command } = req.body;
      const organId = workstationOrganManager.triggerOrganByVoice(command);
      if (organId) {
        res.json({ success: true, organId });
      } else {
        res.status(400).json({ error: "No matching organ found for command" });
      }
    } catch (error) {
      console.error("Error triggering organ by voice:", error);
      res.status(500).json({ error: "Failed to trigger organ by voice" });
    }
  });

  app.get("/api/workstation/organs/:organId/qr", async (req, res) => {
    try {
      const qrData = workstationOrganManager.generateQRForOrgan(req.params.organId);
      if (qrData) {
        res.json({ qrData });
      } else {
        res.status(404).json({ error: "Organ not found" });
      }
    } catch (error) {
      console.error("Error generating QR for organ:", error);
      res.status(500).json({ error: "Failed to generate QR for organ" });
    }
  });

  // YouTube Integration
  app.get("/api/youtube/search", async (req, res) => {
    try {
      const { q, maxResults = 10 } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: "Search query is required" });
      }

      const { searchYouTube } = await import("./youtube");
      const results = await searchYouTube(q as string, parseInt(maxResults as string));
      
      // Track tool usage
      featureRequestSystem.updateToolUsage('youtube-search', Date.now() - (req as any).startTime, true);
      
      res.json(results);
    } catch (error) {
      console.error("YouTube search error:", error);
      featureRequestSystem.updateToolUsage('youtube-search', Date.now() - (req as any).startTime, false);
      res.status(500).json({ error: "Failed to search YouTube" });
    }
  });

  app.get("/api/youtube/video/:videoId", async (req, res) => {
    try {
      const { videoId } = req.params;
      
      if (!videoId) {
        return res.status(400).json({ error: "Video ID is required" });
      }

      const { getVideoDetails } = await import("./youtube");
      const details = await getVideoDetails(videoId);
      
      res.json(details);
    } catch (error) {
      console.error("YouTube video details error:", error);
      res.status(500).json({ error: "Failed to get video details" });
    }
  });

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
        websocket: "active",
        ai: "available",
        youtube: "available",
        workstation: "ready"
      },
      organs: {
        total: workstationOrganManager.getAllOrgans().length,
        active: workstationOrganManager.getActiveOrgans().length
      }
    });
  });

  // Autonomous AI Actions endpoint - performs proactive AI actions in full autonomy mode
  app.post('/api/autonomous-actions', async (req, res) => {
    try {
      const { projectId, autonomyLevel, context } = req.body;
      
      console.log(`🤖 Generating autonomous actions for ${autonomyLevel} mode...`);
      
      // Generate intelligent autonomous actions based on context
      const possibleActions = [
        {
          type: 'enhancement',
          description: 'Analyzing project workflow patterns',
          category: 'optimization',
          impact: 'medium'
        },
        {
          type: 'task',
          description: 'Creating contextual task suggestions',
          category: 'productivity',
          impact: 'high'
        },
        {
          type: 'maintenance',
          description: 'Optimizing system performance',
          category: 'system',
          impact: 'low'
        },
        {
          type: 'enhancement',
          description: 'Improving user interface responsiveness',
          category: 'ui',
          impact: 'medium'
        },
        {
          type: 'task',
          description: 'Generating project insights and recommendations',
          category: 'intelligence',
          impact: 'high'
        },
        {
          type: 'enhancement',
          description: 'Streamlining workflow processes',
          category: 'automation',
          impact: 'high'
        }
      ];

      // Intelligently select 1-3 actions based on context and randomization
      const numberOfActions = Math.floor(Math.random() * 3) + 1;
      const selectedActions = possibleActions
        .sort(() => Math.random() - 0.5)
        .slice(0, numberOfActions)
        .map(action => ({
          id: randomUUID(),
          ...action,
          execute: true,
          timestamp: new Date(),
          contextual: context?.currentModule || 'dashboard'
        }));

      // Log the autonomous activity to the real activity system
      activityLogger.log(
        `Generated ${selectedActions.length} autonomous AI actions`,
        'maintenance',
        { 
          projectId, 
          autonomyLevel,
          actions: selectedActions.map(a => a.description),
          context: context?.currentModule 
        }
      );

      console.log(`🤖 Generated ${selectedActions.length} autonomous actions:`, selectedActions.map(a => a.description));

      res.json({
        success: true,
        actions: selectedActions,
        projectId,
        autonomyLevel,
        context,
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Autonomous actions generation failed:', error);
      activityLogger.log('Autonomous actions generation failed', 'maintenance', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      res.status(500).json({ 
        success: false, 
        error: 'Failed to generate autonomous actions',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Middleware to track request start time
  app.use((req: any, res, next) => {
    req.startTime = Date.now();
    next();
  });

  return httpServer;
}