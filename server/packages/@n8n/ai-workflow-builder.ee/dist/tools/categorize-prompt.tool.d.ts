import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { Logger } from '@n8n/backend-common';
import type { BuilderTool, BuilderToolBase } from '../utils/stream-processor';
export declare const CATEGORIZE_PROMPT_TOOL: BuilderToolBase;
export declare function createCategorizePromptTool(llm: BaseChatModel, logger?: Logger): BuilderTool;
