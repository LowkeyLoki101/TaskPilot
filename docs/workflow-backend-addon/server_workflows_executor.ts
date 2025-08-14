// server/workflows/executor.ts
import fs from "fs/promises";
import path from "path";
import fetch from "node-fetch";
import { Tool, Workflow, ExecuteResult } from "./types";

async function runAiPrompt(prompt: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    // Mocked response if no key
    return `[MOCK AI OUTPUT] ${prompt.slice(0, 200)}...`;
  }
  // Minimal OpenAI text generation (compatible with responses API or completions-style)
  // Using fetch to keep deps minimal.
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5
    })
  });
  const data: any = await resp.json();
  const txt = data?.choices?.[0]?.message?.content ?? JSON.stringify(data);
  return txt;
}

async function runApiCall(cfg: NonNullable<Tool["config"]>) {
  const method = cfg.method || "GET";
  const headers = cfg.headers || {};
  const body = cfg.body ? cfg.body : undefined;
  if (!cfg.endpoint) throw new Error("Missing endpoint");
  const res = await fetch(cfg.endpoint, { method, headers, body });
  const text = await res.text();
  return { status: res.status, body: text };
}

async function runFileOp(cfg: NonNullable<Tool["config"]>) {
  const op = cfg.fileOperation || "read";
  const p = cfg.filePath;
  if (!p) throw new Error("filePath is required");
  const abs = path.resolve(process.cwd(), p);
  switch (op) {
    case "read":
      return { content: await fs.readFile(abs, "utf-8") };
    case "write":
      await fs.writeFile(abs, cfg.body ?? "", "utf-8");
      return { ok: true };
    case "delete":
      await fs.unlink(abs);
      return { ok: true };
    case "copy":
      if (!cfg.body) throw new Error("body must contain destination path for copy");
      await fs.copyFile(abs, path.resolve(process.cwd(), cfg.body));
      return { ok: true };
  }
}

function runDataTransform(cfg: NonNullable<Tool["config"]>) {
  // Extremely simple placeholder: echoes JSON with keys uppercased
  try {
    const obj = cfg.body ? JSON.parse(cfg.body) : {};
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) out[k.toUpperCase()] = v;
    return out;
  } catch (e) {
    throw new Error("Invalid JSON for data_transform");
  }
}

async function runNotification(cfg: NonNullable<Tool["config"]>) {
  // Placeholder: just logs. Integrate with email/slack later.
  return { message: cfg.body || "Notification sent (mock)" };
}

export async function executeWorkflow(wf: Workflow): Promise<ExecuteResult[]> {
  const results: ExecuteResult[] = [];
  const toolIndex = new Map(wf.tools.map(t => [t.id, t]));

  // simple shared bag for outputs
  const context: Record<string, any> = {};

  for (const step of wf.steps) {
    const logs: string[] = [];
    const outputs: Record<string, any> = {};

    logs.push(`Executing step "${step.title}" with ${step.tools.length} tool(s)`);
    for (const tid of step.tools) {
      const tool = toolIndex.get(tid);
      if (!tool) {
        logs.push(`- Tool ${tid} not found`);
        continue;
      }
      const cfg = tool.config || {};
      try {
        let out: any = null;
        switch (cfg.action) {
          case "ai_prompt":
            out = await runAiPrompt(cfg.prompt || "Generate something useful.");
            break;
          case "api_call":
            out = await runApiCall(cfg);
            break;
          case "file_operation":
            out = await runFileOp(cfg);
            break;
          case "data_transform":
            out = runDataTransform(cfg);
            break;
          case "notification":
            out = await runNotification(cfg);
            break;
          default:
            logs.push(`- Tool "${tool.name}" has no action configured; skipping.`);
            continue;
        }
        const varName = cfg.outputVariable || tool.id;
        outputs[varName] = out;
        context[varName] = out; // make available to next tools
        logs.push(`- ${tool.name} (${cfg.action}) → stored as "${varName}"`);
      } catch (e: any) {
        logs.push(`! ${tool.name} failed: ${e.message}`);
      }
    }
    results.push({ stepId: step.id, logs, outputs, success: true });
  }
  return results;
}
