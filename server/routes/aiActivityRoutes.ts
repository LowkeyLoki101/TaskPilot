import { Router, Request, Response } from "express";
import { db } from "../db";
import { aiMaintenanceLogs, agentInstances, agentMessages, agentTaskAssignments } from "../../shared/schema";
import { desc, gte, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

interface AIActivityEntry {
  id: string;
  timestamp: Date;
  type: 'ai_thinking' | 'ai_action' | 'ai_decision' | 'ai_execution' | 'ai_learning' | 'system_event' | 'user_interaction';
  action: string;
  details: any;
  duration?: number;
  status: 'started' | 'completed' | 'failed' | 'in_progress';
  reasoning?: string;
  impact?: string;
  relatedTo?: string[];
}

// In-memory activity store for real-time activities
let activityBuffer: AIActivityEntry[] = [];
const MAX_BUFFER_SIZE = 500;

// Log an AI activity
function logAIActivity(
  type: AIActivityEntry['type'],
  action: string,
  details?: any,
  reasoning?: string,
  duration?: number,
  status: AIActivityEntry['status'] = 'completed',
  impact?: string,
  relatedTo?: string[]
) {
  const entry: AIActivityEntry = {
    id: randomUUID(),
    timestamp: new Date(),
    type,
    action,
    details,
    duration,
    status,
    reasoning,
    impact,
    relatedTo
  };

  // Add to buffer
  activityBuffer.unshift(entry);
  
  // Keep buffer size manageable
  if (activityBuffer.length > MAX_BUFFER_SIZE) {
    activityBuffer = activityBuffer.slice(0, MAX_BUFFER_SIZE);
  }

  // Also log to database for persistence
  if (type === 'system_event' || type === 'ai_learning' || type === 'ai_decision') {
    try {
      db.insert(aiMaintenanceLogs).values({
        maintenance_type: type,
        description: action,
        findings: details ? { details, reasoning, impact } : null,
        actions_taken: relatedTo ? { relatedTo } : null,
        status: status === 'completed' ? 'completed' : 'in_progress'
      }).execute().catch(console.error);
    } catch (error) {
      console.error('Failed to log to database:', error);
    }
  }

  console.log(`[AI Activity] ${type.toUpperCase()}: ${action}`, details ? `- ${JSON.stringify(details)}` : '');
  return entry;
}

// Get all activities (real-time buffer + recent database entries)
router.get("/", async (req: Request, res: Response) => {
  try {
    // Get recent database entries
    const dbEntries = await db
      .select()
      .from(aiMaintenanceLogs)
      .orderBy(desc(aiMaintenanceLogs.createdAt))
      .limit(100);

    // Convert database entries to activity format
    const dbActivities: AIActivityEntry[] = dbEntries.map(entry => ({
      id: entry.id,
      timestamp: entry.createdAt || new Date(),
      type: (entry.maintenance_type as AIActivityEntry['type']) || 'system_event',
      action: entry.description,
      details: entry.findings,
      status: entry.status === 'completed' ? 'completed' : 'in_progress',
      reasoning: entry.findings?.reasoning,
      impact: entry.findings?.impact,
      relatedTo: entry.actions_taken?.relatedTo
    }));

    // Combine buffer and database activities, remove duplicates, sort by timestamp
    const allActivities = [...activityBuffer, ...dbActivities]
      .filter((activity, index, self) => 
        index === self.findIndex((a: AIActivityEntry) => a.id === activity.id)
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json(allActivities);
  } catch (error) {
    console.error("Error fetching AI activities:", error);
    res.status(500).json({ error: "Failed to fetch AI activities" });
  }
});

// Get activities by type
router.get("/type/:type", async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const activities = activityBuffer.filter(activity => activity.type === type);
    res.json(activities);
  } catch (error) {
    console.error("Error fetching activities by type:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

// Get agent status and recent activity
router.get("/agents", async (req: Request, res: Response) => {
  try {
    const agents = await db.select().from(agentInstances).orderBy(desc(agentInstances.lastActivity));
    
    const agentActivities = await db
      .select()
      .from(agentMessages)
      .orderBy(desc(agentMessages.createdAt))
      .limit(50);

    const agentTasks = await db
      .select()
      .from(agentTaskAssignments)
      .orderBy(desc(agentTaskAssignments.createdAt))
      .limit(30);

    res.json({
      agents,
      recentMessages: agentActivities,
      recentTasks: agentTasks
    });
  } catch (error) {
    console.error("Error fetching agent activities:", error);
    res.status(500).json({ error: "Failed to fetch agent activities" });
  }
});

// Clear activity buffer (for debugging)
router.delete("/buffer", (req: Request, res: Response) => {
  activityBuffer = [];
  res.json({ message: "Activity buffer cleared" });
});

// Initialize some sample activities for testing
logAIActivity('system_event', 'AI Activity Logger initialized', 
  { component: 'aiActivityRoutes', version: '1.0' },
  'Setting up comprehensive activity monitoring system for real-time AI behavior tracking'
);

logAIActivity('ai_thinking', 'Analyzing user request for activity logging',
  { request: 'comprehensive activity logs', priority: 'high' },
  'User wants to see everything the AI is doing in real-time, not just recent logs'
);

logAIActivity('ai_decision', 'Implementing real-time activity monitoring',
  { approach: 'buffer + database hybrid', realtime: true },
  'Chosen hybrid approach for immediate responsiveness with persistent storage'
);

export { router as aiActivityRouter, logAIActivity };