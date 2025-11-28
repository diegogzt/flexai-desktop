import { Relation } from '@n8n/typeorm';
import { WithCreatedAt } from './abstract-entity';
import type { WorkflowEntity } from './workflow-entity';
export type DependencyType = 'credentialId' | 'nodeType' | 'webhookPath' | 'workflowCall';
export declare class WorkflowDependency extends WithCreatedAt {
    id: number;
    workflowId: string;
    workflowVersionId: number;
    dependencyType: DependencyType;
    dependencyKey: string;
    dependencyInfo: Record<string, unknown> | null;
    indexVersionId: number;
    workflow: Relation<WorkflowEntity>;
}
