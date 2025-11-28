import { ChatAnthropic } from '@langchain/anthropic';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { AIMessage, ToolMessage } from '@langchain/core/messages';
import type { BaseMessage } from '@langchain/core/messages';
import { LangChainTracer } from '@langchain/core/tracers/tracer_langchain';
import { Logger } from '@n8n/backend-common';
import { Service } from '@n8n/di';
import { AiAssistantClient, AiAssistantSDK } from '@n8n_io/ai-assistant-sdk';
import assert from 'assert';
import { Client as TracingClient } from 'langsmith';
import type { IUser, INodeTypeDescription, ITelemetryTrackProperties, IUserSettings } from 'n8n-workflow';

import { LLMServiceError } from '@/errors';
import { anthropicClaudeSonnet45, openaiGpt4o } from '@/llm-config';
import { SessionManagerService } from '@/session-manager.service';
import { WorkflowBuilderAgent, type ChatPayload } from '@/workflow-builder-agent';

type OnCreditsUpdated = (userId: string, creditsQuota: number, creditsClaimed: number) => void;

type OnTelemetryEvent = (event: string, properties: ITelemetryTrackProperties) => void;

@Service()
export class AiWorkflowBuilderService {
	private readonly parsedNodeTypes: INodeTypeDescription[];
	private sessionManager: SessionManagerService;

	constructor(
		parsedNodeTypes: INodeTypeDescription[],
		private readonly client?: AiAssistantClient,
		private readonly logger?: Logger,
		private readonly instanceId?: string,
		private readonly instanceUrl?: string,
		private readonly onCreditsUpdated?: OnCreditsUpdated,
		private readonly onTelemetryEvent?: OnTelemetryEvent,
	) {
		this.parsedNodeTypes = this.filterNodeTypes(parsedNodeTypes);
		this.sessionManager = new SessionManagerService(this.parsedNodeTypes, logger);
	}

	static async getModel({
		baseUrl,
		authHeaders = {},
		apiKey = '-',
		provider,
	}: {
		baseUrl?: string;
		authHeaders?: Record<string, string>;
		apiKey?: string;
		provider?: 'openai' | 'anthropic';
	} = {}): Promise<BaseChatModel> {
		if (provider === 'openai' || (apiKey.startsWith('sk-') && !apiKey.startsWith('sk-ant-'))) {
			return await openaiGpt4o({
				apiKey,
				baseUrl,
				headers: authHeaders,
			});
		}
		return await anthropicClaudeSonnet45({
			baseUrl,
			apiKey,
			headers: {
				...authHeaders,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				'anthropic-beta': 'prompt-caching-2024-07-31',
			},
		});
	}

	private async getApiProxyAuthHeaders(user: IUser) {
		assert(this.client);

		const authResponse = await this.client.getBuilderApiProxyToken(user);
		const authHeaders = {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Authorization: `${authResponse.tokenType} ${authResponse.accessToken}`,
		};

		return authHeaders;
	}

