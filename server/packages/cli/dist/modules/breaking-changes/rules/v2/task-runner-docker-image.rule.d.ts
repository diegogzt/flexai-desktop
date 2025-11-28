import type { BreakingChangeRuleMetadata, IBreakingChangeInstanceRule, InstanceDetectionReport } from '../../types';
export declare class TaskRunnerDockerImageRule implements IBreakingChangeInstanceRule {
    id: string;
    getMetadata(): BreakingChangeRuleMetadata;
    detect(): Promise<InstanceDetectionReport>;
}
