import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  Plus, 
  Brain, 
  Target, 
  Zap,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MindMapFeatureCreatorProps {
  onFeatureCreate?: (feature: {
    title: string;
    description: string;
    category: string;
    priority: string;
    tags: string[];
  }) => void;
  className?: string;
}

export function MindMapFeatureCreator({ onFeatureCreate, className }: MindMapFeatureCreatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("ui");
  const [priority, setPriority] = useState("medium");
  const [tags, setTags] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and description for the feature request.",
        variant: "destructive"
      });
      return;
    }

    const featureData = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    try {
      const response = await fetch('/api/feature-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...featureData,
          requestedBy: 'User',
          efficiency: {
            currentMethod: "Manual process",
            proposedMethod: featureData.description,
            reasoning: "User-requested feature enhancement",
            expectedImprovement: "Improved workflow efficiency"
          },
          notes: "Created via Mind Map feature creator"
        })
      });

      if (response.ok) {
        toast({
          title: "Feature Request Created",
          description: `"${title}" has been added to the feature requests.`
        });
        
        // Reset form
        setTitle("");
        setDescription("");
        setTags("");
        setIsExpanded(false);
        
        // Notify parent component
        onFeatureCreate?.(featureData);
      } else {
        throw new Error('Failed to create feature request');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create feature request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const categories = [
    { value: "ui", label: "UI/UX", icon: "🎨" },
    { value: "efficiency", label: "Efficiency", icon: "⚡" },
    { value: "integration", label: "Integration", icon: "🔗" },
    { value: "workstation-organ", label: "Workstation", icon: "🛠️" },
    { value: "maintenance", label: "Maintenance", icon: "🔧" },
    { value: "other", label: "Other", icon: "📝" }
  ];

  const priorities = [
    { value: "low", label: "Low", color: "bg-blue-100 text-blue-800" },
    { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
    { value: "critical", label: "Critical", color: "bg-red-100 text-red-800" }
  ];

  return (
    <Card className={`border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Create Feature from Mind Map</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
            data-testid="toggle-feature-creator"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        {!isExpanded && (
          <p className="text-sm text-muted-foreground">
            Transform your mind map ideas into feature requests
          </p>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Feature Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Enhanced task visualization in mind map"
                className="text-sm"
                data-testid="feature-title-input"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the feature, its benefits, and how it should work..."
                className="text-sm min-h-[80px]"
                data-testid="feature-description-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border border-input rounded-md text-sm bg-background"
                  data-testid="feature-category-select"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full p-2 border border-input rounded-md text-sm bg-background"
                  data-testid="feature-priority-select"
                >
                  {priorities.map((pri) => (
                    <option key={pri.value} value={pri.value}>
                      {pri.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., mindmap, visualization, productivity"
                className="text-sm"
                data-testid="feature-tags-input"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button 
                type="submit" 
                size="sm" 
                className="flex-1"
                data-testid="submit-feature-request"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Feature Request
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setIsExpanded(false)}
                data-testid="cancel-feature-request"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      )}
    </Card>
  );
}