"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAppMetricsReport = buildAppMetricsReport;
exports.buildTestReport = buildTestReport;
const nanoid_1 = require("nanoid");
const prometheus_metrics_parser_1 = require("../test-execution/prometheus-metrics-parser");
function k6CheckToCheck(check) {
    return {
        name: check.name,
        passes: check.passes,
        fails: check.fails,
    };
}
function k6CounterToCounter(counter) {
    return {
        type: 'counter',
        count: counter.values.count,
        rate: counter.values.rate,
    };
}
function k6TrendToTrend(trend) {
    return {
        type: 'trend',
        'p(90)': trend.values['p(90)'],
        avg: trend.values.avg,
        min: trend.values.min,
        med: trend.values.med,
        max: trend.values.max,
        'p(95)': trend.values['p(95)'],
    };
}
function buildAppMetricsReport(metricsData) {
    const heapSizeTotal = prometheus_metrics_parser_1.PrometheusMetricsParser.calculateMetricStats(metricsData, 'n8n_nodejs_heap_size_total_bytes');
    const heapSizeUsed = prometheus_metrics_parser_1.PrometheusMetricsParser.calculateMetricStats(metricsData, 'n8n_nodejs_heap_size_used_bytes');
    const externalMemory = prometheus_metrics_parser_1.PrometheusMetricsParser.calculateMetricStats(metricsData, 'n8n_nodejs_external_memory_bytes');
    const eventLoopLag = prometheus_metrics_parser_1.PrometheusMetricsParser.calculateMetricStats(metricsData, 'n8n_nodejs_eventloop_lag_seconds');
    return {
        ...(heapSizeTotal && { heapSizeTotal }),
        ...(heapSizeUsed && { heapSizeUsed }),
        ...(externalMemory && { externalMemory }),
        ...(eventLoopLag && { eventLoopLag }),
    };
}
function buildTestReport(scenario, endOfTestSummary, tags, appMetricsData) {
    const appMetrics = appMetricsData ? buildAppMetricsReport(appMetricsData) : undefined;
    return {
        runId: (0, nanoid_1.nanoid)(),
        ts: new Date().toISOString(),
        scenarioName: scenario.name,
        tags,
        checks: endOfTestSummary.root_group.checks.map(k6CheckToCheck),
        metrics: {
            dataReceived: k6CounterToCounter(endOfTestSummary.metrics.data_received),
            dataSent: k6CounterToCounter(endOfTestSummary.metrics.data_sent),
            httpRequests: k6CounterToCounter(endOfTestSummary.metrics.http_reqs),
            httpRequestDuration: k6TrendToTrend(endOfTestSummary.metrics.http_req_duration),
            httpRequestSending: k6TrendToTrend(endOfTestSummary.metrics.http_req_sending),
            httpRequestReceiving: k6TrendToTrend(endOfTestSummary.metrics.http_req_receiving),
            httpRequestWaiting: k6TrendToTrend(endOfTestSummary.metrics.http_req_waiting),
            iterations: k6CounterToCounter(endOfTestSummary.metrics.iterations),
        },
        ...(appMetrics && { appMetrics }),
    };
}
//# sourceMappingURL=test-report.js.map