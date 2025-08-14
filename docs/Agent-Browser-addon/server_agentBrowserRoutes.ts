// server/agentBrowserRoutes.ts
import type { Express, Request, Response } from "express";
import { initAgentBrowser, createSession, runAction, destroySession } from "./agentBrowser";

export function registerAgentBrowserRoutes(app: Express) {
  // ensure browser is ready
  initAgentBrowser().catch((e) => {
    console.error("Failed to init agent browser:", e);
  });

  app.post("/api/agent-browser/sessions", async (_req: Request, res: Response) => {
    try {
      const s = await createSession();
      res.json({ ok: true, id: s.id });
    } catch (e: any) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  app.post("/api/agent-browser/:id/actions", async (req: Request, res: Response) => {
    try {
      const out = await runAction(req.params.id, req.body);
      res.json(out);
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  });

  app.delete("/api/agent-browser/:id", async (req: Request, res: Response) => {
    try {
      const out = await destroySession(req.params.id);
      res.json(out);
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  });
}
