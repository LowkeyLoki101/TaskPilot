import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  Lightbulb, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowUp, 
  ArrowRight,
  Bot,
  User,
  Settings,
  Zap,
  Target,
  Tag
} from "lucide-react";

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  requestedBy: 'AI' | 'User';
  category: 'workstation-organ' | 'efficiency' | 'integration' | 'ui' | 'maintenance' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'implemented' | 'testing';
  tags: string[];
  efficiency: {
    currentMethod: string;
    proposedMethod: string;
    reasoning: string;
    expectedImprovement: string;
  };
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface FeatureRequestPanelProps {
  className?: string;
}

export function FeatureRequestPanel({ className }: FeatureRequestPanelProps) {
  const [selectedRequest, setSelectedRequest] = useState<FeatureRequest | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: featureRequests = [], isLoading, refetch } = useQuery<FeatureRequest[]>({
    queryKey: ['/api/feature-requests'],
  });

  const approveRequest = async (id: string) => {
    try {
      const response = await fetch(`/api/feature-requests/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: approvalNotes })
      });
      
      if (response.ok) {
        await refetch();
        setSelectedRequest(null);
        setApprovalNotes("");
      }
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const rejectRequest = async (id: string) => {
    try {
      const response = await fetch(`/api/feature-requests/${id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason })
      });
      
      if (response.ok) {
        await refetch();
        setSelectedRequest(null);
        setRejectionReason("");
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'outline';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'implemented': return 'secondary';
      case 'testing': return 'secondary';
      default: return 'outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'workstation-organ': return Settings;
      case 'efficiency': return Zap;
      case 'integration': return Target;
      case 'ui': return ArrowRight;
      case 'maintenance': return CheckCircle;
      default: return Lightbulb;
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Lightbulb className="h-8 w-8 mx-auto mb-2 animate-pulse opacity-50" />
          <p className="text-sm text-muted-foreground">Loading feature requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-border bg-background/95 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h3 className="font-medium text-sm">Feature Requests</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {featureRequests.filter(r => r.status === 'pending').length} pending
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex min-h-0">
        {/* Request List */}
        <div className="w-1/2 border-r border-border flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {featureRequests.map((request) => {
                const CategoryIcon = getCategoryIcon(request.category);
                
                return (
                  <Card 
                    key={request.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedRequest?.id === request.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedRequest(request)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {request.requestedBy === 'AI' ? (
                            <Bot className="h-4 w-4 text-blue-500" />
                          ) : (
                            <User className="h-4 w-4 text-green-500" />
                          )}
                          <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center space-x-1">
                          <Badge variant={getPriorityColor(request.priority)} className="text-xs">
                            {request.priority}
                          </Badge>
                          <Badge variant={getStatusColor(request.status)} className="text-xs">
                            {request.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <h4 className="font-medium text-sm mb-1">{request.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {request.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {request.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                              {tag}
                            </Badge>
                          ))}
                          {request.tags.length > 2 && (
                            <span className="text-xs text-muted-foreground">+{request.tags.length - 2}</span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Request Detail */}
        <div className="w-1/2 flex flex-col">
          {selectedRequest ? (
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{selectedRequest.title}</h3>
                    <div className="flex items-center space-x-1">
                      {selectedRequest.requestedBy === 'AI' ? (
                        <Bot className="h-4 w-4 text-blue-500" />
                      ) : (
                        <User className="h-4 w-4 text-green-500" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {selectedRequest.requestedBy}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge variant={getPriorityColor(selectedRequest.priority)}>
                      {selectedRequest.priority}
                    </Badge>
                    <Badge variant={getStatusColor(selectedRequest.status)}>
                      {selectedRequest.status}
                    </Badge>
                    <Badge variant="outline">{selectedRequest.category}</Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedRequest.description}
                  </p>
                </div>

                {/* Efficiency Analysis */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <Zap className="h-4 w-4 mr-1" />
                      Efficiency Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div>
                      <strong>Current Method:</strong>
                      <p className="text-muted-foreground">{selectedRequest.efficiency.currentMethod}</p>
                    </div>
                    <div>
                      <strong>Proposed Method:</strong>
                      <p className="text-muted-foreground">{selectedRequest.efficiency.proposedMethod}</p>
                    </div>
                    <div>
                      <strong>Reasoning:</strong>
                      <p className="text-muted-foreground">{selectedRequest.efficiency.reasoning}</p>
                    </div>
                    <div>
                      <strong>Expected Improvement:</strong>
                      <p className="text-muted-foreground">{selectedRequest.efficiency.expectedImprovement}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Tags */}
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedRequest.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedRequest.notes && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedRequest.notes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {selectedRequest.status === 'pending' && (
                  <div className="space-y-3 pt-4 border-t">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Approval Notes</label>
                      <Textarea
                        placeholder="Add notes for approval..."
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        className="min-h-20"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Rejection Reason</label>
                      <Textarea
                        placeholder="Reason for rejection..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="min-h-20"
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => approveRequest(selectedRequest.id)}
                        className="flex-1"
                        variant="default"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => rejectRequest(selectedRequest.id)}
                        className="flex-1"
                        variant="destructive"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a feature request to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}