// Tool Registry Service for managing internal and external tools
import { db } from './db';
import { advancedToolRegistry, toolExecutions } from '@shared/schema';
import type { 
  InsertAdvancedToolRegistry, 
  AdvancedToolRegistry, 
  InsertToolExecution,
  ToolExecution 
} from '@shared/schema';
import type {
  Tool,
  ToolConfiguration,
  ToolPerformanceMetrics,
  ToolExecution as ToolExecutionType,
  ExternalToolRegistration,
  ErrorPattern
} from '@shared/toolRegistryTypes';
import { ToolCategory } from '@shared/toolRegistryTypes';
import { eq, and, gte, sql, desc } from 'drizzle-orm';

export class ToolRegistryService {
  private static toolCache: Map<string, Tool> = new Map();
  private static lastCacheUpdate: Date = new Date(0);
  private static CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Register a new tool
  static async registerTool(tool: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdvancedToolRegistry> {
    const toolData: InsertAdvancedToolRegistry = {
      name: tool.name,
      description: tool.description,
      type: tool.type,
      category: tool.category,
      status: tool.status || 'active',
      version: tool.version,
      icon: tool.icon,
      permissions: tool.permissions,
      configuration: tool.configuration,
      performance: tool.performance || {
        totalCalls: 0,
        successCount: 0,
        failureCount: 0,
        averageLatencyMs: 0,
        errorRate: 0,
        successRate: 100,
        commonErrors: [],
      },
    };

    const [result] = await db.insert(advancedToolRegistry).values(toolData).returning();
    
    // Clear cache to force refresh
    this.toolCache.clear();
    
    return result;
  }

  // Get tool by ID
  static async getTool(toolId: string): Promise<AdvancedToolRegistry | null> {
    const [tool] = await db.select()
      .from(advancedToolRegistry)
      .where(eq(advancedToolRegistry.id, toolId))
      .limit(1);
    
    return tool || null;
  }

  // Get tool by name
  static async getToolByName(name: string): Promise<AdvancedToolRegistry | null> {
    const [tool] = await db.select()
      .from(advancedToolRegistry)
      .where(eq(advancedToolRegistry.name, name))
      .limit(1);
    
    return tool || null;
  }

  // Get all active tools
  static async getActiveTools(): Promise<AdvancedToolRegistry[]> {
    return await db.select()
      .from(advancedToolRegistry)
      .where(eq(advancedToolRegistry.status, 'active'));
  }

  // Get tools by category
  static async getToolsByCategory(category: string): Promise<AdvancedToolRegistry[]> {
    return await db.select()
      .from(advancedToolRegistry)
      .where(eq(advancedToolRegistry.category, category));
  }

  // Update tool configuration
  static async updateToolConfig(
    toolId: string, 
    config: Partial<ToolConfiguration>
  ): Promise<void> {
    const tool = await this.getTool(toolId);
    if (!tool) throw new Error(`Tool ${toolId} not found`);

    const currentConfig = tool.configuration as any;
    const updatedConfig = { ...currentConfig, ...config };
    
    await db.update(advancedToolRegistry)
      .set({ 
        configuration: updatedConfig,
        updatedAt: new Date(),
      })
      .where(eq(advancedToolRegistry.id, toolId));
    
    // Clear cache
    this.toolCache.clear();
  }

  // Record tool execution
  static async recordExecution(execution: Omit<InsertToolExecution, 'id'>): Promise<ToolExecution> {
    const [result] = await db.insert(toolExecutions).values(execution).returning();
    
    // Update tool performance metrics
    await this.updateToolMetrics(execution.toolId);
    
    return result;
  }

  // Update tool performance metrics
  static async updateToolMetrics(toolId: string): Promise<void> {
    // Get recent executions
    const recentExecutions = await db.select()
      .from(toolExecutions)
      .where(eq(toolExecutions.toolId, toolId))
      .orderBy(desc(toolExecutions.startTime))
      .limit(100);

    if (recentExecutions.length === 0) return;

    // Calculate metrics
    const metrics: ToolPerformanceMetrics = {
      totalCalls: recentExecutions.length,
      successCount: recentExecutions.filter(e => e.status === 'success').length,
      failureCount: recentExecutions.filter(e => e.status === 'failure').length,
      averageLatencyMs: 0,
      lastUsed: recentExecutions[0].startTime,
      errorRate: 0,
      successRate: 0,
      commonErrors: [],
    };

    // Calculate average latency
    const latencies = recentExecutions
      .filter(e => e.latencyMs !== null)
      .map(e => e.latencyMs!);
    
    if (latencies.length > 0) {
      metrics.averageLatencyMs = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    }

    // Calculate rates
    metrics.errorRate = (metrics.failureCount / metrics.totalCalls) * 100;
    metrics.successRate = (metrics.successCount / metrics.totalCalls) * 100;

    // Analyze common errors
    const errorMap: Map<string, ErrorPattern> = new Map();
    
    for (const execution of recentExecutions) {
      if (execution.status === 'failure' && execution.error) {
        const errorKey = execution.error.substring(0, 100); // First 100 chars as key
        const existing = errorMap.get(errorKey);
        
        if (existing) {
          existing.count++;
          existing.lastOccurred = execution.startTime;
        } else {
          errorMap.set(errorKey, {
            errorType: 'runtime',
            message: execution.error,
            count: 1,
            lastOccurred: execution.startTime,
          });
        }
      }
    }

    metrics.commonErrors = Array.from(errorMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Update tool with new metrics
    await db.update(advancedToolRegistry)
      .set({ 
        performance: metrics,
        updatedAt: new Date(),
      })
      .where(eq(advancedToolRegistry.id, toolId));
  }

  // Find best tool for a task
  static async findToolForTask(taskDescription: string): Promise<AdvancedToolRegistry | null> {
    // This is a simplified implementation
    // In production, this would use NLP to match task description to tool capabilities
    
    const allTools = await this.getActiveTools();
    
    // Simple keyword matching
    const keywords = taskDescription.toLowerCase().split(' ');
    let bestMatch: AdvancedToolRegistry | null = null;
    let bestScore = 0;

    for (const tool of allTools) {
      let score = 0;
      const toolText = `${tool.name} ${tool.description}`.toLowerCase();
      
      for (const keyword of keywords) {
        if (toolText.includes(keyword)) {
          score++;
        }
      }

      // Boost score based on performance
      const perf = tool.performance as ToolPerformanceMetrics;
      if (perf && perf.successRate > 90) {
        score *= 1.2;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = tool;
      }
    }

    return bestMatch;
  }

  // Execute tool with retry logic
  static async executeTool(
    toolId: string,
    input: any,
    userId?: string,
    taskId?: string
  ): Promise<ToolExecutionType> {
    const tool = await this.getTool(toolId);
    if (!tool) throw new Error(`Tool ${toolId} not found`);

    const config = tool.configuration as ToolConfiguration;
    const maxRetries = config.retryConfig?.maxRetries || 3;
    let retryCount = 0;
    let lastError: string | undefined;

    while (retryCount <= maxRetries) {
      const execution: Omit<InsertToolExecution, 'id'> = {
        toolId,
        status: 'running',
        input,
        userId,
        taskId,
        retryCount,
      };

      const [executionRecord] = await db.insert(toolExecutions)
        .values(execution)
        .returning();

      try {
        // Simulate tool execution (in production, this would call actual tool)
        const output = await this.runTool(tool, input);

        // Update execution record
        await db.update(toolExecutions)
          .set({
            status: 'success',
            output,
            endTime: new Date(),
            latencyMs: Date.now() - executionRecord.startTime.getTime(),
          })
          .where(eq(toolExecutions.id, executionRecord.id));

        // Update metrics
        await this.updateToolMetrics(toolId);

        return {
          ...executionRecord,
          status: 'success',
          output,
          endTime: new Date(),
          error: undefined,
        } as ToolExecutionType;
      } catch (error: any) {
        lastError = error.message;
        retryCount++;

        // Update execution record
        await db.update(toolExecutions)
          .set({
            status: retryCount > maxRetries ? 'failure' : 'pending',
            error: lastError,
            endTime: new Date(),
            latencyMs: Date.now() - executionRecord.startTime.getTime(),
          })
          .where(eq(toolExecutions.id, executionRecord.id));

        if (retryCount <= maxRetries && config.retryConfig) {
          // Exponential backoff
          const delay = Math.min(
            config.retryConfig.maxBackoffMs || 30000,
            1000 * Math.pow(config.retryConfig.backoffMultiplier || 2, retryCount)
          );
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Tool execution failed after ${maxRetries} retries: ${lastError}`);
  }

  // Simulate running a tool (placeholder for actual implementation)
  private static async runTool(tool: AdvancedToolRegistry, input: any): Promise<any> {
    const config = tool.configuration as ToolConfiguration;
    
    // For external tools, make API call
    if (tool.type === 'external' && config.endpoint) {
      // In production, this would make actual HTTP request
      return { simulated: true, tool: tool.name, input };
    }

    // For internal tools, execute function
    switch (tool.name) {
      case 'web_search':
        return { results: ['simulated search results'] };
      case 'code_generator':
        return { code: '// Generated code' };
      default:
        return { executed: true, tool: tool.name };
    }
  }

  // Get tool execution history
  static async getExecutionHistory(
    toolId: string,
    limit: number = 50
  ): Promise<ToolExecution[]> {
    return await db.select()
      .from(toolExecutions)
      .where(eq(toolExecutions.toolId, toolId))
      .orderBy(desc(toolExecutions.startTime))
      .limit(limit);
  }

  // Register external tool
  static async registerExternalTool(registration: ExternalToolRegistration): Promise<AdvancedToolRegistry> {
    const tool: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'> = {
      name: registration.name,
      description: `External tool: ${registration.name}`,
      type: 'external',
      category: ToolCategory.INTEGRATION,
      status: 'testing',
      version: registration.apiVersion,
      permissions: [],
      configuration: {
        endpoint: registration.baseUrl,
        authType: registration.authentication.type,
        apiKey: registration.authentication.credentials,
        schema: registration.endpoints,
      },
      performance: {
        totalCalls: 0,
        successCount: 0,
        failureCount: 0,
        averageLatencyMs: 0,
        errorRate: 0,
        successRate: 100,
        commonErrors: [],
      },
    };

    return await this.registerTool(tool);
  }
}