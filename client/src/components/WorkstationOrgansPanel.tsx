import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Palette, 
  QrCode, 
  FileText, 
  Play,
  ShoppingCart,
  Map,
  Package,
  Plus,
  Settings,
  Zap,
  Mic,
  Search,
  Eye,
  EyeOff
} from "lucide-react";

interface WorkstationOrgan {
  id: string;
  name: string;
  type: 'canvas' | 'qr_lab' | 'docs' | 'media_player' | 'shopping_list' | 'maps' | 'procurement';
  description?: string;
  icon?: string;
  config: any;
  shortcuts: any;
  status: 'active' | 'inactive' | 'maintenance';
  usage_count: number;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkstationOrgansPanelProps {
  className?: string;
  projectId?: string;
}

export function WorkstationOrgansPanel({ className, projectId }: WorkstationOrgansPanelProps) {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const queryClient = useQueryClient();

  const { data: organs = [], isLoading } = useQuery<WorkstationOrgan[]>({
    queryKey: ['/api/workstation-organs', projectId],
  });

  const createOrgan = useMutation({
    mutationFn: async (organData: Partial<WorkstationOrgan>) => {
      const response = await fetch('/api/workstation-organs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...organData, projectId }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workstation-organs'] });
      setShowCreateForm(false);
    },
  });

  const filteredOrgans = organs.filter(organ => {
    const matchesFilter = filter === 'all' || organ.type === filter;
    const matchesSearch = searchTerm === '' || 
      organ.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      organ.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getOrganIcon = (type: string) => {
    switch (type) {
      case 'canvas': return <Palette className="h-5 w-5 text-purple-500" />;
      case 'qr_lab': return <QrCode className="h-5 w-5 text-blue-500" />;
      case 'docs': return <FileText className="h-5 w-5 text-green-500" />;
      case 'media_player': return <Play className="h-5 w-5 text-red-500" />;
      case 'shopping_list': return <ShoppingCart className="h-5 w-5 text-orange-500" />;
      case 'maps': return <Map className="h-5 w-5 text-teal-500" />;
      case 'procurement': return <Package className="h-5 w-5 text-indigo-500" />;
      default: return <Settings className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'inactive': return 'text-gray-500';
      case 'maintenance': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  // Initialize default organs if none exist
  const initializeDefaultOrgans = async () => {
    const defaultOrgans = [
      {
        name: 'Canvas/Composer',
        type: 'canvas' as const,
        description: 'Image editing and visual content creation workspace',
        config: { tools: ['brush', 'text', 'shapes'], canvas_size: '1920x1080' },
        shortcuts: { voice: ['create image', 'open canvas'], qr: 'canvas_trigger' },
        status: 'active' as const
      },
      {
        name: 'QR Lab',
        type: 'qr_lab' as const,
        description: 'Branded QR code generation with customization',
        config: { branding: true, analytics: true, custom_domains: [] },
        shortcuts: { voice: ['generate qr', 'qr code'], qr: 'qr_lab_trigger' },
        status: 'active' as const
      },
      {
        name: 'Docs Generator',
        type: 'docs' as const,
        description: 'Brief and script generation for documents',
        config: { templates: ['brief', 'script', 'report'], ai_assist: true },
        shortcuts: { voice: ['create document', 'generate brief'], qr: 'docs_trigger' },
        status: 'active' as const
      },
      {
        name: 'Media Player',
        type: 'media_player' as const,
        description: 'YouTube integration with synchronized checklists',
        config: { youtube_api: true, playlist_sync: true, checklist_integration: true },
        shortcuts: { voice: ['play video', 'youtube search'], qr: 'media_trigger' },
        status: 'active' as const
      },
      {
        name: 'Shopping List',
        type: 'shopping_list' as const,
        description: 'Interactive shopping with cart links and checkboxes',
        config: { cart_links: [], price_tracking: true, categories: [] },
        shortcuts: { voice: ['add to cart', 'shopping list'], qr: 'shopping_trigger' },
        status: 'active' as const
      },
      {
        name: 'Maps Integration',
        type: 'maps' as const,
        description: 'Directions and location-based services',
        config: { maps_api: true, directions: true, saved_locations: [] },
        shortcuts: { voice: ['get directions', 'find location'], qr: 'maps_trigger' },
        status: 'active' as const
      },
      {
        name: 'Procurement Hub',
        type: 'procurement' as const,
        description: 'Multi-vendor tracking and procurement management',
        config: { vendors: [], tracking: true, budget_alerts: true },
        shortcuts: { voice: ['track order', 'procurement'], qr: 'procurement_trigger' },
        status: 'active' as const
      }
    ];

    for (const organ of defaultOrgans) {
      await createOrgan.mutateAsync(organ);
    }
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Workstation Organs</h2>
            <Badge variant="outline" className="text-xs">
              {organs.filter(o => o.status === 'active').length} active
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => organs.length === 0 ? initializeDefaultOrgans() : setShowCreateForm(true)}
              size="sm"
              data-testid="create-workstation-organ"
            >
              <Plus className="h-3 w-3 mr-1" />
              {organs.length === 0 ? 'Initialize' : 'New Organ'}
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search organs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="canvas">Canvas</SelectItem>
              <SelectItem value="qr_lab">QR Lab</SelectItem>
              <SelectItem value="docs">Docs</SelectItem>
              <SelectItem value="media_player">Media</SelectItem>
              <SelectItem value="shopping_list">Shopping</SelectItem>
              <SelectItem value="maps">Maps</SelectItem>
              <SelectItem value="procurement">Procurement</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Organs Grid */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <Zap className="h-8 w-8 mx-auto mb-2 animate-pulse opacity-50" />
              <p className="text-sm text-muted-foreground">Loading workstation organs...</p>
            </div>
          ) : organs.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground mb-4">
                No workstation organs found. Initialize the default set to get started.
              </p>
              <Button onClick={initializeDefaultOrgans} disabled={createOrgan.isPending}>
                <Plus className="h-4 w-4 mr-2" />
                Initialize Default Organs
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOrgans.map((organ) => (
                <Card key={organ.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getOrganIcon(organ.type)}
                        <CardTitle className="text-sm">{organ.name}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={organ.status === 'active' ? 'default' : 'secondary'}
                          className={`text-xs ${getStatusColor(organ.status)}`}
                        >
                          {organ.status === 'active' ? <Eye className="h-2 w-2 mr-1" /> : <EyeOff className="h-2 w-2 mr-1" />}
                          {organ.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {organ.usage_count} uses
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-3">
                      {organ.description}
                    </p>

                    {/* Voice Shortcuts */}
                    {organ.shortcuts?.voice && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 mb-1">
                          <Mic className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Voice Commands:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {organ.shortcuts.voice.map((cmd: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              "{cmd}"
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* QR Triggers */}
                    {organ.shortcuts?.qr && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 mb-1">
                          <QrCode className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">QR Trigger:</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {organ.shortcuts.qr}
                        </Badge>
                      </div>
                    )}

                    {/* Configuration Preview */}
                    {organ.config && Object.keys(organ.config).length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <strong>Config:</strong> {Object.keys(organ.config).slice(0, 2).join(', ')}
                        {Object.keys(organ.config).length > 2 && '...'}
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="mt-3 pt-3 border-t border-border">
                      <Button size="sm" variant="outline" className="w-full h-7 text-xs">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}