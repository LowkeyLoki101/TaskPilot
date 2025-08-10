import { useState, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Speech recognition setup
  const setupRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser",
        variant: "destructive"
      });
      return null;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast({
        title: "Voice Error",
        description: "Speech recognition error occurred",
        variant: "destructive"
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  }, [toast]);

  // Process voice command mutation
  const processVoiceMutation = useMutation({
    mutationFn: async ({ command, projectId }: { command: string; projectId: string }) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/chat`, {
        content: command
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/projects"]
      });
      toast({
        title: "Voice Command Processed",
        description: "Your voice command has been processed successfully"
      });
      setTranscript("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process voice command",
        variant: "destructive"
      });
    }
  });

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      recognitionRef.current = setupRecognition();
    }
    
    if (recognitionRef.current) {
      setTranscript("");
      recognitionRef.current.start();
    }
  }, [setupRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const processVoiceCommand = useCallback((command: string, projectId: string) => {
    if (command.trim()) {
      processVoiceMutation.mutate({ command: command.trim(), projectId });
    }
  }, [processVoiceMutation]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    processVoiceCommand,
    isProcessing: processVoiceMutation.isPending
  };
}
