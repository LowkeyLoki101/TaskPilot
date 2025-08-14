# Workflow Orchestrator Backend (Persistence + Execution)
This pack adds:
- **Persistence** for steps/tools (in-memory for now).
- **Execution engine** that runs tool actions (`ai_prompt`, `api_call`, `file_operation`, `data_transform`, `notification`).

## Files
Place these under `server/workflows/`:
- `types.ts`
- `store.ts`
- `executor.ts`
- `routes.ts`

## Install
```bash
pnpm add node-fetch@3
```

> If you use `ai_prompt`, set `OPENAI_API_KEY` in your environment. If not set, you'll get a mock output.

## Wire routes
In `server/routes.ts` (or equivalent):
```ts
import { registerWorkflowRoutes } from "./workflows/routes";

export function registerRoutes(app: import("express").Express) {
  // existing
  registerWorkflowRoutes(app);
}
```

## Client usage (WorkflowMindMap)
1) **Load & save workflow**
```ts
// Load on mount
const { data } = useQuery({
  queryKey: ["workflow", projectId],
  queryFn: async () => (await fetch(`/api/projects/${projectId}/workflow`)).json()
});

// Save when tools/steps change
await fetch(`/api/projects/${projectId}/workflow`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ projectId, steps, tools })
});
```

2) **Execute**
```ts
const exec = await fetch(`/api/projects/${projectId}/workflow/execute`, { method: "POST" });
const { results } = await exec.json();
```

Each `results[i]` includes `logs` and `outputs` keyed by `outputVariable` (or tool id).

## Notes
- Store is in-memory; restart clears it. Swap with Drizzle later.
- `file_operation` uses server filesystem paths. Be careful on Replit.
- `api_call` uses `node-fetch` v3 (ESM).
- `ai_prompt` calls OpenAI if `OPENAI_API_KEY` is set; otherwise returns a mock string.
