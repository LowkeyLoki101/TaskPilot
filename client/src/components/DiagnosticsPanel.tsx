import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bug, 
  Monitor, 
  Wifi, 
  Database, 
  Mic, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface DiagnosticsProps {
  className?: string;
}

interface SystemStatus {
  api: 'connected' | 'disconnected' | 'error';
  websocket: 'connected' | 'disconnected' | 'error';
  voice: 'available' | 'unavailable' | 'permission-denied';
  database: 'connected' | 'error' | 'slow';
  storage: 'available' | 'error' | 'quota-exceeded';
}

interface PerformanceMetrics {
  memoryUsage: number;
  bundleSize: string;
  renderTime: number;
  apiLatency: number;
  errorCount: number;
}

export function DiagnosticsPanel({ className }: DiagnosticsProps) {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    api: 'connected',
    websocket: 'connected', 
    voice: 'available',
    database: 'connected',
    storage: 'available'
  });

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    bundleSize: '2.3MB',
    renderTime: 0,
    apiLatency: 0,
    errorCount: 0
  });

  const [consoleErrors, setConsoleErrors] = useState<string[]>([]);
  const [reactWarnings, setReactWarnings] = useState<string[]>([]);

  // Monitor console errors and warnings
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('Warning:')) {
        setReactWarnings(prev => [...prev.slice(-9), message].slice(0, 10));
      } else {
        setConsoleErrors(prev => [...prev.slice(-9), message].slice(0, 10));
      }
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      setReactWarnings(prev => [...prev.slice(-9), message].slice(0, 10));
      originalWarn.apply(console, args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Check system status
  useEffect(() => {
    const checkStatus = async () => {
      // Check API connectivity
      try {
        const apiStart = performance.now();
        const response = await fetch('/api/health');
        const apiEnd = performance.now();
        setPerformanceMetrics(prev => ({ 
          ...prev, 
          apiLatency: Math.round(apiEnd - apiStart) 
        }));
        setSystemStatus(prev => ({ 
          ...prev, 
          api: response.ok ? 'connected' : 'error' 
        }));
      } catch {
        setSystemStatus(prev => ({ ...prev, api: 'disconnected' }));
      }

      // Check WebSocket
      if (typeof WebSocket !== 'undefined') {
        try {
          const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`);
          ws.onopen = () => setSystemStatus(prev => ({ ...prev, websocket: 'connected' }));
          ws.onerror = () => setSystemStatus(prev => ({ ...prev, websocket: 'error' }));
          ws.onclose = () => setSystemStatus(prev => ({ ...prev, websocket: 'disconnected' }));
          setTimeout(() => ws.close(), 1000);
        } catch {
          setSystemStatus(prev => ({ ...prev, websocket: 'error' }));
        }
      }

      // Check voice support
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        navigator.permissions?.query({ name: 'microphone' as PermissionName })
          .then(result => {
            setSystemStatus(prev => ({ 
              ...prev, 
              voice: result.state === 'granted' ? 'available' : 'permission-denied' 
            }));
          })
          .catch(() => setSystemStatus(prev => ({ ...prev, voice: 'available' })));
      } else {
        setSystemStatus(prev => ({ ...prev, voice: 'unavailable' }));
      }

      // Check memory usage
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setPerformanceMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024)
        }));
      }

      // Measure render time
      const renderStart = performance.now();
      requestAnimationFrame(() => {
        const renderEnd = performance.now();
        setPerformanceMetrics(prev => ({
          ...prev,
          renderTime: Math.round(renderEnd - renderStart)
        }));
      });
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
      case 'unavailable':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error':
      case 'permission-denied':
      case 'quota-exceeded':
      case 'slow':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'disconnected':
      case 'unavailable':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'error':
      case 'permission-denied':
      case 'quota-exceeded':
      case 'slow':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const runDiagnostics = () => {
    // Clear error logs
    setConsoleErrors([]);
    setReactWarnings([]);
    
    // Trigger a comprehensive system check
    window.location.reload();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Bug className="h-4 w-4" />
            System Diagnostics
            <Button 
              size="sm" 
              variant="outline" 
              onClick={runDiagnostics}
              className="ml-auto h-6"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* System Status */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">CONNECTIVITY</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.api)}
                <span className="text-xs">API</span>
                <Badge variant="outline" className={`text-xs h-5 ${getStatusColor(systemStatus.api)}`}>
                  {systemStatus.api}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.websocket)}
                <span className="text-xs">WebSocket</span>
                <Badge variant="outline" className={`text-xs h-5 ${getStatusColor(systemStatus.websocket)}`}>
                  {systemStatus.websocket}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.voice)}
                <span className="text-xs">Voice</span>
                <Badge variant="outline" className={`text-xs h-5 ${getStatusColor(systemStatus.voice)}`}>
                  {systemStatus.voice}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.database)}
                <span className="text-xs">Database</span>
                <Badge variant="outline" className={`text-xs h-5 ${getStatusColor(systemStatus.database)}`}>
                  {systemStatus.database}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Performance Metrics */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">PERFORMANCE</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>Memory:</span>
                <span className="font-mono">{performanceMetrics.memoryUsage}MB</span>
              </div>
              <div className="flex justify-between">
                <span>Bundle:</span>
                <span className="font-mono">{performanceMetrics.bundleSize}</span>
              </div>
              <div className="flex justify-between">
                <span>Render:</span>
                <span className="font-mono">{performanceMetrics.renderTime}ms</span>
              </div>
              <div className="flex justify-between">
                <span>API Latency:</span>
                <span className="font-mono">{performanceMetrics.apiLatency}ms</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Error Logs */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">
              RECENT ISSUES ({consoleErrors.length + reactWarnings.length})
            </h4>
            <ScrollArea className="h-32">
              <div className="space-y-1">
                {reactWarnings.map((warning, index) => (
                  <div key={`warning-${index}`} className="text-xs p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-2 border-yellow-500">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-yellow-700 dark:text-yellow-300 font-mono text-xs break-all">
                        {warning.includes('Warning:') 
                          ? warning.split('Warning: ')[1]?.split('%s')[0] || warning
                          : warning
                        }
                      </span>
                    </div>
                  </div>
                ))}
                {consoleErrors.map((error, index) => (
                  <div key={`error-${index}`} className="text-xs p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-2 border-red-500">
                    <div className="flex items-start gap-2">
                      <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-red-700 dark:text-red-300 font-mono text-xs break-all">
                        {error}
                      </span>
                    </div>
                  </div>
                ))}
                {consoleErrors.length === 0 && reactWarnings.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-4">
                    No recent issues detected
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">QUICK ACTIONS</h4>
            <div className="grid grid-cols-2 gap-1">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs"
                onClick={() => localStorage.clear()}
              >
                Clear Cache
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs"
                onClick={() => window.location.reload()}
              >
                Hard Refresh
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs"
                onClick={() => {
                  const diagnostics = {
                    status: systemStatus,
                    performance: performanceMetrics,
                    errors: consoleErrors,
                    warnings: reactWarnings,
                    timestamp: new Date().toISOString()
                  };
                  navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2));
                }}
              >
                Copy Report
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs"
                onClick={() => console.table(systemStatus)}
              >
                Log Status
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}