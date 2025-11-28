export declare class AppMetricsPoller {
    private readonly metricsUrl;
    private readonly pollIntervalMs;
    private intervalId;
    private metricsData;
    private isRunning;
    private isStopped;
    constructor(metricsUrl: string, pollIntervalMs?: number);
    start(): void;
    stop(): void;
    getMetricsData(): string[];
    private pollMetrics;
}
