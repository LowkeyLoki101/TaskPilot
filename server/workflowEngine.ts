import { FlowScript, FlowTrace, FlowRuntime, ExecutionMode } from "@shared/flowscript";
import { executeTool } from "./toolRegistry";
import { randomUUID } from "crypto";

export class WorkflowEngine {
  private runtimes: Map<string, FlowRuntime> = new Map();

  // Create a new workflow runtime
  createRuntime(flow: FlowScript, mode: ExecutionMode): FlowRuntime {
    const runtime: FlowRuntime = {
      flowId: flow.id,
      mode,
      traces: [],
      variables: {},
      status: "idle"
    };

    this.runtimes.set(flow.id, runtime);
    return runtime;
  }

  // Get runtime for a flow
  getRuntime(flowId: string): FlowRuntime | undefined {
    return this.runtimes.get(flowId);
  }

  // Execute a complete workflow
  async executeFlow(flow: FlowScript, mode: ExecutionMode): Promise<FlowRuntime> {
    const runtime = this.createRuntime(flow, mode);
    runtime.status = "running";

    try {
      // Execute nodes in topological order
      const executionOrder = this.getExecutionOrder(flow);
      
      for (const node of executionOrder) {
        runtime.currentStep = node.id;
        
        // Check preconditions
        if (node.pre && !this.checkConditions(node.pre, runtime.variables)) {
          throw new Error(`Preconditions not met for step: ${node.label}`);
        }

        // Execute the step
        await this.executeStep(flow, node.id, runtime);
        
        // Short delay between steps
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      runtime.status = "completed";
      runtime.currentStep = undefined;
    } catch (error) {
      runtime.status = "failed";
      console.error("Workflow execution failed:", error);
    }

    return runtime;
  }

  // Execute a single step
  async executeStep(flow: FlowScript, stepId: string, runtime?: FlowRuntime): Promise<FlowTrace> {
    const node = flow.nodes.find(n => n.id === stepId);
    if (!node) {
      throw new Error(`Step not found: ${stepId}`);
    }

    const currentRuntime = runtime || this.getRuntime(flow.id);
    if (!currentRuntime) {
      throw new Error(`No runtime found for flow: ${flow.id}`);
    }

    const trace: FlowTrace = {
      runId: randomUUID(),
      stepId,
      timestamp: new Date().toISOString(),
      input: this.resolveVariables(node.inputs || {}, currentRuntime.variables),
      success: false
    };

    try {
      let result: any = {};

      if (node.tool && currentRuntime.mode === "live") {
        // Execute actual tool
        const execution = await executeTool(node.tool, trace.input);
        trace.success = execution.success;
        trace.latency_ms = execution.latency_ms;
        
        if (execution.success) {
          result = execution.result;
          trace.output = result;
        } else {
          trace.error = execution.error;
        }
      } else {
        // Simulate execution
        trace.success = true;
        trace.latency_ms = 500 + Math.random() * 2000;
        
        // Generate mock outputs based on node definition
        if (node.outputs) {
          result = this.generateMockOutputs(node.outputs);
          trace.output = result;
        }
      }

      // Update runtime variables with outputs
      if (trace.success && trace.output) {
        Object.entries(trace.output).forEach(([key, value]) => {
          currentRuntime.variables[`${stepId}.${key}`] = value;
        });

        // Set postconditions
        if (node.post) {
          Object.keys(node.post).forEach(condition => {
            currentRuntime.variables[condition] = true;
          });
        }
      }

    } catch (error) {
      trace.success = false;
      trace.error = error instanceof Error ? error.message : "Unknown error";
    }

    currentRuntime.traces.push(trace);
    return trace;
  }

  // Stop a running workflow
  stopFlow(flowId: string): void {
    const runtime = this.runtimes.get(flowId);
    if (runtime && runtime.status === "running") {
      runtime.status = "failed";
      runtime.currentStep = undefined;
    }
  }

  // Get execution order using topological sort
  private getExecutionOrder(flow: FlowScript) {
    const nodes = [...flow.nodes];
    const edges = flow.edges;
    
    // Simple topological sort (for demo - in production would handle cycles)
    const visited = new Set<string>();
    const order: typeof flow.nodes = [];
    
    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      // Visit dependencies first
      const dependencies = edges.filter(e => e.to === nodeId);
      dependencies.forEach(dep => visit(dep.from));
      
      const node = nodes.find(n => n.id === nodeId);
      if (node) order.push(node);
    };

    nodes.forEach(node => visit(node.id));
    return order;
  }

  // Check if conditions are met
  private checkConditions(conditions: Record<string, boolean>, variables: Record<string, any>): boolean {
    return Object.entries(conditions).every(([key, expected]) => {
      return variables[key] === expected;
    });
  }

  // Resolve variable references in inputs (e.g., @n1.fileUrl)
  private resolveVariables(inputs: Record<string, any>, variables: Record<string, any>): Record<string, any> {
    const resolved: Record<string, any> = {};
    
    Object.entries(inputs).forEach(([key, value]) => {
      if (typeof value === "string" && value.startsWith("@")) {
        const varName = value.slice(1);
        resolved[key] = variables[varName] || value;
      } else {
        resolved[key] = value;
      }
    });

    return resolved;
  }

  // Generate mock outputs for simulation
  private generateMockOutputs(outputSchema: Record<string, any>): Record<string, any> {
    const outputs: Record<string, any> = {};
    
    Object.entries(outputSchema).forEach(([key, type]) => {
      switch (type) {
        case "string":
          outputs[key] = `mock_${key}_${Date.now()}`;
          break;
        case "number":
          outputs[key] = Math.floor(Math.random() * 1000);
          break;
        case "boolean":
          outputs[key] = Math.random() > 0.5;
          break;
        default:
          outputs[key] = `mock_${key}`;
      }
    });

    return outputs;
  }
}

// Global workflow engine instance
export const workflowEngine = new WorkflowEngine();