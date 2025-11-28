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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AiWorkflowBuilderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiWorkflowBuilderService = void 0;
const messages_1 = require("@langchain/core/messages");
const tracer_langchain_1 = require("@langchain/core/tracers/tracer_langchain");
const backend_common_1 = require("@n8n/backend-common");
const di_1 = require("@n8n/di");
const ai_assistant_sdk_1 = require("@n8n_io/ai-assistant-sdk");
const assert_1 = __importDefault(require("assert"));
const langsmith_1 = require("langsmith");
const errors_1 = require("./errors");
const llm_config_1 = require("./llm-config");
const session_manager_service_1 = require("./session-manager.service");
const workflow_builder_agent_1 = require("./workflow-builder-agent");
let AiWorkflowBuilderService = AiWorkflowBuilderService_1 = class AiWorkflowBuilderService {
    client;
    logger;
    instanceId;
    instanceUrl;
    onCreditsUpdated;
    onTelemetryEvent;
    parsedNodeTypes;
    sessionManager;
    constructor(parsedNodeTypes, client, logger, instanceId, instanceUrl, onCreditsUpdated, onTelemetryEvent) {
        this.client = client;
        this.logger = logger;
        this.instanceId = instanceId;
        this.instanceUrl = instanceUrl;
        this.onCreditsUpdated = onCreditsUpdated;
        this.onTelemetryEvent = onTelemetryEvent;
        this.parsedNodeTypes = this.filterNodeTypes(parsedNodeTypes);
        this.sessionManager = new session_manager_service_1.SessionManagerService(this.parsedNodeTypes, logger);
    }
    static async getModel({ baseUrl, authHeaders = {}, apiKey = '-', provider, } = {}) {
        if (provider === 'openai' || (apiKey.startsWith('sk-') && !apiKey.startsWith('sk-ant-'))) {
            return await (0, llm_config_1.openaiGpt4o)({
                apiKey,
                baseUrl,
                headers: authHeaders,
            });
        }
        return await (0, llm_config_1.anthropicClaudeSonnet45)({
            baseUrl,
            apiKey,
            headers: {
                ...authHeaders,
                'anthropic-beta': 'prompt-caching-2024-07-31',
            },
        });
    }
    async getApiProxyAuthHeaders(user) {
        (0, assert_1.default)(this.client);
        const authResponse = await this.client.getBuilderApiProxyToken(user);
        const authHeaders = {
            Authorization: `${authResponse.tokenType} ${authResponse.accessToken}`,
        };
        return authHeaders;
    }
    async setupModels(user) {
        try {
            const userWithSettings = user;
            const aiConfig = userWithSettings.settings?.aiConfig;
            if (aiConfig?.apiKey) {
                const llmModel = await AiWorkflowBuilderService_1.getModel({
                    apiKey: aiConfig.apiKey,
                    provider: aiConfig.provider,
                });
                return { llmModel };
            }
            const apiKey = process.env.N8N_AI_OPENAI_KEY || process.env.N8N_AI_ANTHROPIC_KEY;
            if (apiKey) {
                const llmModel = await AiWorkflowBuilderService_1.getModel({
                    apiKey,
                });
                return { llmModel };
            }
            if (this.client) {
                try {
                    const authHeaders = await this.getApiProxyAuthHeaders(user);
                    const baseUrl = this.client.getApiProxyBaseUrl();
                    const llmModel = await AiWorkflowBuilderService_1.getModel({
                        baseUrl: baseUrl + '/anthropic',
                        authHeaders,
                    });
                    const tracingClient = new langsmith_1.Client({
                        apiKey: '-',
                        apiUrl: baseUrl + '/langsmith',
                        autoBatchTracing: false,
                        traceBatchConcurrency: 1,
                        fetchOptions: {
                            headers: {
                                ...authHeaders,
                            },
                        },
                    });
                    return { tracingClient, llmModel, authHeaders };
                }
                catch (proxyError) {
                    this.logger?.warn('Failed to use AI Proxy, falling back to direct connection', {
                        error: proxyError instanceof Error ? proxyError : new Error(String(proxyError)),
                    });
                }
            }
            const llmModel = await AiWorkflowBuilderService_1.getModel({
                apiKey: '',
            });
            return { llmModel };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? `: ${error.message}` : '';
            const llmError = new errors_1.LLMServiceError(`Failed to connect to LLM Provider${errorMessage}`, {
                cause: error,
                tags: {
                    hasClient: !!this.client,
                    hasUser: !!user,
                },
            });
            throw llmError;
        }
    }
    filterNodeTypes(nodeTypes) {
        const ignoredTypes = new Set([
            '@n8n/n8n-nodes-langchain.toolVectorStore',
            '@n8n/n8n-nodes-langchain.documentGithubLoader',
            '@n8n/n8n-nodes-langchain.code',
        ]);
        const visibleNodeTypes = nodeTypes.filter((nodeType) => !ignoredTypes.has(nodeType.name) &&
            (nodeType.hidden !== true || nodeType.name === 'n8n-nodes-base.dataTable'));
        return visibleNodeTypes.map((nodeType) => {
            const isTool = nodeType.name.endsWith('Tool');
            if (!isTool)
                return nodeType;
            const nonToolNode = nodeTypes.find((nt) => nt.name === nodeType.name.replace('Tool', ''));
            if (!nonToolNode)
                return nodeType;
            return {
                ...nonToolNode,
                ...nodeType,
            };
        });
    }
    async getAgent(user) {
        const { llmModel, tracingClient, authHeaders } = await this.setupModels(user);
        const agent = new workflow_builder_agent_1.WorkflowBuilderAgent({
            parsedNodeTypes: this.parsedNodeTypes,
            llmSimpleTask: llmModel,
            llmComplexTask: llmModel,
            logger: this.logger,
            checkpointer: this.sessionManager.getCheckpointer(),
            tracer: tracingClient
                ? new tracer_langchain_1.LangChainTracer({ client: tracingClient, projectName: 'n8n-workflow-builder' })
                : undefined,
            instanceUrl: this.instanceUrl,
            onGenerationSuccess: async () => {
                await this.onGenerationSuccess(user, authHeaders);
            },
        });
        return agent;
    }
    async onGenerationSuccess(user, authHeaders) {
        try {
            if (this.client) {
                (0, assert_1.default)(authHeaders, 'Auth headers must be set when AI Assistant Service client is used');
                (0, assert_1.default)(user);
                const creditsInfo = await this.client.markBuilderSuccess(user, authHeaders);
                if (this.onCreditsUpdated && user.id && creditsInfo) {
                    this.onCreditsUpdated(user.id, creditsInfo.creditsQuota, creditsInfo.creditsClaimed);
                }
            }
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger?.error(`Unable to mark generation success ${error.message}`, { error });
            }
        }
    }
    async *chat(payload, user, abortSignal) {
        const agent = await this.getAgent(user);
        const userId = user?.id?.toString();
        const workflowId = payload.workflowContext?.currentWorkflow?.id;
        for await (const output of agent.chat(payload, userId, abortSignal)) {
            yield output;
        }
        if (this.onTelemetryEvent && userId) {
            try {
                await this.trackBuilderReplyTelemetry(agent, workflowId, userId);
            }
            catch (error) {
                this.logger?.error('Failed to track builder reply telemetry', { error });
            }
        }
    }
    async trackBuilderReplyTelemetry(agent, workflowId, userId) {
        if (!this.onTelemetryEvent)
            return;
        const state = await agent.getState(workflowId, userId);
        const threadId = session_manager_service_1.SessionManagerService.generateThreadId(workflowId, userId);
        const lastAiMessage = state.values.messages.findLast((m) => m instanceof messages_1.AIMessage);
        const messageAi = typeof lastAiMessage?.content === 'string'
            ? lastAiMessage.content
            : JSON.stringify(lastAiMessage?.content ?? '');
        const toolMessages = state.values.messages.filter((m) => m instanceof messages_1.ToolMessage);
        const toolsCalled = [
            ...new Set(toolMessages
                .map((m) => m.name)
                .filter((name) => name !== undefined)),
        ];
        const properties = {
            user_id: userId,
            instance_id: this.instanceId,
            workflow_id: workflowId,
            sequence_id: threadId,
            message_ai: messageAi,
            tools_called: toolsCalled,
            techniques_categories: state.values.techniqueCategories,
            validations: state.values.validationHistory,
        };
        this.onTelemetryEvent('Builder replied to user message', properties);
    }
    async getSessions(workflowId, user) {
        const userId = user?.id?.toString();
        return await this.sessionManager.getSessions(workflowId, userId);
    }
    async getBuilderInstanceCredits(user) {
        if (this.client) {
            return await this.client.getBuilderInstanceCredits(user);
        }
        return {
            creditsQuota: -1,
            creditsClaimed: 0,
        };
    }
};
exports.AiWorkflowBuilderService = AiWorkflowBuilderService;
exports.AiWorkflowBuilderService = AiWorkflowBuilderService = AiWorkflowBuilderService_1 = __decorate([
    (0, di_1.Service)(),
    __metadata("design:paramtypes", [Array, ai_assistant_sdk_1.AiAssistantClient,
        backend_common_1.Logger, String, String, Function, Function])
], AiWorkflowBuilderService);
//# sourceMappingURL=ai-workflow-builder-agent.service.js.map