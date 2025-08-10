import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useWebSocket(projectId: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      ws.send(JSON.stringify({
        type: "join_project",
        projectId: projectId
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [projectId, queryClient, toast]);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case "task_created":
        queryClient.invalidateQueries({
          queryKey: ["/api/projects", projectId, "tasks"]
        });
        toast({
          title: "Task Created",
          description: `New task: ${data.data.title}`
        });
        break;
        
      case "task_updated":
        queryClient.invalidateQueries({
          queryKey: ["/api/projects", projectId, "tasks"]
        });
        queryClient.invalidateQueries({
          queryKey: ["/api/tasks", data.data.id]
        });
        toast({
          title: "Task Updated",
          description: `Task "${data.data.title}" has been updated`
        });
        break;
        
      case "task_deleted":
        queryClient.invalidateQueries({
          queryKey: ["/api/projects", projectId, "tasks"]
        });
        toast({
          title: "Task Deleted",
          description: "A task has been deleted"
        });
        break;
        
      case "chat_message":
        queryClient.invalidateQueries({
          queryKey: ["/api/projects", projectId, "chat"]
        });
        break;
        
      default:
        console.log("Unknown WebSocket message type:", data.type);
    }
  };

  return {
    sendMessage: (message: any) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
      }
    }
  };
}
