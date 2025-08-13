import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as d3 from "d3";
import { useMindMap } from "@/hooks/useMindMap";

interface MindMapProps {
  projectId: string;
  onTaskSelect: (taskId: string) => void;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  position?: { x: number; y: number };
  dueDate?: string;
}

export default function MindMap({ projectId, onTaskSelect }: MindMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const { 
    nodes, 
    links, 
    updateNodePosition, 
    addNode, 
    centerView 
  } = useMindMap(projectId);

  // Fetch tasks
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/projects", projectId, "tasks"],
  });

  useEffect(() => {
    if (!svgRef.current || tasks.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear previous content
    svg.selectAll("*").remove();

    // Create main group with zoom behavior
    const g = svg.append("g");

    // Setup zoom
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoom(event.transform.k);
      });

    svg.call(zoomBehavior);

    // Create gradients
    const defs = svg.append("defs");
    
    const connectionGradient = defs.append("linearGradient")
      .attr("id", "connectionGradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "0%");
    
    connectionGradient.append("stop")
      .attr("offset", "0%")
      .attr("style", "stop-color:hsl(243, 75%, 59%);stop-opacity:0.5");
    
    connectionGradient.append("stop")
      .attr("offset", "100%")
      .attr("style", "stop-color:hsl(262, 83%, 58%);stop-opacity:0.5");

    // Prepare data for D3
    const nodeData = [
      {
        id: "central",
        title: "Project Launch",
        description: "Q1 2024 Product Release",
        x: width / 2,
        y: height / 2,
        type: "central",
        status: "active"
      },
      ...tasks.map((task, index) => {
        // If task has no position, distribute evenly in circle
        const angle = (index * 2 * Math.PI) / tasks.length;
        const radius = 250;
        return {
          ...task,
          x: task.position?.x || (width / 2 + Math.cos(angle) * radius),
          y: task.position?.y || (height / 2 + Math.sin(angle) * radius),
          type: "task"
        };
      })
    ];

    const linkData = tasks.map(task => ({
      source: "central",
      target: task.id
    }));

    // Create force simulation
    const simulation = d3.forceSimulation(nodeData)
      .force("link", d3.forceLink(linkData).id((d: any) => d.id).distance(200))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Create links
    const links = g.selectAll(".link")
      .data(linkData)
      .enter().append("path")
      .attr("class", "link")
      .attr("stroke", "url(#connectionGradient)")
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .attr("opacity", 0.7);

    // Create nodes
    const nodes = g.selectAll(".node")
      .data(nodeData)
      .enter().append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .call(d3.drag<SVGGElement, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Central node
    nodes.filter(d => d.type === "central")
      .append("rect")
      .attr("width", 200)
      .attr("height", 100)
      .attr("x", -100)
      .attr("y", -50)
      .attr("rx", 12)
      .attr("fill", "url(#connectionGradient)")
      .attr("class", "animate-float");

    nodes.filter(d => d.type === "central")
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-10")
      .attr("fill", "white")
      .attr("font-weight", "600")
      .attr("font-size", "16")
      .text(d => d.title);

    nodes.filter(d => d.type === "central")
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "10")
      .attr("fill", "rgba(255,255,255,0.8)")
      .attr("font-size", "12")
      .text(d => d.type === "central" ? d.description : "");

    // Task nodes
    const taskNodes = nodes.filter(d => d.type === "task");

    taskNodes.append("rect")
      .attr("width", 180)
      .attr("height", 80)
      .attr("x", -90)
      .attr("y", -40)
      .attr("rx", 8)
      .attr("fill", "hsl(222, 47%, 11%)")
      .attr("stroke", "hsl(217, 33%, 17%)")
      .attr("stroke-width", 1);

    // Status indicators
    taskNodes.append("circle")
      .attr("cx", -70)
      .attr("cy", -20)
      .attr("r", 3)
      .attr("fill", d => {
        switch (d.status) {
          case "completed": return "#10B981";
          case "in-progress": return "#3B82F6";
          case "blocked": return "#EF4444";
          default: return "#F59E0B";
        }
      });

    // Task titles
    taskNodes.append("text")
      .attr("x", -60)
      .attr("y", -15)
      .attr("fill", "hsl(210, 40%, 98%)")
      .attr("font-weight", "500")
      .attr("font-size", "14")
      .text(d => d.title.length > 15 ? d.title.substring(0, 15) + "..." : d.title);

    // Due dates
    taskNodes.append("text")
      .attr("x", -60)
      .attr("y", 5)
      .attr("fill", "hsl(215, 20%, 65%)")
      .attr("font-size", "12")
      .text(d => d.type === "task" && d.dueDate ? `Due: ${new Date(d.dueDate).toLocaleDateString()}` : "No due date");

    // Priority indicators
    taskNodes.append("text")
      .attr("x", -60)
      .attr("y", 25)
      .attr("fill", d => {
        if (d.type !== "task") return "#10B981";
        switch (d.priority) {
          case "high": return "#EF4444";
          case "medium": return "#F59E0B";
          default: return "#10B981";
        }
      })
      .attr("font-size", "10")
      .attr("font-weight", "600")
      .text(d => d.type === "task" ? d.priority.toUpperCase() : "");

    // Click handlers
    taskNodes.on("click", (event, d) => {
      if (d.type === "task") {
        onTaskSelect(d.id);
      }
    });

    // Simulation tick
    simulation.on("tick", () => {
      links.attr("d", (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy);
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });

      nodes.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      
      if (d.type === "task") {
        updateNodePosition(d.id, { x: d.x, y: d.y });
      }
    }

  }, [tasks, projectId, onTaskSelect, updateNodePosition]);

  const handleZoomIn = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(
        d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
        1.5
      );
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(
        d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
        1 / 1.5
      );
    }
  };

  const handleCenterView = () => {
    centerView();
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const width = svgRef.current.clientWidth;
      const height = svgRef.current.clientHeight;
      svg.transition().call(
        d3.zoom<SVGSVGElement, unknown>().transform as any,
        d3.zoomIdentity.translate(0, 0).scale(1)
      );
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-background via-card to-background relative">
      <svg
        ref={svgRef}
        className="w-full h-full"
        data-testid="mindmap-canvas"
      />

      {/* Floating Action Buttons */}
      <div className="absolute bottom-8 right-8 space-y-3">
        <button 
          onClick={handleZoomIn}
          className="bg-card border border-border text-foreground p-3 rounded-full shadow-lg hover:bg-accent transition-colors"
          data-testid="button-zoom-in"
        >
          <i className="fas fa-plus"></i>
        </button>
        <button 
          onClick={handleZoomOut}
          className="bg-card border border-border text-foreground p-3 rounded-full shadow-lg hover:bg-accent transition-colors"
          data-testid="button-zoom-out"
        >
          <i className="fas fa-minus"></i>
        </button>
        <button 
          onClick={handleCenterView}
          className="bg-card border border-border text-foreground p-3 rounded-full shadow-lg hover:bg-accent transition-colors"
          data-testid="button-center-view"
        >
          <i className="fas fa-crosshairs"></i>
        </button>
        <button 
          onClick={() => addNode()}
          className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary-600 transition-colors"
          data-testid="button-add-node"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      {/* Minimap */}
      <div className="absolute top-4 right-4 w-24 h-16 bg-card border border-border rounded-lg overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-card to-background relative">
          <div className="absolute inset-0 bg-primary bg-opacity-20 border border-primary rounded"></div>
          <span className="absolute bottom-2 left-2 text-xs text-muted-foreground">
            Zoom: {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
