import type { BreakingChangeInstanceIssue, BreakingChangeRecommendation, BreakingChangeWorkflowIssue } from '@n8n/api-types';
export interface WorkflowDetectionReport {
    isAffected: boolean;
    issues: BreakingChangeWorkflowIssue[];
}
export interface InstanceDetectionReport {
    isAffected: boolean;
    instanceIssues: BreakingChangeInstanceIssue[];
    recommendations: BreakingChangeRecommendation[];
}
