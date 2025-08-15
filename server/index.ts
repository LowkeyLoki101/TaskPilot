import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
// Initialize agent system
import { AgentRegistry } from "./agentRegistry";
import { AgentOrchestrator } from "./agentOrchestrator";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize agent systems
  console.log("🚀 Initializing AI Agent Systems...");
  try {
    await AgentOrchestrator.initialize();
    console.log("✅ Agent systems initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize agent systems:", error);
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  // Force development mode for now to ensure Vite serves properly
  const isDevelopment = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;
  if (isDevelopment) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  console.log(`Environment: NODE_ENV=${process.env.NODE_ENV}, PORT=${process.env.PORT}`);
  console.log(`Starting server on 0.0.0.0:${port}`);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
    console.log(`✅ Server accessible at http://0.0.0.0:${port}`);
    if (process.env.REPLIT_DEV_DOMAIN) {
      console.log(`🌐 External URL: https://${process.env.REPLIT_DEV_DOMAIN}`);
    }
  });
})();
