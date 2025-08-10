import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FlowScript, FlowRuntime, ExecutionMode } from "@shared/flowscript";

export function useWorkflow() {
  const [currentWorkflow, setCurrentWorkflow] = useState<FlowScript | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Generate workflow from natural language
  const generateWorkflow = useMutation({
    mutationFn: async ({ userInput, projectId }: { userInput: string; projectId?: string }) => {
      const response = await fetch("/api/workflows/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput, projectId })
      });
      const data = await response.json();
      return data.workflow as FlowScript;
    },
    onSuccess: (workflow) => {
      setCurrentWorkflow(workflow);
      setSelectedNodeId(null);
    }
  });

  // Execute complete workflow
  const executeWorkflow = useMutation({
    mutationFn: async ({ workflow, mode }: { workflow: FlowScript; mode: ExecutionMode }) => {
      const response = await fetch(`/api/workflows/${workflow.id}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow, mode })
      });
      const data = await response.json();
      return data.runtime as FlowRuntime;
    }
  });

  // Execute single step
  const executeStep = useMutation({
    mutationFn: async ({ 
      workflow, 
      stepId, 
      mode = "simulate" 
    }: { 
      workflow: FlowScript; 
      stepId: string; 
      mode?: ExecutionMode;
    }) => {
      const response = await fetch(`/api/workflows/${workflow.id}/step/${stepId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow, mode })
      });
      const data = await response.json();
      return data.trace;
    }
  });

  // Get workflow runtime
  const getRuntime = useQuery({
    queryKey: ["workflow-runtime", currentWorkflow?.id],
    queryFn: async () => {
      if (!currentWorkflow?.id) return null;
      const response = await fetch(`/api/workflows/${currentWorkflow.id}/runtime`);
      const data = await response.json();
      return data.runtime as FlowRuntime;
    },
    enabled: !!currentWorkflow?.id,
    refetchInterval: 1000 // Refresh runtime every second when active
  });

  // Refine workflow based on feedback
  const refineWorkflow = useMutation({
    mutationFn: async ({ workflow, feedback }: { workflow: FlowScript; feedback: string }) => {
      const response = await fetch(`/api/workflows/${workflow.id}/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow, feedback })
      });
      const data = await response.json();
      return data.workflow as FlowScript;
    },
    onSuccess: (workflow) => {
      setCurrentWorkflow(workflow);
    }
  });

  // Explain workflow step
  const explainStep = useMutation({
    mutationFn: async ({ 
      workflow, 
      stepId, 
      level = "user" 
    }: { 
      workflow: FlowScript; 
      stepId: string; 
      level?: "user" | "developer";
    }) => {
      const response = await fetch(`/api/workflows/step/${stepId}/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow, level })
      });
      const data = await response.json();
      return data.explanation as string;
    }
  });

  // Workflow actions
  const selectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  const loadWorkflow = useCallback((workflow: FlowScript) => {
    setCurrentWorkflow(workflow);
    setSelectedNodeId(null);
  }, []);

  const clearWorkflow = useCallback(() => {
    setCurrentWorkflow(null);
    setSelectedNodeId(null);
  }, []);

  // Export workflow to different formats
  const exportWorkflow = useCallback((format: "json" | "mermaid") => {
    if (!currentWorkflow) return;

    if (format === "json") {
      const blob = new Blob([JSON.stringify(currentWorkflow, null, 2)], {
        type: "application/json"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentWorkflow.title.replace(/\s+/g, "_")}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "mermaid") {
      // Convert FlowScript to Mermaid format
      const mermaid = convertToMermaid(currentWorkflow);
      const blob = new Blob([mermaid], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentWorkflow.title.replace(/\s+/g, "_")}.mmd`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [currentWorkflow]);

  return {
    // State
    currentWorkflow,
    selectedNodeId,
    runtime: getRuntime.data,
    
    // Actions
    generateWorkflow: generateWorkflow.mutate,
    executeWorkflow: executeWorkflow.mutate,
    executeStep: executeStep.mutate,  
    refineWorkflow: refineWorkflow.mutate,
    explainStep: explainStep.mutate,
    
    // UI actions
    selectNode,
    loadWorkflow,
    clearWorkflow,
    exportWorkflow,
    
    // Loading states
    isGenerating: generateWorkflow.isPending,
    isExecuting: executeWorkflow.isPending,
    isRefining: refineWorkflow.isPending,
    isExplaining: explainStep.isPending
  };
}

// Helper function to convert FlowScript to Mermaid format
function convertToMermaid(workflow: FlowScript): string {
  let mermaid = `graph TD\n`;
  mermaid += `    %% ${workflow.title}\n`;
  
  // Add nodes
  workflow.nodes.forEach(node => {
    const shape = getNodeShape(node.type);
    mermaid += `    ${node.id}${shape[0]}"${node.label}"${shape[1]}\n`;
  });
  
  // Add edges
  workflow.edges.forEach(edge => {
    const label = edge.when || edge.label;
    if (label) {
      mermaid += `    ${edge.from} -->|"${label}"| ${edge.to}\n`;
    } else {
      mermaid += `    ${edge.from} --> ${edge.to}\n`;
    }
  });
  
  return mermaid;
}

function getNodeShape(type: string): [string, string] {
  switch (type) {
    case "decision": return ["{{", "}}"];
    case "ui_action": return ["[", "]"];
    case "api_call": return ["(", ")"];
    case "analysis": return ["{", "}"];
    default: return ["[", "]"];
  }
}