"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BreakingChangeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreakingChangeService = void 0;
const backend_common_1 = require("@n8n/backend-common");
const constants_1 = require("@n8n/constants");
const db_1 = require("@n8n/db");
const di_1 = require("@n8n/di");
const n8n_core_1 = require("n8n-core");
const breaking_changes_rule_registry_service_1 = require("./breaking-changes.rule-registry.service");
const rules_1 = require("./rules");
const constants_2 = require("../../constants");
const cache_service_1 = require("../../services/cache/cache.service");
let BreakingChangeService = BreakingChangeService_1 = class BreakingChangeService {
    constructor(ruleRegistry, workflowRepository, cacheService, logger, errorReporter) {
        this.ruleRegistry = ruleRegistry;
        this.workflowRepository = workflowRepository;
        this.cacheService = cacheService;
        this.logger = logger;
        this.errorReporter = errorReporter;
        this.batchSize = 100;
        this.ongoingDetections = new Map();
        this.logger = logger.scoped('breaking-changes');
        this.registerRules();
    }
    registerRules() {
        const rulesServices = rules_1.allRules.map((rule) => di_1.Container.get(rule));
        this.ruleRegistry.registerAll(rulesServices);
    }
    async getAllInstanceRulesResults(instanceLevelRules) {
        const instanceLevelResults = [];
        for (const rule of instanceLevelRules) {
            try {
                const ruleResult = await rule.detect();
                if (ruleResult.isAffected) {
                    instanceLevelResults.push({
                        ruleId: rule.id,
                        ruleTitle: rule.getMetadata().title,
                        ruleDescription: rule.getMetadata().description,
                        ruleSeverity: rule.getMetadata().severity,
                        ruleDocumentationUrl: rule.getMetadata().documentationUrl,
                        instanceIssues: ruleResult.instanceIssues,
                        recommendations: ruleResult.recommendations,
                    });
                }
            }
            catch (error) {
                console.log('error', error);
                this.errorReporter.error(error, { shouldBeLogged: true });
            }
        }
        return instanceLevelResults;
    }
    async getAllWorkflowRulesResults(workflowLevelRules, totalWorkflows) {
        const allAffectedWorkflowsByRule = new Map();
        const allResults = [];
        this.logger.debug('Processing workflows in batches', {
            totalWorkflows,
            batchSize: this.batchSize,
        });
        for (let skip = 0; skip < totalWorkflows; skip += this.batchSize) {
            const workflows = await this.workflowRepository.find({
                select: ['id', 'name', 'active', 'activeVersionId', 'nodes', 'updatedAt', 'statistics'],
                skip,
                take: this.batchSize,
                order: { id: 'ASC' },
                relations: {
                    statistics: true,
                },
            });
            this.logger.debug('Processing batch', {
                skip,
                workflowsInBatch: workflows.length,
            });
            for (const workflow of workflows) {
                const nodesGroupedByType = new Map();
                for (const node of workflow.nodes) {
                    if (!nodesGroupedByType.has(node.type)) {
                        nodesGroupedByType.set(node.type, []);
                    }
                    nodesGroupedByType.get(node.type).push(node);
                }
                for (const rule of workflowLevelRules) {
                    const workflowDetectionResult = await rule.detectWorkflow(workflow, nodesGroupedByType);
                    if (workflowDetectionResult.isAffected) {
                        const affectedWorkflow = {
                            id: workflow.id,
                            name: workflow.name,
                            active: !!workflow.activeVersionId,
                            issues: workflowDetectionResult.issues,
                            numberOfExecutions: workflow.statistics.reduce((acc, cur) => acc + (cur.count || 0), 0),
                            lastExecutedAt: workflow.statistics.sort((a, b) => b.latestEvent.getTime() - a.latestEvent.getTime())[0]?.latestEvent,
                            lastUpdatedAt: workflow.updatedAt,
                        };
                        if (!allAffectedWorkflowsByRule.has(rule.id)) {
                            allAffectedWorkflowsByRule.set(rule.id, [affectedWorkflow]);
                        }
                        else {
                            allAffectedWorkflowsByRule.get(rule.id).push(affectedWorkflow);
                        }
                    }
                }
            }
        }
        for (const rule of workflowLevelRules) {
            const workflowResults = allAffectedWorkflowsByRule.get(rule.id) || [];
            const isAffected = workflowResults.some((wr) => wr.issues.length > 0);
            if (isAffected) {
                allResults.push({
                    ruleId: rule.id,
                    ruleTitle: rule.getMetadata().title,
                    ruleDescription: rule.getMetadata().description,
                    ruleSeverity: rule.getMetadata().severity,
                    ruleDocumentationUrl: rule.getMetadata().documentationUrl,
                    affectedWorkflows: workflowResults,
                    recommendations: await rule.getRecommendations(workflowResults),
                });
            }
        }
        return allResults;
    }
    async refreshDetectionResults(targetVersion) {
        await this.cacheService.delete(`${BreakingChangeService_1.CACHE_KEY_PREFIX}_${targetVersion}`);
        return await this.getDetectionResults(targetVersion);
    }
    async getDetectionResults(targetVersion) {
        const existingDetection = this.ongoingDetections.get(targetVersion);
        if (existingDetection) {
            this.logger.debug('Reusing ongoing detection', { targetVersion });
            return await existingDetection;
        }
        const cacheKey = `${BreakingChangeService_1.CACHE_KEY_PREFIX}_${targetVersion}`;
        const detectionPromise = new Promise((resolve) => {
            void (async () => {
                const cachedResult = await this.cacheService.get(cacheKey);
                if (cachedResult) {
                    this.logger.debug('Using cached breaking change detection results', {
                        targetVersion,
                    });
                    return resolve(cachedResult);
                }
                const detectionResult = await this.detect(targetVersion);
                return resolve(detectionResult);
            })();
        });
        this.ongoingDetections.set(targetVersion, detectionPromise);
        try {
            const result = await detectionPromise;
            if (result.shouldCache) {
                await this.cacheService.set(cacheKey, result);
            }
            return result;
        }
        finally {
            this.ongoingDetections.delete(targetVersion);
        }
    }
    shouldCacheDetection(durationMs) {
        return durationMs > constants_1.Time.seconds.toMilliseconds * 10;
    }
    async detect(targetVersion) {
        const startTime = Date.now();
        this.logger.debug('Starting breaking change detection', { targetVersion });
        const rules = this.ruleRegistry.getRules(targetVersion);
        const workflowLevelRules = rules.filter((rule) => 'detectWorkflow' in rule);
        const instanceLevelRules = rules.filter((rule) => 'detect' in rule);
        const totalWorkflows = await this.workflowRepository.count();
        const [instanceLevelResults, workflowLevelResults] = await Promise.all([
            this.getAllInstanceRulesResults(instanceLevelRules),
            this.getAllWorkflowRulesResults(workflowLevelRules, totalWorkflows),
        ]);
        const report = this.createDetectionReport(targetVersion, instanceLevelResults, workflowLevelResults);
        const duration = Date.now() - startTime;
        this.logger.debug('Breaking change detection completed', {
            duration,
        });
        return {
            report,
            totalWorkflows,
            shouldCache: this.shouldCacheDetection(duration),
        };
    }
    async getDetectionReportForRule(ruleId) {
        const rule = this.ruleRegistry.getRule(ruleId);
        if (!rule) {
            return undefined;
        }
        if ('detectWorkflow' in rule) {
            const totalWorkflows = await this.workflowRepository.count();
            return (await this.getAllWorkflowRulesResults([rule], totalWorkflows))[0];
        }
        return (await this.getAllInstanceRulesResults([rule]))[0];
    }
    createDetectionReport(targetVersion, instanceResults, workflowResults) {
        return {
            generatedAt: new Date(),
            targetVersion,
            currentVersion: constants_2.N8N_VERSION,
            workflowResults,
            instanceResults,
        };
    }
};
exports.BreakingChangeService = BreakingChangeService;
BreakingChangeService.CACHE_KEY_PREFIX = 'breaking-changes:results:';
exports.BreakingChangeService = BreakingChangeService = BreakingChangeService_1 = __decorate([
    (0, di_1.Service)(),
    __metadata("design:paramtypes", [breaking_changes_rule_registry_service_1.RuleRegistry,
        db_1.WorkflowRepository,
        cache_service_1.CacheService,
        backend_common_1.Logger,
        n8n_core_1.ErrorReporter])
], BreakingChangeService);
//# sourceMappingURL=breaking-changes.service.js.map