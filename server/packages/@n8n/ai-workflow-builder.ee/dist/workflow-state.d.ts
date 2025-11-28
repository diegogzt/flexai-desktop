import type { BaseMessage } from '@langchain/core/messages';
import type { SimpleWorkflow, WorkflowOperation } from './types';
import type { ProgrammaticEvaluationResult, TelemetryValidationStatus } from './validation/types';
export declare function createTrimMessagesReducer(maxUserMessages: number): (current: BaseMessage[]) => BaseMessage[];
export declare const WorkflowState: import("@langchain/langgraph").AnnotationRoot<{
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
    workflowJSON: import("@langchain/langgraph").BinaryOperatorAggregate<SimpleWorkflow, SimpleWorkflow>;
    workflowOperations: import("@langchain/langgraph").BinaryOperatorAggregate<WorkflowOperation[] | null, WorkflowOperation[] | null>;
    workflowContext: import("@langchain/langgraph").BinaryOperatorAggregate<{
        executionSchema?: import("n8n-workflow").NodeExecutionSchema[];
        currentWorkflow?: Partial<import("n8n-workflow").IWorkflowBase>;
        executionData?: import("n8n-workflow").IRunExecutionData["resultData"];
        expressionValues?: Record<string, import("./workflow-builder-agent").ExpressionValue[]>;
    } | undefined, {
        executionSchema?: import("n8n-workflow").NodeExecutionSchema[];
        currentWorkflow?: Partial<import("n8n-workflow").IWorkflowBase>;
        executionData?: import("n8n-workflow").IRunExecutionData["resultData"];
        expressionValues?: Record<string, import("./workflow-builder-agent").ExpressionValue[]>;
    } | undefined>;
    workflowValidation: import("@langchain/langgraph").BinaryOperatorAggregate<ProgrammaticEvaluationResult | null, ProgrammaticEvaluationResult | null>;
    validationHistory: import("@langchain/langgraph").BinaryOperatorAggregate<TelemetryValidationStatus[], TelemetryValidationStatus[]>;
    techniqueCategories: import("@langchain/langgraph").BinaryOperatorAggregate<string[], string[]>;
    previousSummary: import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
}>;
