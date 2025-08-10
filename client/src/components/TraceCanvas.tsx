import React, { useMemo, useCallback } from "react";
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Node, 
  Edge,
  Handle,
  Position,
  NodeProps
} from "reactflow";
import "reactflow/dist/style.css";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlowScript, FlowNode as FlowScriptNode } from "@shared/flowscript";
import { 
  User, 
  Cpu, 
  Brain, 
  Settings, 
  MousePointer, 
  Globe, 
  GitBranch, 
  BarChart3, 
  Clock, 
  Layers 
} from "lucide-react";

// Custom node component for workflow steps
function StepNode({ data, selected }: NodeProps) {
  const getActorIcon = (actor: string) => {
    switch (actor) {
      case "user": return <User className="h-4 w-4" />;
      case "app": return <Cpu className="h-4 w-4" />;
      case "ai": return <Brain className="h-4 w-4" />;
      case "system": return <Settings className="h-4 w-4" />;
      default: return <MousePointer className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ui_action": return <MousePointer className="h-3 w-3" />;
      case "api_call": return <Globe className="h-3 w-3" />;
      case "decision": return <GitBranch className="h-3 w-3" />;
      case "analysis": return <BarChart3 className="h-3 w-3" />;
      case "wait": return <Clock className="h-3 w-3" />;
      case "background": return <Layers className="h-3 w-3" />;
      default: return <MousePointer className="h-3 w-3" />;
    }
  };

  const getActorColor = (actor: string) => {
    switch (actor) {
      case "user": return "bg-blue-600";
      case "app": return "bg-green-600";
      case "ai": return "bg-purple-600";
      case "system": return "bg-gray-600";
      default: return "bg-slate-600";
    }
  };

  return (
    <Card className={`min-w-[280px] transition-all ${selected ? 'ring-2 ring-primary' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg text-white ${getActorColor(data.actor)}`}>
                {getActorIcon(data.actor)}
              </div>
              <div>
                <h3 className="font-medium text-sm leading-tight">{data.label}</h3>
                <div className="flex items-center gap-1 mt-1">
                  {getTypeIcon(data.type)}
                  <span className="text-xs text-muted-foreground">{data.type}</span>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {data.actor}
            </Badge>
          </div>

          {/* Tool info */}
          {data.tool && (
            <div className="text-xs">
              <span className="text-muted-foreground">Tool:</span>
              <span className="ml-1 font-mono bg-muted px-1 rounded">{data.tool}</span>
            </div>
          )}

          {/* Conditions */}
          {(data.pre || data.post) && (
            <div className="space-y-1 text-xs">
              {data.pre && Object.keys(data.pre).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-muted-foreground">Pre:</span>
                  {Object.keys(data.pre).map(key => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key}
                    </Badge>
                  ))}
                </div>
              )}
              {data.post && Object.keys(data.post).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-muted-foreground">Post:</span>
                  {Object.keys(data.post).map(key => (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Errors */}
          {data.errors && data.errors.length > 0 && (
            <div className="text-xs">
              <span className="text-destructive">Errors:</span>
              <span className="ml-1">{data.errors.length} possible</span>
            </div>
          )}
        </div>
      </CardContent>
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
}

const nodeTypes = {
  stepNode: StepNode,
};

interface TraceCanvasProps {
  flow: FlowScript;
  onSelectNode?: (nodeId: string) => void;
  selectedNodeId?: string;
  className?: string;
}

export function TraceCanvas({ flow, onSelectNode, selectedNodeId, className }: TraceCanvasProps) {
  const nodes = useMemo((): Node[] => {
    return flow.nodes.map((node, index) => ({
      id: node.id,
      type: "stepNode",
      position: node.position || { 
        x: (index % 4) * 320, 
        y: Math.floor(index / 4) * 200 
      },
      data: node,
      selected: node.id === selectedNodeId
    }));
  }, [flow.nodes, selectedNodeId]);

  const edges = useMemo((): Edge[] => {
    return flow.edges.map(edge => ({
      id: `${edge.from}-${edge.to}`,
      source: edge.from,
      target: edge.to,
      label: edge.when || edge.label,
      style: { stroke: '#8b5cf6' },
      labelStyle: { fontSize: 10, fontWeight: 600 }
    }));
  }, [flow.edges]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    onSelectNode?.(node.id);
  }, [onSelectNode]);

  return (
    <div className={`h-full w-full ${className}`} data-testid="trace-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        className="bg-background"
      >
        <Background color="#374151" gap={20} />
        <MiniMap 
          pannable 
          zoomable 
          className="bg-card border border-border"
          nodeColor="#6366f1"
        />
        <Controls className="bg-card border border-border" />
      </ReactFlow>
    </div>
  );
}