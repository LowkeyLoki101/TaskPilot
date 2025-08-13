// Feature Proposals Component - AI-generated feature suggestions with approval/denial interface
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Lightbulb, 
  CheckCircle, 
  XCircle, 
  Code, 
  Brain, 
  Zap,
  FileCode,
  AlertTriangle,
  TrendingUp,
  Clock
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface FeatureProposal {
  id: string;
  title: string;
  problemStatement: string;
  aiReasoning: string;
  proposedSolution: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'draft' | 'pending_review' | 'approved' | 'denied' | 'implemented';
  technicalSpec: any;
  estimatedImpact: any;
  generatedFiles: any;
  userFeedback?: any;
  createdAt: string;
  updatedAt: string;
  implementedAt?: string;
}

const priorityColors = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

const statusIcons = {
  draft: <FileCode className="h-4 w-4" />,
  pending_review: <Clock className="h-4 w-4" />,
  approved: <CheckCircle className="h-4 w-4 text-green-500" />,
  denied: <XCircle className="h-4 w-4 text-red-500" />,
  implemented: <Zap className="h-4 w-4 text-blue-500" />,
};

const categoryIcons = {
  NEW_TOOL: <Lightbulb className="h-4 w-4" />,
  TOOL_IMPROVEMENT: <TrendingUp className="h-4 w-4" />,
  PERFORMANCE_OPTIMIZATION: <Zap className="h-4 w-4" />,
  BUG_FIX: <AlertTriangle className="h-4 w-4" />,
  UI_ENHANCEMENT: <Code className="h-4 w-4" />,
  WORKFLOW_AUTOMATION: <Brain className="h-4 w-4" />,
};

