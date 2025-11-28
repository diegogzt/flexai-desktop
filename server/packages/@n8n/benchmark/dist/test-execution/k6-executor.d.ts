import { type K6Tag } from '../test-execution/test-report';
import type { Scenario } from '../types/scenario';
export type { K6Tag };
export type K6ExecutorOpts = {
    k6ExecutablePath: string;
    vus: number;
    duration: string;
    k6Out?: string;
    k6ApiToken?: string;
    n8nApiBaseUrl: string;
    tags?: K6Tag[];
    resultsWebhook?: {
        url: string;
        authHeader: string;
    };
    appMetricsPolling?: {
        enabled: boolean;
        intervalMs?: number;
    };
};
export type K6RunOpts = {
    scenarioRunName: string;
};
export declare class K6Executor {
    private readonly opts;
    private readonly handleSummaryScript;
    constructor(opts: K6ExecutorOpts);
    executeTestScenario(scenario: Scenario, { scenarioRunName }: K6RunOpts): Promise<void>;
    sendTestReport(testReport: unknown): Promise<void>;
    private augmentSummaryScript;
    private loadEndOfTestSummary;
    private resolveK6ExecutablePath;
}
