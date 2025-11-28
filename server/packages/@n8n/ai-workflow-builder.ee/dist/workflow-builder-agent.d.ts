import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { LangChainTracer } from '@langchain/core/tracers/tracer_langchain';
import type { MemorySaver, StateSnapshot } from '@langchain/langgraph';
import type { Logger } from '@n8n/backend-common';
import { type INodeTypeDescription, type IRunExecutionData, type IWorkflowBase, type NodeExecutionSchema } from 'n8n-workflow';
import { WorkflowState } from './workflow-state';
export type TypedStateSnapshot = Omit<StateSnapshot, 'values'> & {
    values: typeof WorkflowState.State;
};
export declare function shouldModifyState(state: typeof WorkflowState.State, autoCompactThresholdTokens: number): 'compact_messages' | 'delete_messages' | 'create_workflow_name' | 'auto_compact_messages' | 'agent';
export interface WorkflowBuilderAgentConfig {
    parsedNodeTypes: INodeTypeDescription[];
    llmSimpleTask: BaseChatModel;
    llmComplexTask: BaseChatModel;
    logger?: Logger;
    checkpointer: MemorySaver;
    tracer?: LangChainTracer;
    autoCompactThresholdTokens?: number;
    instanceUrl?: string;
    onGenerationSuccess?: () => Promise<void>;
}
export interface ExpressionValue {
    expression: string;
    resolvedValue: unknown;
    nodeType?: string;
}
export interface ChatPayload {
    message: string;
    workflowContext?: {
        executionSchema?: NodeExecutionSchema[];
        currentWorkflow?: Partial<IWorkflowBase>;
        executionData?: IRunExecutionData['resultData'];
        expressionValues?: Record<string, ExpressionValue[]>;
    };
}
export declare class WorkflowBuilderAgent {
    private checkpointer;
    private parsedNodeTypes;
    private llmSimpleTask;
    private llmComplexTask;
    private logger?;
    private tracer?;
    private autoCompactThresholdTokens;
    private instanceUrl?;
    private onGenerationSuccess?;
    constructor(config: WorkflowBuilderAgentConfig);
    private getBuilderTools;
    private createWorkflow;
    getState(workflowId?: string, userId?: string): Promise<TypedStateSnapshot>;
    private getDefaultWorkflowJSON;
    chat(payload: ChatPayload, userId?: string, abortSignal?: AbortSignal): AsyncGenerator<import("./types").StreamOutput, void, unknown>;
    private validateMessageLength;
    private setupAgentAndConfigs;
    private createAgentStream;
    private handleStreamError;
    private processAgentStream;
    private handleAgentStreamError;
    private getInvalidRequestError;
}
