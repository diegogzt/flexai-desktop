import type { AiApplySuggestionRequestDto, AiAskRequestDto, AiChatRequestDto } from '@n8n/api-types';
import { GlobalConfig } from '@n8n/config';
import { type IUser } from 'n8n-workflow';
import { ReadableStream } from 'node:stream/web';
import { License } from '../license';
export declare class AiService {
    private readonly licenseService;
    private readonly globalConfig;
    private client;
    constructor(licenseService: License, globalConfig: GlobalConfig);
    init(): Promise<void>;
    chat(payload: AiChatRequestDto, user: IUser): Promise<Response | {
        body: ReadableStream<any>;
    }>;
    applySuggestion(payload: AiApplySuggestionRequestDto, user: IUser): Promise<import("@n8n_io/ai-assistant-sdk").AiAssistantSDK.ApplySuggestionResponse>;
    askAi(payload: AiAskRequestDto, user: IUser): Promise<{
        code: string;
    }>;
    private chatWithProvider;
    private askAiWithProvider;
    createFreeAiCredits(user: IUser): Promise<import("@n8n_io/ai-assistant-sdk").AiAssistantSDK.AiCreditResponsePayload>;
}
