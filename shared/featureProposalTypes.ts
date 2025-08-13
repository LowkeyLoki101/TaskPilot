// Feature Proposal System Types for Emergent Intelligence

export interface FeatureProposal {
  id: string;
  title: string;
  problemStatement: string;
  aiReasoning: string;
  proposedSolution: string;
  category: ProposalCategory;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: ProposalStatus;
  technicalSpec: TechnicalSpecification;
  estimatedImpact: ImpactAssessment;
  generatedFiles: GeneratedFile[];
  userFeedback?: UserFeedback;
  createdAt: Date;
  updatedAt: Date;
  implementedAt?: Date;
}

export enum ProposalCategory {
  NEW_TOOL = 'NEW_TOOL',
  TOOL_IMPROVEMENT = 'TOOL_IMPROVEMENT',
  PERFORMANCE_OPTIMIZATION = 'PERFORMANCE_OPTIMIZATION',
  BUG_FIX = 'BUG_FIX',
  UI_ENHANCEMENT = 'UI_ENHANCEMENT',
  WORKFLOW_AUTOMATION = 'WORKFLOW_AUTOMATION',
  INTEGRATION = 'INTEGRATION',
  SECURITY_ENHANCEMENT = 'SECURITY_ENHANCEMENT',
  DATA_MANAGEMENT = 'DATA_MANAGEMENT'
}

export enum ProposalStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  IMPLEMENTED = 'IMPLEMENTED',
  ARCHIVED = 'ARCHIVED'
}

export interface TechnicalSpecification {
  dataStructures?: DataStructureSpec[];
  apiEndpoints?: APIEndpointSpec[];
  frontendComponents?: ComponentSpec[];
  dependencies?: DependencySpec[];
  migrations?: MigrationSpec[];
  testCases?: TestCaseSpec[];
}

export interface DataStructureSpec {
  name: string;
  description: string;
  schema: any; // JSON Schema or TypeScript interface
  storageLocation: 'stm' | 'ltm' | 'both';
}

export interface APIEndpointSpec {
  path: string;
  method: string;
  description: string;
  requestSchema?: any;
  responseSchema?: any;
  authentication: boolean;
}

export interface ComponentSpec {
  name: string;
  type: 'page' | 'component' | 'hook' | 'utility';
  description: string;
  props?: any;
  state?: any;
  dependencies: string[];
}

export interface DependencySpec {
  name: string;
  version: string;
  type: 'npm' | 'system' | 'external_api';
  reason: string;
}

export interface MigrationSpec {
  version: string;
  description: string;
  up: string; // SQL or code
  down: string; // Rollback SQL or code
}

export interface TestCaseSpec {
  name: string;
  type: 'unit' | 'integration' | 'e2e';
  description: string;
  expectedBehavior: string;
}

export interface ImpactAssessment {
  timesSaved?: number; // Estimated minutes saved per use
  errorReduction?: number; // Percentage
  performanceImprovement?: number; // Percentage
  userExperienceScore?: number; // 1-10
  affectedUsers?: string[]; // User IDs or 'all'
  riskLevel: 'low' | 'medium' | 'high';
  rollbackPlan?: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: 'typescript' | 'javascript' | 'css' | 'html' | 'markdown' | 'json';
  purpose: string;
  isModification: boolean; // true if modifying existing file
  originalContent?: string; // If modification, store original
}

export interface UserFeedback {
  decision: 'approved' | 'denied' | 'needs_revision';
  reason?: FeedbackReason;
  customReason?: string;
  suggestions?: string;
  timestamp: Date;
}

export enum FeedbackReason {
  NOT_USEFUL = 'NOT_USEFUL',
  TOO_COMPLEX = 'TOO_COMPLEX',
  PERFORMANCE_CONCERNS = 'PERFORMANCE_CONCERNS',
  SECURITY_RISK = 'SECURITY_RISK',
  COST_PROHIBITIVE = 'COST_PROHIBITIVE',
  DUPLICATE_FUNCTIONALITY = 'DUPLICATE_FUNCTIONALITY',
  LOW_PRIORITY = 'LOW_PRIORITY',
  NEEDS_MORE_TESTING = 'NEEDS_MORE_TESTING'
}

export interface ProposalLearning {
  proposalId: string;
  patterns: string[]; // Identified patterns from feedback
  improvements: string[]; // Suggested improvements for future
  successFactors?: string[]; // What made it successful
  failureFactors?: string[]; // What caused denial
}

export interface ProposalMetrics {
  totalProposed: number;
  approved: number;
  denied: number;
  implemented: number;
  approvalRate: number; // Percentage
  averageReviewTime: number; // Hours
  mostCommonDenialReason?: FeedbackReason;
  categoryCounts: Record<ProposalCategory, number>;
}