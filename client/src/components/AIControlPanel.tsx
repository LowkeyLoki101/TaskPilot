import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Settings, Palette, Layout, Globe, Mail } from "lucide-react";

interface AIAction {
  type: string;
  target: string;
  parameters: Record<string, any>;
}

interface AIResponse {
  message: string;
  actions?: AIAction[];
  websiteUpdates?: Array<{
    element: string;
    action: string;
    content?: string;
    styles?: Record<string, string>;
  }>;
  execution?: {
    success: boolean;
    results: string[];
    errors: string[];
  };
}

export function AIControlPanel() {
  const [request, setRequest] = useState("");
  const [lastResponse, setLastResponse] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const context = {
        currentPage: "dashboard",
        userRole: "admin",
        uiState: "standard"
      };

      const response = await fetch("/api/ai/control", {
        method: "POST",
        body: JSON.stringify({ request, context }),
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        const result: AIResponse = await response.json();
        setLastResponse(result);
      }
    } catch (error) {
      console.error("AI control error:", error);
    } finally {
      setIsLoading(false);
      setRequest("");
    }
  };

  const executeQuickAction = async (action: string) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const context = { currentPage: "dashboard", userRole: "admin" };
      const response = await fetch("/api/ai/control", {
        method: "POST",
        body: JSON.stringify({ request: action, context }),
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        const result: AIResponse = await response.json();
        setLastResponse(result);
      }
    } catch (error) {
      console.error("AI control error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      label: "Switch to Dark Theme",
      action: "Change the website to dark theme with neural blue accents",
      icon: <Palette className="h-4 w-4" />
    },
    {
      label: "Reorganize Layout",
      action: "Optimize the dashboard layout for better productivity",
      icon: <Layout className="h-4 w-4" />
    },
    {
      label: "Create Sample Tasks",
      action: "Create 5 sample tasks for a software development project",
      icon: <Zap className="h-4 w-4" />
    },
    {
      label: "Send Status Email",
      action: "Prepare and send a project status email to the team",
      icon: <Mail className="h-4 w-4" />
    },
    {
      label: "Search Project Ideas",
      action: "Search the web for innovative project management techniques",
      icon: <Globe className="h-4 w-4" />
    },
    {
      label: "Customize Interface",
      action: "Personalize the interface colors and layout based on my preferences",
      icon: <Settings className="h-4 w-4" />
    }
  ];

  return (
    <div className="space-y-4" data-testid="ai-control-panel">
      {/* AI Control Input */}
      <div className="space-y-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder="Tell me what you want me to do..."
              className="flex-1"
              data-testid="input-ai-request"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !request.trim()}
              data-testid="button-submit-request"
            >
              {isLoading ? "Processing..." : "Execute"}
            </Button>
          </div>
        </form>

        {lastResponse && (
          <div className="space-y-3" data-testid="ai-response">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-2">AI Response:</p>
              <p className="text-sm">{lastResponse.message}</p>
            </div>

            {lastResponse.actions && lastResponse.actions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Actions Executed:</p>
                {lastResponse.actions.map((action, index) => (
                  <Badge key={index} variant="secondary" className="mr-2">
                    {action.type}: {action.target}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Quick Actions</h4>
        <div className="grid grid-cols-1 gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => executeQuickAction(action.action)}
              disabled={isLoading}
              className="justify-start h-auto p-3 text-left"
              data-testid={`button-quick-action-${index}`}
            >
              <div className="flex items-start gap-2">
                {action.icon}
                <div>
                  <div className="font-medium text-xs">{action.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {action.action}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}