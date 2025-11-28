import { z } from 'zod';
import type { BuilderToolBase } from '../utils/stream-processor';
export declare const GET_BEST_PRACTICES_TOOL: BuilderToolBase;
export declare function createGetBestPracticesTool(): {
    toolName: string;
    displayTitle: string;
    getCustomDisplayTitle?: (values: Record<string, unknown>) => string;
    tool: import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<{
        techniques: z.ZodArray<z.ZodNativeEnum<{
            readonly SCHEDULING: "scheduling";
            readonly CHATBOT: "chatbot";
            readonly FORM_INPUT: "form_input";
            readonly SCRAPING_AND_RESEARCH: "scraping_and_research";
            readonly MONITORING: "monitoring";
            readonly ENRICHMENT: "enrichment";
            readonly TRIAGE: "triage";
            readonly CONTENT_GENERATION: "content_generation";
            readonly DOCUMENT_PROCESSING: "document_processing";
            readonly DATA_EXTRACTION: "data_extraction";
            readonly DATA_ANALYSIS: "data_analysis";
            readonly DATA_TRANSFORMATION: "data_transformation";
            readonly NOTIFICATION: "notification";
            readonly KNOWLEDGE_BASE: "knowledge_base";
            readonly HUMAN_IN_THE_LOOP: "human_in_the_loop";
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        techniques: ("scheduling" | "chatbot" | "form_input" | "scraping_and_research" | "monitoring" | "enrichment" | "triage" | "content_generation" | "document_processing" | "data_extraction" | "data_analysis" | "data_transformation" | "notification" | "knowledge_base" | "human_in_the_loop")[];
    }, {
        techniques: ("scheduling" | "chatbot" | "form_input" | "scraping_and_research" | "monitoring" | "enrichment" | "triage" | "content_generation" | "document_processing" | "data_extraction" | "data_analysis" | "data_transformation" | "notification" | "knowledge_base" | "human_in_the_loop")[];
    }>, unknown, {
        techniques: ("scheduling" | "chatbot" | "form_input" | "scraping_and_research" | "monitoring" | "enrichment" | "triage" | "content_generation" | "document_processing" | "data_extraction" | "data_analysis" | "data_transformation" | "notification" | "knowledge_base" | "human_in_the_loop")[];
    }, import("@langchain/langgraph").Command<unknown>>;
};
