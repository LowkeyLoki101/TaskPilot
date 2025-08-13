import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Settings, 
  Zap, 
  Play, 
  Pause,
  Mic,
  QrCode,
  Image,
  FileText,
  Video,
  ShoppingCart,
  Map,
  Package
} from "lucide-react";

interface WorkstationOrgan {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'active' | 'busy' | 'error';
  lastUsed: Date | null;
  config: any;
}

interface WorkstationOrganPanelProps {
  className?: string;
}

export function WorkstationOrganPanel({ className }: WorkstationOrganPanelProps) {
  const [selectedOrgan, setSelectedOrgan] = useState<WorkstationOrgan | null>(null);
  const [showActivationDialog, setShowActivationDialog] = useState(false);

  const { data: organs = [], isLoading, refetch } = useQuery<WorkstationOrgan[]>({
    queryKey: ['/api/workstation/organs'],
  });

  const activateOrgan = async (organId: string) => {
    try {
      const response = await fetch(`/api/workstation/organs/${organId}/activate`, {
        method: 'POST',
      });
      
      if (response.ok) {
        await refetch();
      }
    } catch (error) {
      console.error('Error activating organ:', error);
    }
  };

  const triggerByVoice = async (command: string) => {
    try {
      const response = await fetch('/api/workstation/organs/voice-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      
      if (response.ok) {
        await refetch();
      }
    } catch (error) {
      console.error('Error triggering by voice:', error);
    }
  };

  const generateQR = async (organId: string) => {
    try {
      const response = await fetch(`/api/workstation/organs/${organId}/qr`);
      const data = await response.json();
      
      if (data.qrData) {
        // In real implementation, would show QR code
        console.log('QR Data:', data.qrData);
      }
    } catch (error) {
      console.error('Error generating QR:', error);
    }
  };

  const getOrganIcon = (type: string) => {
    switch (type) {
      case 'canvas-composer': return Image;
      case 'qr-lab': return QrCode;
      case 'docs-generator': return FileText;
      case 'media-player': return Video;
      case 'shopping-list': return ShoppingCart;
      case 'maps': return Map;
      case 'procurement': return Package;
      default: return Settings;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'busy': return 'secondary';
      case 'error': return 'destructive';
      case 'idle': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-8 w-8 mx-auto mb-2 animate-spin opacity-50" />
          <p className="text-sm text-muted-foreground">Loading workstation organs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border bg-background/95">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Workstation Organs</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowActivationDialog(true)}
              className="text-xs"
            >
              <Mic className="h-4 w-4 mr-1" />
              Voice
            </Button>
            <Badge variant="outline" className="text-xs">
              {organs.filter(o => o.status === 'active').length} active
            </Badge>
          </div>
        </div>
      </div>

      {/* Organ Grid */}
      <ScrollArea className="flex-1">
        <div className="p-4 grid grid-cols-2 gap-3">
          {organs.map((organ) => {
            const OrganIcon = getOrganIcon(organ.type);
            
            return (
              <Card
                key={organ.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  organ.status === 'active' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedOrgan(organ)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <OrganIcon className="h-6 w-6 text-muted-foreground" />
                    <Badge variant={getStatusColor(organ.status)} className="text-xs">
                      {organ.status}
                    </Badge>
                  </div>
                  
                  <h4 className="font-medium text-sm mb-1">{organ.name}</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    {organ.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={organ.status === 'active' ? 'secondary' : 'default'}
                      className="flex-1 text-xs h-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        activateOrgan(organ.id);
                      }}
                    >
                      {organ.status === 'active' ? (
                        <>
                          <Pause className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-6 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        generateQR(organ.id);
                      }}
                    >
                      <QrCode className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {organ.lastUsed && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Last used: {new Date(organ.lastUsed).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Voice Activation Dialog */}
      <Dialog open={showActivationDialog} onOpenChange={setShowActivationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voice Activation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Say a command to activate an organ:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { command: "Canvas", organ: "canvas-composer" },
                { command: "QR Code", organ: "qr-lab" },
                { command: "Document", organ: "docs-generator" },
                { command: "Media", organ: "media-player" },
                { command: "Shopping", organ: "shopping-list" },
                { command: "Maps", organ: "maps" },
                { command: "Procurement", organ: "procurement" }
              ].map(({ command, organ }) => (
                <Button
                  key={command}
                  variant="outline"
                  className="text-xs"
                  onClick={() => {
                    triggerByVoice(command.toLowerCase());
                    setShowActivationDialog(false);
                  }}
                >
                  "{command}"
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Organ Detail Dialog */}
      {selectedOrgan && (
        <Dialog open={!!selectedOrgan} onOpenChange={() => setSelectedOrgan(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedOrgan.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusColor(selectedOrgan.status)}>
                  {selectedOrgan.status}
                </Badge>
                <Badge variant="outline">{selectedOrgan.type}</Badge>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Configuration</h4>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(selectedOrgan.config, null, 2)}
                </pre>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => activateOrgan(selectedOrgan.id)}
                  disabled={selectedOrgan.status === 'active'}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-1" />
                  {selectedOrgan.status === 'active' ? 'Already Active' : 'Activate'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => generateQR(selectedOrgan.id)}
                >
                  <QrCode className="h-4 w-4 mr-1" />
                  Generate QR
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}