export function FeatureProposals() {
  const [selectedProposal, setSelectedProposal] = useState<FeatureProposal | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackReason, setFeedbackReason] = useState('');
  const [customFeedback, setCustomFeedback] = useState('');
  const [currentDecision, setCurrentDecision] = useState<'approved' | 'denied' | null>(null);
  const { toast } = useToast();

  // Fetch feature proposals
  const { data: proposals = [], isLoading } = useQuery<FeatureProposal[]>({
    queryKey: ['/api/feature-proposals'],
  });

  // Mutation for updating proposal status
  const updateProposal = useMutation({
    mutationFn: async ({ id, decision, feedback }: any) => {
      return apiRequest('POST', `/api/feature-proposals/${id}/feedback`, { decision, feedback });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feature-proposals'] });
      toast({
        title: 'Feedback Submitted',
        description: `Proposal has been ${currentDecision}`,
      });
      setFeedbackDialogOpen(false);
      setSelectedProposal(null);
    },
  });

  const handleDecision = (proposal: FeatureProposal, decision: 'approved' | 'denied') => {
    setSelectedProposal(proposal);
    setCurrentDecision(decision);
    if (decision === 'denied') {
      setFeedbackDialogOpen(true);
    } else {
      // Direct approval
      updateProposal.mutate({
        id: proposal.id,
        decision: 'approved',
        feedback: { decision: 'approved' },
      });
    }
  };

  const submitFeedback = () => {
    if (!selectedProposal || !currentDecision) return;

    const feedback = {
      decision: currentDecision,
      reason: feedbackReason,
      customReason: customFeedback,
      suggestions: customFeedback,
    };

    updateProposal.mutate({
      id: selectedProposal.id,
      decision: currentDecision,
      feedback,
    });
  };

  // Group proposals by status
  const pendingProposals = proposals.filter(p => p.status === 'pending_review' || p.status === 'draft');
  const approvedProposals = proposals.filter(p => p.status === 'approved');
  const deniedProposals = proposals.filter(p => p.status === 'denied');
  const implementedProposals = proposals.filter(p => p.status === 'implemented');

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Feature Proposals
          </CardTitle>
          <CardDescription>
            AI-generated improvements and features for review
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <Tabs defaultValue="pending" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">
                Pending ({pendingProposals.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({approvedProposals.length})
              </TabsTrigger>
              <TabsTrigger value="denied">
                Denied ({deniedProposals.length})
              </TabsTrigger>
              <TabsTrigger value="implemented">
                Implemented ({implementedProposals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="flex-1 overflow-hidden">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {pendingProposals.map((proposal) => (
                    <ProposalCard
                      key={proposal.id}
                      proposal={proposal}
                      onApprove={() => handleDecision(proposal, 'approved')}
                      onDeny={() => handleDecision(proposal, 'denied')}
                      showActions
                    />
                  ))}
                  {pendingProposals.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending proposals
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="approved" className="flex-1 overflow-hidden">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {approvedProposals.map((proposal) => (
                    <ProposalCard key={proposal.id} proposal={proposal} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="denied" className="flex-1 overflow-hidden">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {deniedProposals.map((proposal) => (
                    <ProposalCard key={proposal.id} proposal={proposal} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="implemented" className="flex-1 overflow-hidden">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {implementedProposals.map((proposal) => (
                    <ProposalCard key={proposal.id} proposal={proposal} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Feedback Dialog */}
      <AlertDialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Provide Feedback</AlertDialogTitle>
            <AlertDialogDescription>
              Help the AI learn by explaining why this proposal was denied
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for Denial</Label>
              <Select value={feedbackReason} onValueChange={setFeedbackReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOT_USEFUL">Not useful enough</SelectItem>
                  <SelectItem value="TOO_COMPLEX">Too complex</SelectItem>
                  <SelectItem value="PERFORMANCE_CONCERNS">Performance concerns</SelectItem>
                  <SelectItem value="SECURITY_RISK">Security risk</SelectItem>
                  <SelectItem value="LOW_PRIORITY">Low priority</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Additional Comments (Optional)</Label>
              <Textarea
                value={customFeedback}
                onChange={(e) => setCustomFeedback(e.target.value)}
                placeholder="Provide specific feedback to help improve future proposals..."
                rows={4}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={submitFeedback}>
              Submit Feedback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Individual Proposal Card Component
function ProposalCard({ 
  proposal, 
  onApprove, 
  onDeny,
  showActions = false 
}: { 
  proposal: FeatureProposal;
  onApprove?: () => void;
  onDeny?: () => void;
  showActions?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {categoryIcons[proposal.category as keyof typeof categoryIcons]}
              {proposal.title}
            </CardTitle>
            <CardDescription className="text-xs">
              {proposal.problemStatement}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${priorityColors[proposal.priority]} text-white`}
            >
              {proposal.priority}
            </Badge>
            {statusIcons[proposal.status]}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold mb-1">AI Reasoning</h4>
              <p className="text-xs text-muted-foreground">{proposal.aiReasoning}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-1">Proposed Solution</h4>
              <p className="text-xs text-muted-foreground">{proposal.proposedSolution}</p>
            </div>

            {proposal.estimatedImpact && (
              <div>
                <h4 className="text-sm font-semibold mb-1">Estimated Impact</h4>
                <div className="flex gap-4 text-xs">
                  {proposal.estimatedImpact.timesSaved && (
                    <span>⏱️ {proposal.estimatedImpact.timesSaved} min saved</span>
                  )}
                  {proposal.estimatedImpact.errorReduction && (
                    <span>🛡️ {proposal.estimatedImpact.errorReduction}% fewer errors</span>
                  )}
                  {proposal.estimatedImpact.performanceImprovement && (
                    <span>⚡ {proposal.estimatedImpact.performanceImprovement}% faster</span>
                  )}
                </div>
              </div>
            )}

            {proposal.generatedFiles && proposal.generatedFiles.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-1">Generated Files</h4>
                <div className="space-y-1">
                  {proposal.generatedFiles.map((file: any, idx: number) => (
                    <div key={idx} className="text-xs flex items-center gap-1">
                      <FileCode className="h-3 w-3" />
                      <span className="font-mono">{file.path}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showActions && (
              <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="default"
                  onClick={onApprove}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onDeny}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Deny
                </Button>
              </div>
            )}

            {proposal.userFeedback && (
              <div className="border-t pt-2">
                <h4 className="text-sm font-semibold mb-1">User Feedback</h4>
                <p className="text-xs text-muted-foreground">
                  {proposal.userFeedback.customReason || proposal.userFeedback.reason}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}