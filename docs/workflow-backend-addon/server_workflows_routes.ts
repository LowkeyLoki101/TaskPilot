// server/workflows/routes.ts
import type { Express, Request, Response } from "express";
import { getWorkflow, saveWorkflow } from "./store";
import { executeWorkflow } from "./executor";
import { Workflow } from "./types";

export function registerWorkflowRoutes(app: Express) {
  // Load workflow
  app.get("/api/projects/:projectId/workflow", (req: Request, res: Response) => {
    const wf = getWorkflow(req.params.projectId);
    res.json({ ok: true, workflow: wf });
  });

  // Save whole workflow
  app.post("/api/projects/:projectId/workflow", (req: Request, res: Response) => {
    const incoming: Workflow = req.body;
    if (!incoming || incoming.projectId !== req.params.projectId) {
      return res.status(400).json({ ok: false, error: "Invalid workflow payload" });
    }
    const saved = saveWorkflow(req.params.projectId, incoming);
    res.json({ ok: true, workflow: saved });
  });

  // Execute
  app.post("/api/projects/:projectId/workflow/execute", async (req: Request, res: Response) => {
    const wf = getWorkflow(req.params.projectId);
    try {
      const results = await executeWorkflow(wf);
      res.json({ ok: true, results });
    } catch (e: any) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });
}
