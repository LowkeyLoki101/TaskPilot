import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Activity, 
  Brain, 
  Zap, 
  Clock, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  Bot,
  User,
  Settings,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AIActivityEntry {
  id: string;
  timestamp: Date;
  type: 'ai_thinking' | 'ai_action' | 'ai_decision' | 'ai_execution' | 'ai_learning' | 'system_event' | 'user_interaction';
  action: string;
  details: any;
  duration?: number;
  status: 'started' | 'completed' | 'failed' | 'in_progress';
  reasoning?: string;
  impact?: string;
  relatedTo?: string[];
}

interface ComprehensiveActivityLoggerProps {
  className?: string;
}

export function ComprehensiveActivityLogger({ className }: ComprehensiveActivityLoggerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isRealTime, setIsRealTime] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<AIActivityEntry | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Get real-time activity data
  const { data: activities = [], isLoading, refetch } = useQuery<AIActivityEntry[]>({
    queryKey: ["/api/ai-activity"],
    refetchInterval: isRealTime ? 1000 : false, // Real-time updates every second
    staleTime: 0
  });

  // Auto-scroll to bottom when new activities arrive
  useEffect(() => {
    if (scrollAreaRef.current && isRealTime) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [activities, isRealTime]);

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.details?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || activity.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ai_thinking': return <Brain className="h-4 w-4" />;
      case 'ai_action': return <Zap className="h-4 w-4" />;
      case 'ai_decision': return <CheckCircle className="h-4 w-4" />;
      case 'ai_execution': return <Play className="h-4 w-4" />;
      case 'ai_learning': return <RotateCcw className="h-4 w-4" />;
      case 'system_event': return <Settings className="h-4 w-4" />;
      case 'user_interaction': return <User className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'in_progress': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ai_thinking': return 'border-purple-500 bg-purple-50 dark:bg-purple-950';
      case 'ai_action': return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
      case 'ai_decision': return 'border-green-500 bg-green-50 dark:bg-green-950';
      case 'ai_execution': return 'border-orange-500 bg-orange-50 dark:bg-orange-950';
      case 'ai_learning': return 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950';
      case 'system_event': return 'border-gray-500 bg-gray-50 dark:bg-gray-950';
      case 'user_interaction': return 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950';
      default: return 'border-gray-300 bg-gray-50 dark:bg-gray-900';
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredActivities, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `ai_activity_log_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI Activity Monitor</CardTitle>
            <Badge variant="outline" className="text-xs">
              {filteredActivities.length} events
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={isRealTime ? "default" : "outline"}
              size="sm"
              onClick={() => setIsRealTime(!isRealTime)}
              data-testid="toggle-realtime"
            >
              {isRealTime ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span className="hidden sm:inline ml-1">
                {isRealTime ? 'Live' : 'Paused'}
              </span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              data-testid="refresh-logs"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportLogs}
              data-testid="export-logs"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-sm"
              data-testid="search-activities"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-input rounded-md text-sm bg-background"
            data-testid="filter-type"
          >
            <option value="all">All Types</option>
            <option value="ai_thinking">AI Thinking</option>
            <option value="ai_action">AI Actions</option>
            <option value="ai_decision">AI Decisions</option>
            <option value="ai_execution">AI Execution</option>
            <option value="ai_learning">AI Learning</option>
            <option value="system_event">System Events</option>
            <option value="user_interaction">User Interactions</option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-4" ref={scrollAreaRef}>
          <div className="space-y-2 pb-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No activities found</p>
                {searchTerm && (
                  <p className="text-xs mt-1">Try adjusting your search or filter</p>
                )}
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`border-l-4 ${getTypeColor(activity.type)} p-3 rounded-r-md cursor-pointer hover:shadow-sm transition-shadow`}
                  onClick={() => setSelectedEntry(activity)}
                  data-testid={`activity-${activity.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getTypeIcon(activity.type)}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm text-foreground truncate">
                          {activity.action}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {activity.type.replace('_', ' ')}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </div>
                          {activity.duration && (
                            <Badge variant="secondary" className="text-xs">
                              {formatDuration(activity.duration)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-2">
                      <div 
                        className={`w-2 h-2 rounded-full ${getStatusColor(activity.status)}`}
                        title={activity.status}
                      />
                    </div>
                  </div>

                  {activity.reasoning && (
                    <div className="mt-2 text-xs text-muted-foreground border-t pt-2">
                      <strong>Reasoning:</strong> {activity.reasoning}
                    </div>
                  )}

                  {activity.details && (
                    <div className="mt-1">
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          View Details
                        </summary>
                        <div className="mt-1 p-2 bg-muted rounded text-xs font-mono whitespace-pre-wrap break-all">
                          {typeof activity.details === 'string' 
                            ? activity.details 
                            : JSON.stringify(activity.details, null, 2)
                          }
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}