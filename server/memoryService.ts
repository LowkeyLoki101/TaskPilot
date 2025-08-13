// Memory Service for Short-Term and Long-Term Memory Management
import { db } from './db';
import { longTermMemory, memoryRelationships } from '@shared/schema';
import type { InsertLongTermMemory, LongTermMemory, MemoryRelationship } from '@shared/schema';
import type { 
  ShortTermMemoryItem, 
  MemoryEventType,
  MemoryQuery,
  MemoryStats,
  MemoryDecayConfig 
} from '@shared/memoryTypes';
import { eq, and, gte, lte, like, desc, asc, sql } from 'drizzle-orm';

// In-memory STM cache (in production, this should be Redis)
class ShortTermMemoryCache {
  private cache: Map<string, ShortTermMemoryItem> = new Map();
  private decayInterval: any = null;
  private config: MemoryDecayConfig = {
    defaultTTL: 72 * 60 * 60, // 72 hours in seconds
    decayInterval: 30 * 60 * 1000, // 30 minutes in milliseconds
    archiveThreshold: 0.7,
    criticalItemTTL: 7 * 24 * 60 * 60, // 7 days for critical items
  };

  constructor() {
    this.startDecayProcess();
  }

  private startDecayProcess() {
    this.decayInterval = setInterval(() => {
      this.processDecay();
    }, this.config.decayInterval);
  }

  async processDecay() {
    const now = Date.now();
    const itemsToArchive: ShortTermMemoryItem[] = [];

    for (const [key, item] of Array.from(this.cache.entries())) {
      const age = now - item.timestamp.getTime();
      const ttl = item.priority === 'critical' 
        ? this.config.criticalItemTTL * 1000 
        : this.config.defaultTTL * 1000;

      // Calculate decay score based on age and access patterns
      const ageScore = age / ttl;
      const accessScore = 1 / (item.accessCount + 1);
      item.decayScore = (ageScore * 0.7 + accessScore * 0.3);

      if (item.decayScore > this.config.archiveThreshold) {
        itemsToArchive.push(item);
      }
    }

    // Archive items to LTM
    for (const item of itemsToArchive) {
      await this.archiveToLTM(item);
      this.cache.delete(item.key);
    }
  }

  private async archiveToLTM(item: ShortTermMemoryItem) {
    // Create a summary and archive to long-term memory
    const ltmEntry: InsertLongTermMemory = {
      eventType: 'STM_ARCHIVE',
      rawData: item.value,
      aiAnalysis: `Archived from STM: ${item.context}`,
      tags: [item.context.split(':')[0], item.priority],
    };

    await db.insert(longTermMemory).values(ltmEntry);
  }

  set(key: string, value: any, context: string, priority: 'critical' | 'high' | 'normal' | 'low' = 'normal') {
    const item: ShortTermMemoryItem = {
      id: crypto.randomUUID(),
      key,
      value,
      context,
      timestamp: new Date(),
      accessCount: 0,
      lastAccessed: new Date(),
      ttl: this.config.defaultTTL,
      decayScore: 0,
      priority,
    };
    this.cache.set(key, item);
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (item) {
      item.accessCount++;
      item.lastAccessed = new Date();
      return item.value;
    }
    return null;
  }

  getStats(): MemoryStats {
    const stats: MemoryStats = {
      stmItemCount: this.cache.size,
      stmSizeBytes: JSON.stringify(Array.from(this.cache.values())).length,
      ltmEntryCount: 0, // Will be populated from DB
      avgDecayScore: 0,
      pendingArchivalCount: 0,
      mostAccessedKeys: [],
      memoryHealth: 'healthy',
    };

    // Calculate average decay score
    let totalDecay = 0;
    const accessCounts: { key: string; count: number }[] = [];

    for (const [key, item] of Array.from(this.cache.entries())) {
      totalDecay += item.decayScore;
      accessCounts.push({ key, count: item.accessCount });
      if (item.decayScore > this.config.archiveThreshold) {
        stats.pendingArchivalCount++;
      }
    }

    stats.avgDecayScore = this.cache.size > 0 ? totalDecay / this.cache.size : 0;
    stats.mostAccessedKeys = accessCounts
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Determine health based on metrics
    if (stats.avgDecayScore > 0.8 || stats.stmSizeBytes > 100 * 1024 * 1024) {
      stats.memoryHealth = 'critical';
    } else if (stats.avgDecayScore > 0.6 || stats.stmSizeBytes > 50 * 1024 * 1024) {
      stats.memoryHealth = 'warning';
    }

    return stats;
  }

  clear() {
    this.cache.clear();
  }

  stop() {
    if (this.decayInterval) {
      clearInterval(this.decayInterval);
      this.decayInterval = null;
    }
  }
}

