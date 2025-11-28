"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppMetricsPoller = void 0;
class AppMetricsPoller {
    constructor(metricsUrl, pollIntervalMs = 5000) {
        this.metricsUrl = metricsUrl;
        this.pollIntervalMs = pollIntervalMs;
        this.intervalId = undefined;
        this.metricsData = [];
        this.isRunning = false;
        this.isStopped = false;
    }
    start() {
        if (this.isRunning) {
            throw new Error('Metrics poller is already running');
        }
        if (this.isStopped) {
            throw new Error('Metrics poller has been stopped and cannot be restarted');
        }
        this.isRunning = true;
        this.metricsData = [];
        void this.pollMetrics();
        this.intervalId = setInterval(() => {
            void this.pollMetrics();
        }, this.pollIntervalMs);
    }
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
        }
        this.isRunning = false;
        this.isStopped = true;
    }
    getMetricsData() {
        return this.metricsData;
    }
    async pollMetrics() {
        try {
            const response = await fetch(this.metricsUrl);
            if (!response.ok) {
                console.warn(`Failed to poll metrics: ${response.status} ${response.statusText}`);
                return;
            }
            const metricsText = await response.text();
            this.metricsData.push(metricsText);
        }
        catch (error) {
            console.warn(`Error polling metrics: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.AppMetricsPoller = AppMetricsPoller;
//# sourceMappingURL=app-metrics-poller.js.map