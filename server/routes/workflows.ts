// server/routes/workflows.ts
import { Router } from 'express';
import { runWorkflow } from '../workflowRunner';

export const workflowsRouter = Router();

workflowsRouter.post('/api/projects/:projectId/workflows/execute', async (req, res) => {
  try {
    const { steps, tools } = req.body; // expect arrays
    const result = await runWorkflow(steps || [], tools || []);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Workflow execution failed' });
  }
});