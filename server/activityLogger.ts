// Real Activity Logger - tracks actual system events and user interactions
export interface ActivityEntry {
  id: string;
  action: string;
  timestamp: Date;
  type: 'task' | 'bug' | 'enhancement' | 'maintenance' | 'user_action' | 'system' | 'ai_response';
  details?: any;
}

class ActivityLogger {
  private activities: ActivityEntry[] = [];
  private maxEntries = 100;

  log(action: string, type: ActivityEntry['type'], details?: any) {
    const entry: ActivityEntry = {
      id: crypto.randomUUID(),
      action,
      timestamp: new Date(),
      type,
      details
    };
    
    this.activities.unshift(entry);
    
    // Keep only the latest entries
    if (this.activities.length > this.maxEntries) {
      this.activities = this.activities.slice(0, this.maxEntries);
    }
    
    // Log to console for debugging
    console.log(`[ActivityLogger] ${type.toUpperCase()}: ${action}`, details || '');
    
    return entry;
  }

  logUserAction(action: string, details?: any) {
    return this.log(action, 'user_action', details);
  }

  logSystemEvent(action: string, details?: any) {
    return this.log(action, 'system', details);
  }

  logTaskAction(action: string, details?: any) {
    return this.log(action, 'task', details);
  }

  logAIResponse(action: string, details?: any) {
    return this.log(action, 'ai_response', details);
  }

  logMaintenance(action: string, details?: any) {
    return this.log(action, 'maintenance', details);
  }

  getActivities(): ActivityEntry[] {
    return [...this.activities];
  }

  getActivitiesByType(type: ActivityEntry['type']): ActivityEntry[] {
    return this.activities.filter(activity => activity.type === type);
  }

  getRecentActivities(limit: number = 20): ActivityEntry[] {
    return this.activities.slice(0, limit);
  }

  clear() {
    this.activities = [];
  }
}

// Global singleton instance
export const activityLogger = new ActivityLogger();

// Helper function to format durations
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}