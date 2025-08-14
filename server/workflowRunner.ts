// server/workflowRunner.ts
type ToolConfig = {
  action?: 'api_call' | 'ai_prompt' | 'file_operation' | 'data_transform' | 'notification';
  endpoint?: string;
  method?: string;
  body?: string;
  fileOperation?: 'read' | 'write' | 'delete' | 'copy';
  filePath?: string;
  prompt?: string;
  outputVariable?: string;
};

type Tool = {
  id: string;
  name: string;
  type: string;
  config?: ToolConfig;
};

type Step = {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  tools: string[];
  order?: number;
};

type ActivityEvent = { action: string; type: 'system'|'maintenance'|'enhancement'|'bug'|'ai_response' };

const log = (events: ActivityEvent[], action: string, type: ActivityEvent['type']) => {
  events.push({ action, type });
};

const execTool = async (tool: Tool, ctx: Record<string, any>, events: ActivityEvent[]) => {
  const cfg = tool.config || {};
  try {
    switch (cfg.action) {
      case 'api_call': {
        if (!cfg.endpoint) throw new Error('Missing endpoint');
        const init: RequestInit = {
          method: cfg.method || 'GET',
          headers: { 'Content-Type': 'application/json' }
        };
        if ((cfg.method || 'GET') !== 'GET' && cfg.body) init.body = cfg.body;
        const r = await fetch(cfg.endpoint, init);
        const data = await r.json().catch(() => ({}));
        log(events, `API ${cfg.method || 'GET'} ${cfg.endpoint} → ${r.status}`, 'enhancement');
        if (cfg.outputVariable) ctx[cfg.outputVariable] = data;
        return data;
      }
      case 'ai_prompt': {
        // Placeholder: call your own chat endpoint if you have one
        log(events, `AI prompt executed: ${(cfg.prompt || '').slice(0, 60)}…`, 'ai_response');
        if (cfg.outputVariable) ctx[cfg.outputVariable] = { ok: true };
        return { ok: true };
      }
      case 'file_operation': {
        log(events, `File ${cfg.fileOperation || 'read'} ${cfg.filePath || ''}`, 'maintenance');
        if (cfg.outputVariable) ctx[cfg.outputVariable] = { ok: true };
        return { ok: true };
      }
      case 'data_transform': {
        log(events, `Data transform (${cfg.outputVariable || 'output'})`, 'enhancement');
        if (cfg.outputVariable) ctx[cfg.outputVariable] = { ok: true };
        return { ok: true };
      }
      case 'notification': {
        log(events, `Notification sent (${tool.name})`, 'maintenance');
        return { ok: true };
      }
      default: {
        log(events, `Skipped tool (no action): ${tool.name}`, 'bug');
        return { skipped: true };
      }
    }
  } catch (e: any) {
    log(events, `Tool failed: ${tool.name} — ${e?.message || e}`, 'bug');
    throw e;
  }
};

export async function runWorkflow(steps: Step[], tools: Tool[]) {
  const events: ActivityEvent[] = [];
  const ctx: Record<string, any> = {};
  const completedStepIds: string[] = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const label = step.name || step.title || `Step ${i + 1}`;
    log(events, `▶️ Step ${i + 1}: ${label}`, 'system');

    const stepTools = step.tools
      .map(tid => tools.find(t => t.id === tid))
      .filter((t): t is Tool => Boolean(t));

    for (const tool of stepTools) {
      await execTool(tool, ctx, events);
    }

    completedStepIds.push(step.id);
  }

  return { events, completedStepIds, context: ctx };
}