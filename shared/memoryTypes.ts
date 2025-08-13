// Memory System Types for Emergent Intelligence

export interface ShortTermMemoryItem {
  id: string;
  key: string;
  value: any;
  context: string; // chat:session_id, project:id, etc.
  timestamp: Date;
  accessCount: number;
  lastAccessed: Date;
  ttl: number; // Time to live in seconds
  decayScore: number; // 0-1, higher means more likely to decay
  priority: 'critical' | 'high' | 'normal' | 'low';
}

export interface LongTermMemoryEntry {
  id: string;
  eventType: MemoryEventType;
  timestamp: Date;
  associatedTaskId?: string;
  associatedProjectId?: string;
  toolUsedId?: string;
  rawData: any; // Original STM content
  aiAnalysis: string; // AI's interpretation
  userFeedback?: string;
  reasonForDenial?: string;
  tags: string[];
  relationships: MemoryRelationship[];
}

export enum MemoryEventType {
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_FAILED = 'TASK_FAILED',
  TOOL_SUCCESS = 'TOOL_SUCCESS',
  TOOL_FAILURE = 'TOOL_FAILURE',
  USER_FEEDBACK = 'USER_FEEDBACK',
  FEATURE_PROPOSED = 'FEATURE_PROPOSED',
  FEATURE_APPROVED = 'FEATURE_APPROVED',
  FEATURE_DENIED = 'FEATURE_DENIED',
  PATTERN_IDENTIFIED = 'PATTERN_IDENTIFIED',
  PREFERENCE_LEARNED = 'PREFERENCE_LEARNED',
  ERROR_ENCOUNTERED = 'ERROR_ENCOUNTERED',
  MAINTENANCE_PERFORMED = 'MAINTENANCE_PERFORMED'
}

export interface MemoryRelationship {
  type: 'uses' | 'depends_on' | 'similar_to' | 'caused_by' | 'leads_to';
  targetId: string;
  strength: number; // 0-1, relationship strength
}

export interface MemoryDecayConfig {
  defaultTTL: number; // Default time to live in seconds
  decayInterval: number; // How often to run decay process
  archiveThreshold: number; // Decay score threshold for archival
  criticalItemTTL: number; // Extended TTL for critical items
}

export interface MemoryQuery {
  eventTypes?: MemoryEventType[];
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
  associatedTaskId?: string;
  associatedProjectId?: string;
  searchText?: string;
  limit?: number;
  offset?: number;
}

export interface MemoryStats {
  stmItemCount: number;
  stmSizeBytes: number;
  ltmEntryCount: number;
  avgDecayScore: number;
  pendingArchivalCount: number;
  mostAccessedKeys: { key: string; count: number }[];
  memoryHealth: 'healthy' | 'warning' | 'critical';
}