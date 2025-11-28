import { TaskRunnersConfig } from '@n8n/config';
import type { BreakingChangeRuleMetadata, IBreakingChangeInstanceRule, InstanceDetectionReport } from '../../types';
export declare class TaskRunnersRule implements IBreakingChangeInstanceRule {
    private readonly taskRunnersConfig;
    constructor(taskRunnersConfig: TaskRunnersConfig);
    id: string;
    getMetadata(): BreakingChangeRuleMetadata;
    detect(): Promise<InstanceDetectionReport>;
}
