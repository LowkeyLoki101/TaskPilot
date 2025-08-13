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

  // AI-powered voice processing mutation
  const processVoiceMutation = useMutation({
    mutationFn: async ({ command }: { command: string }) => {
      const response = await apiRequest("POST", "/api/voice/process", {
        text: command
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate both tasks and chat to refresh UI
      queryClient.invalidateQueries({
        queryKey: ["/api/projects"]
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/projects", "default-project", "chat"]
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/projects", "default-project", "tasks"]
      });
      
      // Show AI-generated response
      if (data.action === 'task_created') {
        toast({
          title: "✅ Task Created",
          description: `"${data.task.title}" - AI organized and tagged automatically`
        });
      } else if (data.action === 'workflow_created') {
        toast({
          title: "🔄 Workflow Created", 
          description: `"${data.workflow.title}" - Ready to execute`
        });
      } else if (data.action === 'question_answered') {
        toast({
          title: "💡 AI Response",
          description: data.response
        });
      }
      setTranscript("");
    },
    onError: () => {
      toast({
        title: "AI Processing Error",
        description: "Could not understand your request. Try speaking more clearly.",
        variant: "destructive"
      });
    }
  });

  // Auto-process speech when it ends
  const autoProcessSpeech = useCallback((text: string) => {
    if (text.trim().length > 5) { // Only process meaningful speech
      processVoiceMutation.mutate({ command: text });
    }
  }, [processVoiceMutation]);

  // Auto-process transcript when listening stops
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    
    // Auto-process transcript after a short delay
    if (transcript.trim().length > 5) {
      setTimeout(() => {
        autoProcessSpeech(transcript.trim());
      }, 1000);
    }
  }, [transcript, autoProcessSpeech]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      recognitionRef.current = setupRecognition();
    }
    
    if (recognitionRef.current) {
      setTranscript("");
      recognitionRef.current.start();
    }
  }, [setupRecognition]);



  const processVoiceCommand = useCallback((command: string) => {
    if (command.trim()) {
      processVoiceMutation.mutate({ command: command.trim() });
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