// Long-Term Memory Service
export class LongTermMemoryService {
  static async store(entry: InsertLongTermMemory): Promise<LongTermMemory> {
    const [result] = await db.insert(longTermMemory).values(entry).returning();
    return result;
  }

  static async query(params: MemoryQuery): Promise<LongTermMemory[]> {
    let query = db.select().from(longTermMemory);
    const conditions = [];

    if (params.eventTypes && params.eventTypes.length > 0) {
      conditions.push(sql`${longTermMemory.eventType} = ANY(${params.eventTypes})`);
    }

    if (params.startDate) {
      conditions.push(gte(longTermMemory.timestamp, params.startDate));
    }

    if (params.endDate) {
      conditions.push(lte(longTermMemory.timestamp, params.endDate));
    }

    if (params.associatedTaskId) {
      conditions.push(eq(longTermMemory.associatedTaskId, params.associatedTaskId));
    }

    if (params.associatedProjectId) {
      conditions.push(eq(longTermMemory.associatedProjectId, params.associatedProjectId));
    }

    if (params.searchText) {
      conditions.push(
        sql`${longTermMemory.aiAnalysis} ILIKE ${`%${params.searchText}%`} OR 
            ${longTermMemory.userFeedback} ILIKE ${`%${params.searchText}%`}`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    query = query.orderBy(desc(longTermMemory.timestamp)) as any;

    if (params.limit) {
      query = query.limit(params.limit) as any;
    }

    if (params.offset) {
      query = query.offset(params.offset) as any;
    }

    return await query;
  }

  static async createRelationship(
    sourceId: string,
    targetId: string,
    type: string,
    strength: number = 0.5
  ): Promise<MemoryRelationship> {
    const [result] = await db.insert(memoryRelationships).values({
      sourceId,
      targetId,
      type,
      strength,
    }).returning();
    return result;
  }

  static async getRelatedMemories(memoryId: string): Promise<LongTermMemory[]> {
    const relationships = await db.select()
      .from(memoryRelationships)
      .where(eq(memoryRelationships.sourceId, memoryId));

    const relatedIds = relationships.map(r => r.targetId);
    
    if (relatedIds.length === 0) return [];

    return await db.select()
      .from(longTermMemory)
      .where(sql`${longTermMemory.id} = ANY(${relatedIds})`);
  }

  static async analyzePatterns(projectId?: string): Promise<any> {
    // Analyze patterns in memory to identify insights
    const memories = await this.query({
      associatedProjectId: projectId,
      limit: 100,
    });

    const patterns = {
      commonEventTypes: {} as Record<string, number>,
      commonTags: {} as Record<string, number>,
      denialReasons: {} as Record<string, number>,
      toolUsage: {} as Record<string, number>,
    };

    for (const memory of memories) {
      // Count event types
      patterns.commonEventTypes[memory.eventType] = 
        (patterns.commonEventTypes[memory.eventType] || 0) + 1;

      // Count tags
      if (memory.tags) {
        for (const tag of memory.tags) {
          patterns.commonTags[tag] = (patterns.commonTags[tag] || 0) + 1;
        }
      }

      // Count denial reasons
      if (memory.reasonForDenial) {
        patterns.denialReasons[memory.reasonForDenial] = 
          (patterns.denialReasons[memory.reasonForDenial] || 0) + 1;
      }

      // Count tool usage
      if (memory.toolUsedId) {
        patterns.toolUsage[memory.toolUsedId] = 
          (patterns.toolUsage[memory.toolUsedId] || 0) + 1;
      }
    }

    return patterns;
  }
}

// Singleton instance of STM cache
export const stmCache = new ShortTermMemoryCache();

// Memory Management Service
export class MemoryService {
  static stm = stmCache;
  static ltm = LongTermMemoryService;

  static async getFullStats(): Promise<MemoryStats> {
    const stmStats = this.stm.getStats();
    
    // Get LTM count
    const ltmCount = await db.select({ count: sql`count(*)` })
      .from(longTermMemory);
    
    stmStats.ltmEntryCount = Number(ltmCount[0]?.count || 0);
    
    return stmStats;
  }

  static async recordEvent(
    eventType: string,
    data: any,
    analysis?: string,
    taskId?: string,
    projectId?: string
  ): Promise<void> {
    // Store in STM for immediate access
    const key = `event:${eventType}:${Date.now()}`;
    this.stm.set(key, data, `event:${eventType}`, 'normal');

    // Also store in LTM for permanent record
    await this.ltm.store({
      eventType,
      rawData: data,
      aiAnalysis: analysis,
      associatedTaskId: taskId,
      associatedProjectId: projectId,
      tags: [eventType.toLowerCase()],
    });
  }
}