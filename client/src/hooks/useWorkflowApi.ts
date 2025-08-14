import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Workflow,
  WorkflowStep,
  Tool,
  CreateWorkflowRequest,
  ExecuteWorkflowRequest,
  ExecuteWorkflowResponse,
  WorkflowExecution,
  BrowserSessionRequest,
  BrowserActionRequest,
  BrowserActionResponse
} from "@shared/workflowTypes";

export function useWorkflow(projectId: string) {
  const queryClient = useQueryClient();

  // Fetch workflow for project
  const { data: workflow, isLoading, error } = useQuery<Workflow>({
    queryKey: ["/api/projects", projectId, "workflow"],
    refetchInterval: false
  });

  // Save workflow mutation
  const saveWorkflow = useMutation({
    mutationFn: async (workflowData: CreateWorkflowRequest) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/workflow`, workflowData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "workflow"] });
    }
  });

  // Execute workflow mutation
  const executeWorkflow = useMutation({
    mutationFn: async (executeData: ExecuteWorkflowRequest) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/workflow/execute`, executeData);
      return response.json() as Promise<ExecuteWorkflowResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "workflow"] });
    }
  });

  return {
    workflow,
    isLoading,
    error,
    saveWorkflow,
    executeWorkflow
  };
}

export function useWorkflowExecution(executionId: string | null) {
  // Fetch execution status
  const { data: execution, isLoading } = useQuery<WorkflowExecution>({
    queryKey: ["/api/workflow/executions", executionId],
    enabled: !!executionId,
    refetchInterval: (data) => {
      // Poll every 2 seconds while running
      return data?.status === 'running' ? 2000 : false;
    }
  });

  // Fetch execution logs
  const { data: logs } = useQuery({
    queryKey: ["/api/workflow/executions", executionId, "logs"],
    enabled: !!executionId,
    refetchInterval: execution?.status === 'running' ? 1000 : false
  });

  return {
    execution,
    logs,
    isLoading
  };
}

export function useBrowserSession() {
  const queryClient = useQueryClient();

  // Create browser session
  const createSession = useMutation({
    mutationFn: async (data: BrowserSessionRequest) => {
      const response = await apiRequest("POST", "/api/agent-browser/sessions", data);
      return response.json();
    }
  });

  // Execute browser action
  const executeBrowserAction = useMutation({
    mutationFn: async ({ sessionId, action }: { sessionId: string; action: BrowserActionRequest }) => {
      const response = await apiRequest("POST", `/api/agent-browser/${sessionId}/actions`, action);
      return response.json() as Promise<BrowserActionResponse>;
    }
  });

  // Close browser session
  const closeSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest("DELETE", `/api/agent-browser/${sessionId}`);
      return response.json();
    }
  });

  return {
    createSession,
    executeBrowserAction,
    closeSession
  };
}