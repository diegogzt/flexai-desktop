"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrometheusMetricsParser = void 0;
class PrometheusMetricsParser {
    static extractMetricValues(metricsData, metricName) {
        const values = [];
        for (const metricsText of metricsData) {
            const lines = metricsText.split('\n');
            for (const line of lines) {
                if (line.startsWith('#') || line.trim() === '') {
                    continue;
                }
                if (line.startsWith(metricName)) {
                    const parts = line.split(/\s+/);
                    if (parts.length >= 2) {
                        const value = parseFloat(parts[parts.length - 1]);
                        if (!isNaN(value)) {
                            values.push(value);
                        }
                    }
                }
            }
        }
        return values;
    }
    static calculateMetricStats(metricsData, metricName) {
        const values = this.extractMetricValues(metricsData, metricName);
        if (values.length === 0) {
            return null;
        }
        const max = Math.max(...values);
        const min = Math.min(...values);
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        return {
            max,
            min,
            avg,
            count: values.length,
        };
    }
}
exports.PrometheusMetricsParser = PrometheusMetricsParser;
//# sourceMappingURL=prometheus-metrics-parser.js.map