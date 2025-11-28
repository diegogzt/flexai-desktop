import type { BreakingChangeAffectedWorkflow, BreakingChangeRecommendation } from '@n8n/api-types';
import type { WorkflowEntity } from '@n8n/db';
import type { INode } from 'n8n-workflow';
import type { BreakingChangeRuleMetadata, IBreakingChangeWorkflowRule, WorkflowDetectionReport } from '../../types';
export declare class WaitNodeSubworkflowRule implements IBreakingChangeWorkflowRule {
    id: string;
    private readonly waitingNodeConfig;
    getMetadata(): BreakingChangeRuleMetadata;
    getRecommendations(_workflowResults: BreakingChangeAffectedWorkflow[]): Promise<BreakingChangeRecommendation[]>;
    private hasWaitingOperation;
    detectWorkflow(_workflow: WorkflowEntity, nodesGroupedByType: Map<string, INode[]>): Promise<WorkflowDetectionReport>;
}
