import { InstanceSettingsConfig } from '@n8n/config';
import type { BreakingChangeRuleMetadata, IBreakingChangeInstanceRule, InstanceDetectionReport } from '../../types';
export declare class SettingsFilePermissionsRule implements IBreakingChangeInstanceRule {
    private readonly instanceSettingsConfig;
    constructor(instanceSettingsConfig: InstanceSettingsConfig);
    id: string;
    getMetadata(): BreakingChangeRuleMetadata;
    detect(): Promise<InstanceDetectionReport>;
}
