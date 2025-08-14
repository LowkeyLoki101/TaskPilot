// server/workflows/store.ts
import { Workflow } from "./types";

// In-memory store for simplicity. Swap with Drizzle later.
const store = new Map<string, Workflow>();

export function getWorkflow(projectId: string): Workflow {
  if (!store.has(projectId)) {
    store.set(projectId, { projectId, steps: [], tools: [] });
  }
  // return a deep clone to avoid accidental mutation
  return JSON.parse(JSON.stringify(store.get(projectId)!));
}

export function saveWorkflow(projectId: string, wf: Workflow) {
  store.set(projectId, JSON.parse(JSON.stringify(wf)));
  return getWorkflow(projectId);
}
