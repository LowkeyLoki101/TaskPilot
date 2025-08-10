import { z } from "zod";

// FlowScript DSL Types - Human-readable JSON for workflows
export const flowNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  actor: z.enum(["user", "app", "ai", "system"]),
  type: z.enum(["ui_action", "api_call", "decision", "analysis", "wait", "background"]),
  tool: z.string().optional(),
  inputs: z.record(z.any()).optional(),
  outputs: z.record(z.any()).optional(),
  pre: z.record(z.boolean()).optional(), // preconditions
  post: z.record(z.boolean()).optional(), // postconditions  
  errors: z.array(z.object({
    code: z.string(),
    explain: z.string()
  })).optional(),
  metrics: z.array(z.string()).optional(),
  artifacts: z.array(z.string()).optional(),
  position: z.object({
    x: z.number(),
    y: z.number()
  }).optional()
});

export const flowEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  when: z.string().optional(), // condition for transition
  label: z.string().optional()
});

export const flowTestCaseSchema = z.object({
  name: z.string(),
  given: z.record(z.any()),
  expect: z.record(z.any())
});

export const flowScriptSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  assumptions: z.array(z.string()),
  nodes: z.array(flowNodeSchema),
  edges: z.array(flowEdgeSchema),
  testcases: z.array(flowTestCaseSchema).optional()
});

export const flowTraceSchema = z.object({
  runId: z.string(),
  stepId: z.string(),
  timestamp: z.string(),
  input: z.record(z.any()),
  output: z.record(z.any()).optional(),
  success: z.boolean(),
  latency_ms: z.number().optional(),
  error: z.string().optional(),
  metrics: z.record(z.any()).optional()
});

// Inferred types
export type FlowNode = z.infer<typeof flowNodeSchema>;
export type FlowEdge = z.infer<typeof flowEdgeSchema>;
export type FlowScript = z.infer<typeof flowScriptSchema>;
export type FlowTrace = z.infer<typeof flowTraceSchema>;
export type FlowTestCase = z.infer<typeof flowTestCaseSchema>;

// Tool registry interface
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, any>;
    required: string[];
  };
  handler: (params: Record<string, any>) => Promise<any>;
}

// Execution modes
export type ExecutionMode = "simulate" | "live";

// Runtime state
export interface FlowRuntime {
  flowId: string;
  mode: ExecutionMode;
  currentStep?: string;
  traces: FlowTrace[];
  variables: Record<string, any>;
  status: "idle" | "running" | "completed" | "failed";
}