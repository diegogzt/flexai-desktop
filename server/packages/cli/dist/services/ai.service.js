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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const config_1 = require("@n8n/config");
const di_1 = require("@n8n/di");
const ai_assistant_sdk_1 = require("@n8n_io/ai-assistant-sdk");
const n8n_workflow_1 = require("n8n-workflow");
const ai_workflow_builder_1 = require("@n8n/ai-workflow-builder");
const messages_1 = require("@langchain/core/messages");
const web_1 = require("node:stream/web");
const constants_1 = require("../constants");
const license_1 = require("../license");
let AiService = class AiService {
    constructor(licenseService, globalConfig) {
        this.licenseService = licenseService;
        this.globalConfig = globalConfig;
    }
    async init() {
        const aiAssistantEnabled = this.licenseService.isAiAssistantEnabled();
        if (!aiAssistantEnabled) {
            return;
        }
        const licenseCert = await this.licenseService.loadCertStr();
        const consumerId = this.licenseService.getConsumerId();
        const baseUrl = this.globalConfig.aiAssistant.baseUrl;
        const logLevel = this.globalConfig.logging.level;
        this.client = new ai_assistant_sdk_1.AiAssistantClient({
            licenseCert,
            consumerId,
            n8nVersion: constants_1.N8N_VERSION,
            baseUrl,
            logLevel,
        });
    }
    async chat(payload, user) {
        const userWithSettings = user;
        if (userWithSettings.settings?.aiConfig?.apiKey) {
            return this.chatWithProvider(payload, userWithSettings.settings.aiConfig);
        }
        if (!this.client) {
            await this.init();
        }
        (0, n8n_workflow_1.assert)(this.client, 'Assistant client not setup');
        return await this.client.chat(payload, { id: user.id });
    }
    async applySuggestion(payload, user) {
        if (!this.client) {
            await this.init();
        }
        (0, n8n_workflow_1.assert)(this.client, 'Assistant client not setup');
        return await this.client.applySuggestion(payload, { id: user.id });
    }
    async askAi(payload, user) {
        const userWithSettings = user;
        if (userWithSettings.settings?.aiConfig?.apiKey) {
            return this.askAiWithProvider(payload, userWithSettings.settings.aiConfig);
        }
        if (!this.client) {
            await this.init();
        }
        (0, n8n_workflow_1.assert)(this.client, 'Assistant client not setup');
        return await this.client.askAi(payload, { id: user.id });
    }
    async chatWithProvider(payload, config) {
        const model = await ai_workflow_builder_1.AiWorkflowBuilderService.getModel({
            apiKey: config.apiKey,
            provider: config.provider,
        });
        const payloadData = payload.payload;
        const messageText = payloadData.payload?.text || payloadData.text;
        const langchainMessages = [];
        if (messageText) {
            langchainMessages.push(new messages_1.HumanMessage(messageText));
        }
        const stream = await model.stream(langchainMessages);
        const body = new web_1.ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const content = typeof chunk.content === 'string' ? chunk.content : JSON.stringify(chunk.content);
                    const responsePayload = {
                        messages: [
                            {
                                role: 'assistant',
                                type: 'message',
                                text: content,
                            },
                        ],
                    };
                    controller.enqueue(JSON.stringify(responsePayload) + constants_1.STREAM_SEPARATOR);
                }
                controller.close();
            },
        });
        return { body };
    }
    async askAiWithProvider(payload, config) {
        const model = await ai_workflow_builder_1.AiWorkflowBuilderService.getModel({
            apiKey: config.apiKey,
            provider: config.provider,
        });
        const context = payload.context;
        const question = payload.question;
        const prompt = `
You are an expert coding assistant for n8n.
Your task is to write JavaScript/TypeScript code for an n8n Code Node based on the user's request.

Context:
Input Schema: ${JSON.stringify(context.inputSchema)}
Previous Nodes Schemas: ${JSON.stringify(context.schema)}

User Request: ${question}

Return ONLY the code, no markdown formatting, no explanations.
`;
        const response = await model.invoke(prompt);
        const code = typeof response.content === 'string'
            ? response.content
            : JSON.stringify(response.content);
        const cleanCode = code.replace(/^```(javascript|typescript)?\n/, '').replace(/\n```$/, '');
        return { code: cleanCode };
    }
    async createFreeAiCredits(user) {
        if (!this.client) {
            await this.init();
        }
        (0, n8n_workflow_1.assert)(this.client, 'Assistant client not setup');
        return await this.client.generateAiCreditsCredentials(user);
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, di_1.Service)(),
    __metadata("design:paramtypes", [license_1.License,
        config_1.GlobalConfig])
], AiService);
//# sourceMappingURL=ai.service.js.map