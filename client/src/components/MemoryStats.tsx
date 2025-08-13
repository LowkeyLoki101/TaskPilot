// Memory Statistics Component - Displays STM/LTM stats and management controls
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Database, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Archive,
  Zap,
  Clock,
  HardDrive
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MemoryStats {
  stmItemCount: number;
  stmSizeBytes: number;
  ltmEntryCount: number;
  avgDecayScore: number;
  pendingArchivalCount: number;
  mostAccessedKeys: { key: string; count: number }[];
  memoryHealth: 'healthy' | 'warning' | 'critical';
}

export function MemoryStats() {
  // Fetch memory statistics
  const { data: stats, isLoading } = useQuery<MemoryStats>({
    queryKey: ['/api/memory/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return null;
    }
  };

  if (isLoading || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Memory System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Memory System
          </div>
          <div className={`flex items-center gap-1 ${getHealthColor(stats.memoryHealth)}`}>
            {getHealthIcon(stats.memoryHealth)}
            <span className="text-sm font-medium capitalize">{stats.memoryHealth}</span>
          </div>
        </CardTitle>
        <CardDescription>
          Short-term and long-term memory management
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {/* STM Statistics */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Short-Term Memory</span>
            </div>
            <Badge variant="outline">{stats.stmItemCount} items</Badge>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Size</span>
              <span>{formatBytes(stats.stmSizeBytes)}</span>
            </div>
            <Progress value={(stats.stmSizeBytes / (100 * 1024 * 1024)) * 100} className="h-2" />
          </div>
        </div>

        {/* LTM Statistics */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-green-500" />
              <span className="font-medium">Long-Term Memory</span>
            </div>
            <Badge variant="outline">{stats.ltmEntryCount} entries</Badge>
          </div>
        </div>

        {/* Decay Statistics */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="font-medium">Memory Decay</span>
            </div>
            <Badge variant="outline">{stats.pendingArchivalCount} pending</Badge>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Average Decay Score</span>
              <span>{(stats.avgDecayScore * 100).toFixed(1)}%</span>
            </div>
            <Progress value={stats.avgDecayScore * 100} className="h-2" />
          </div>
        </div>

        {/* Most Accessed Keys */}
        {stats.mostAccessedKeys.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <span>Most Accessed</span>
            </div>
            <ScrollArea className="h-24">
              <div className="space-y-1">
                {stats.mostAccessedKeys.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="font-mono truncate flex-1">{item.key}</span>
                    <Badge variant="secondary" className="ml-2">
                      {item.count}x
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Memory Actions */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Archive className="h-4 w-4 mr-1" />
            Archive Now
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <HardDrive className="h-4 w-4 mr-1" />
            Clear STM
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}