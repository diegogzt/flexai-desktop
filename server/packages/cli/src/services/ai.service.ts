import type {
	AiApplySuggestionRequestDto,
	AiAskRequestDto,
	AiChatRequestDto,
} from '@n8n/api-types';
import { GlobalConfig } from '@n8n/config';
import { Service } from '@n8n/di';
import { AiAssistantClient } from '@n8n_io/ai-assistant-sdk';
import { assert, type IUser, type IUserSettings } from 'n8n-workflow';
import { AiWorkflowBuilderService } from '@n8n/ai-workflow-builder';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { ReadableStream } from 'node:stream/web';

import { N8N_VERSION, STREAM_SEPARATOR } from '../constants';
import { License } from '../license';

@Service()
export class AiService {
	private client: AiAssistantClient | undefined;

	constructor(
		private readonly licenseService: License,
		private readonly globalConfig: GlobalConfig,
	) {}

	async init() {
		const aiAssistantEnabled = this.licenseService.isAiAssistantEnabled();

		if (!aiAssistantEnabled) {
			return;
		}

		const licenseCert = await this.licenseService.loadCertStr();
		const consumerId = this.licenseService.getConsumerId();
		const baseUrl = this.globalConfig.aiAssistant.baseUrl;
		const logLevel = this.globalConfig.logging.level;

		this.client = new AiAssistantClient({
			licenseCert,
			consumerId,
			n8nVersion: N8N_VERSION,
			baseUrl,
			logLevel,
		});
	}

	async chat(payload: AiChatRequestDto, user: IUser) {
		const userWithSettings = user as IUser & { settings?: IUserSettings };
		if (userWithSettings.settings?.aiConfig?.apiKey) {
			return this.chatWithProvider(payload, userWithSettings.settings.aiConfig);
		}

		if (!this.client) {
			await this.init();
		}
		assert(this.client, 'Assistant client not setup');

		return await this.client.chat(payload, { id: user.id });
	}

	async applySuggestion(payload: AiApplySuggestionRequestDto, user: IUser) {
		if (!this.client) {
			await this.init();
		}
		assert(this.client, 'Assistant client not setup');

		return await this.client.applySuggestion(payload, { id: user.id });
	}

	async askAi(payload: AiAskRequestDto, user: IUser) {
		const userWithSettings = user as IUser & { settings?: IUserSettings };
		if (userWithSettings.settings?.aiConfig?.apiKey) {
			return this.askAiWithProvider(payload, userWithSettings.settings.aiConfig);
		}

		if (!this.client) {
			await this.init();
		}
		assert(this.client, 'Assistant client not setup');

		return await this.client.askAi(payload, { id: user.id });
	}

	private async chatWithProvider(
		payload: AiChatRequestDto,
		config: { provider: string; apiKey: string },
	) {
		const model = await AiWorkflowBuilderService.getModel({
			apiKey: config.apiKey,
			provider: config.provider as 'openai' | 'anthropic',
		});

		// Extract message from payload
		// payload.payload is generic object. Assuming it matches ChatRequest.RequestPayload
		const payloadData = payload.payload as any;
		const messageText = payloadData.payload?.text || payloadData.text;

		const langchainMessages = [];
		if (messageText) {
			langchainMessages.push(new HumanMessage(messageText));
		}

		const stream = await model.stream(langchainMessages);

		const body = new ReadableStream({
			async start(controller) {
				for await (const chunk of stream) {
					const content =
						typeof chunk.content === 'string' ? chunk.content : JSON.stringify(chunk.content);
					const responsePayload = {
						messages: [
							{
								role: 'assistant',
								type: 'message',
								text: content,
							},
						],
					};
					controller.enqueue(JSON.stringify(responsePayload) + STREAM_SEPARATOR);
				}
				controller.close();
			},
		});

		return { body };
	}

	private async askAiWithProvider(
		payload: AiAskRequestDto,
		config: { provider: string; apiKey: string },
	) {
		const model = await AiWorkflowBuilderService.getModel({
			apiKey: config.apiKey,
			provider: config.provider as 'openai' | 'anthropic',
		});

		// Construct prompt
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
		const code =
			typeof response.content === 'string'
				? response.content
				: JSON.stringify(response.content);

		// Clean up code (remove markdown code blocks if present)
		const cleanCode = code.replace(/^```(javascript|typescript)?\n/, '').replace(/\n```$/, '');

		return { code: cleanCode };
	}

	async createFreeAiCredits(user: IUser) {
		if (!this.client) {
			await this.init();
		}
		assert(this.client, 'Assistant client not setup');

		return await this.client.generateAiCreditsCredentials(user);
	}
}
