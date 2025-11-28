export declare class PrometheusMetricsParser {
    static extractMetricValues(metricsData: string[], metricName: string): number[];
    static calculateMetricStats(metricsData: string[], metricName: string): {
        max: number;
        avg: number;
        min: number;
        count: number;
    } | null;
}
