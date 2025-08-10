import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface MindMapNode {
  id: string;
  title: string;
  x: number;
  y: number;
  type: 'central' | 'task';
}

interface MindMapLink {
  source: string;
  target: string;
}

export function useMindMap(projectId: string) {
  const [nodes, setNodes] = useState<MindMapNode[]>([]);
  const [links, setLinks] = useState<MindMapLink[]>([]);
  const queryClient = useQueryClient();

  // Update node position mutation
  const updatePositionMutation = useMutation({
    mutationFn: async ({ taskId, position }: { taskId: string; position: { x: number; y: number } }) => {
      const response = await apiRequest("PUT", `/api/tasks/${taskId}`, {
        position
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/projects", projectId, "tasks"]
      });
    }
  });

  // Create new task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/tasks`, taskData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/projects", projectId, "tasks"]
      });
    }
  });

  const updateNodePosition = useCallback((nodeId: string, position: { x: number; y: number }) => {
    updatePositionMutation.mutate({ taskId: nodeId, position });
  }, [updatePositionMutation]);

  const addNode = useCallback(() => {
    const newTask = {
      title: "New Task",
      description: "Click to edit this task",
      status: "todo",
      priority: "medium",
      position: {
        x: Math.random() * 400 + 200,
        y: Math.random() * 300 + 150
      }
    };
    createTaskMutation.mutate(newTask);
  }, [createTaskMutation]);

  const centerView = useCallback(() => {
    // This would center the view on the central node
    console.log("Centering view...");
  }, []);

  return {
    nodes,
    links,
    updateNodePosition,
    addNode,
    centerView
  };
}