	private async setupModels(user: IUser): Promise<{
		llmModel: BaseChatModel;
		tracingClient?: TracingClient;
		// eslint-disable-next-line @typescript-eslint/naming-convention
		authHeaders?: { Authorization: string };
	}> {
		try {
			const userWithSettings = user as IUser & { settings?: IUserSettings };
			const aiConfig = userWithSettings.settings?.aiConfig;
			if (aiConfig?.apiKey) {
				const llmModel = await AiWorkflowBuilderService.getModel({
					apiKey: aiConfig.apiKey,
					provider: aiConfig.provider,
				});
				return { llmModel };
			}

			// Prioritize environment variables (BYOK)
			const apiKey = process.env.N8N_AI_OPENAI_KEY || process.env.N8N_AI_ANTHROPIC_KEY;
			if (apiKey) {
				const llmModel = await AiWorkflowBuilderService.getModel({
					apiKey,
				});
				return { llmModel };
			}

			// If client is provided, use it for API proxy
			if (this.client) {
				try {
					const authHeaders = await this.getApiProxyAuthHeaders(user);

					// Extract baseUrl from client configuration
					const baseUrl = this.client.getApiProxyBaseUrl();

					const llmModel = await AiWorkflowBuilderService.getModel({
						baseUrl: baseUrl + '/anthropic',
						authHeaders,
					});

					const tracingClient = new TracingClient({
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
				} catch (proxyError) {
					this.logger?.warn('Failed to use AI Proxy, falling back to direct connection', {
						error: proxyError instanceof Error ? proxyError : new Error(String(proxyError)),
					});
				}
			}

			// Fallback
			const llmModel = await AiWorkflowBuilderService.getModel({
				apiKey: '',
			});

			return { llmModel };
		} catch (error) {
			const errorMessage = error instanceof Error ? `: ${error.message}` : '';
			const llmError = new LLMServiceError(`Failed to connect to LLM Provider${errorMessage}`, {
				cause: error,
				tags: {
					hasClient: !!this.client,
					hasUser: !!user,
				},
			});
			throw llmError;
		}
	}

	private filterNodeTypes(nodeTypes: INodeTypeDescription[]): INodeTypeDescription[] {
		// These types are ignored because they tend to cause issues when generating workflows
		const ignoredTypes = new Set([
			'@n8n/n8n-nodes-langchain.toolVectorStore',
			'@n8n/n8n-nodes-langchain.documentGithubLoader',
			'@n8n/n8n-nodes-langchain.code',
		]);

		const visibleNodeTypes = nodeTypes.filter(
			(nodeType) =>
				// We filter out hidden nodes, except for the Data Table node which has custom hiding logic
				// See more details in DataTable.node.ts#L29
				!ignoredTypes.has(nodeType.name) &&
				(nodeType.hidden !== true || nodeType.name === 'n8n-nodes-base.dataTable'),
		);

		return visibleNodeTypes.map((nodeType) => {
			// If the node type is a tool, we need to find the corresponding non-tool node type
			// and merge the two node types to get the full node type description.
			const isTool = nodeType.name.endsWith('Tool');
			if (!isTool) return nodeType;

			const nonToolNode = nodeTypes.find((nt) => nt.name === nodeType.name.replace('Tool', ''));
			if (!nonToolNode) return nodeType;

			return {
				...nonToolNode,
				...nodeType,
			};
		});
	}

	private async getAgent(user: IUser) {
		const { llmModel, tracingClient, authHeaders } = await this.setupModels(user);

		const agent = new WorkflowBuilderAgent({
			parsedNodeTypes: this.parsedNodeTypes,
			// We use Sonnet both for simple and complex tasks
			llmSimpleTask: llmModel,
			llmComplexTask: llmModel,
			logger: this.logger,
			checkpointer: this.sessionManager.getCheckpointer(),
			tracer: tracingClient
				? new LangChainTracer({ client: tracingClient, projectName: 'n8n-workflow-builder' })
				: undefined,
			instanceUrl: this.instanceUrl,
			onGenerationSuccess: async () => {
				await this.onGenerationSuccess(user, authHeaders);
			},
		});

		return agent;
	}

	private async onGenerationSuccess(
		user?: IUser,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		authHeaders?: { Authorization: string },
	): Promise<void> {
		try {
			if (this.client) {
				assert(authHeaders, 'Auth headers must be set when AI Assistant Service client is used');
				assert(user);
				const creditsInfo = await this.client.markBuilderSuccess(user, authHeaders);

				// Call the callback with the credits info from the response
				if (this.onCreditsUpdated && user.id && creditsInfo) {
					this.onCreditsUpdated(user.id, creditsInfo.creditsQuota, creditsInfo.creditsClaimed);
				}
			}
		} catch (error: unknown) {
			if (error instanceof Error) {
				this.logger?.error(`Unable to mark generation success ${error.message}`, { error });
			}
		}
	}

	async *chat(payload: ChatPayload, user: IUser, abortSignal?: AbortSignal) {
		const agent = await this.getAgent(user);
		const userId = user?.id?.toString();
		const workflowId = payload.workflowContext?.currentWorkflow?.id;

		for await (const output of agent.chat(payload, userId, abortSignal)) {
			yield output;
		}

		// After the stream completes, track telemetry
		if (this.onTelemetryEvent && userId) {
			try {
				await this.trackBuilderReplyTelemetry(agent, workflowId, userId);
			} catch (error) {
				this.logger?.error('Failed to track builder reply telemetry', { error });
			}
		}
	}

	private async trackBuilderReplyTelemetry(
		agent: WorkflowBuilderAgent,
		workflowId: string | undefined,
		userId: string,
	): Promise<void> {
		if (!this.onTelemetryEvent) return;

		const state = await agent.getState(workflowId, userId);
		const threadId = SessionManagerService.generateThreadId(workflowId, userId);

		// extract the last message that was sent to the user for telemetry
		const lastAiMessage = state.values.messages.findLast(
			(m: BaseMessage): m is AIMessage => m instanceof AIMessage,
		);
		const messageAi =
			typeof lastAiMessage?.content === 'string'
				? lastAiMessage.content
				: JSON.stringify(lastAiMessage?.content ?? '');

		const toolMessages = state.values.messages.filter(
			(m: BaseMessage): m is ToolMessage => m instanceof ToolMessage,
		);
		const toolsCalled = [
			...new Set(
				toolMessages
					.map((m: ToolMessage) => m.name)
					.filter((name: string | undefined): name is string => name !== undefined),
			),
		];

		// Build telemetry properties
		const properties: ITelemetryTrackProperties = {
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

	async getSessions(workflowId: string | undefined, user?: IUser) {
		const userId = user?.id?.toString();
		return await this.sessionManager.getSessions(workflowId, userId);
	}

	async getBuilderInstanceCredits(
		user: IUser,
	): Promise<AiAssistantSDK.BuilderInstanceCreditsResponse> {
		if (this.client) {
			return await this.client.getBuilderInstanceCredits(user);
		}

		// if using env variables directly instead of ai proxy service
		return {
			creditsQuota: -1,
			creditsClaimed: 0,
		};
	}
}
