"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CATEGORIZE_PROMPT_TOOL = void 0;
exports.createCategorizePromptTool = createCategorizePromptTool;
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
const prompt_categorization_1 = require("../chains/prompt-categorization");
const errors_1 = require("../errors");
const progress_1 = require("../tools/helpers/progress");
const response_1 = require("../tools/helpers/response");
const categorizePromptSchema = zod_1.z.object({
    prompt: zod_1.z.string().min(1).describe('The user prompt to categorize'),
});
function buildCategorizationMessage(categorization) {
    const parts = [];
    parts.push('Prompt categorized');
    if (categorization.techniques.length > 0) {
        parts.push(`- Techniques: ${categorization.techniques.join(', ')}`);
    }
    if (categorization.confidence !== undefined) {
        parts.push(`- Confidence: ${(categorization.confidence * 100).toFixed(0)}%`);
    }
    return parts.join('\n');
}
exports.CATEGORIZE_PROMPT_TOOL = {
    toolName: 'categorize_prompt',
    displayTitle: 'Categorizing prompt',
};
function createCategorizePromptTool(llm, logger) {
    const dynamicTool = (0, tools_1.tool)(async (input, config) => {
        const reporter = (0, progress_1.createProgressReporter)(config, exports.CATEGORIZE_PROMPT_TOOL.toolName, exports.CATEGORIZE_PROMPT_TOOL.displayTitle);
        try {
            const validatedInput = categorizePromptSchema.parse(input);
            const { prompt } = validatedInput;
            reporter.start(validatedInput);
            logger?.debug('Categorizing user prompt using LLM...');
            reporter.progress('Analyzing prompt to identify use case and techniques...');
            const categorization = await (0, prompt_categorization_1.promptCategorizationChain)(llm, prompt);
            logger?.debug('Prompt categorized', {
                techniques: categorization.techniques,
                confidence: categorization.confidence,
            });
            const output = {
                categorization,
            };
            reporter.complete(output);
            return (0, response_1.createSuccessResponse)(config, buildCategorizationMessage(categorization), {
                categorization,
                techniqueCategories: categorization.techniques,
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const validationError = new errors_1.ValidationError('Invalid input parameters', {
                    extra: { errors: error.errors },
                });
                reporter.error(validationError);
                return (0, response_1.createErrorResponse)(config, validationError);
            }
            const toolError = new errors_1.ToolExecutionError(error instanceof Error ? error.message : 'Unknown error occurred', {
                toolName: exports.CATEGORIZE_PROMPT_TOOL.toolName,
                cause: error instanceof Error ? error : undefined,
            });
            reporter.error(toolError);
            return (0, response_1.createErrorResponse)(config, toolError);
        }
    }, {
        name: exports.CATEGORIZE_PROMPT_TOOL.toolName,
        description: `Categorize a user's workflow request to identify the use case and required techniques.

This helps understand what type of workflow the user wants to build and which automation patterns will be needed.

Use this tool when you receive an initial workflow request to:
- Detect required techniques (e.g., scraping, data transformation, notifications)
- Better understand the user's needs and context

The categorization allows retrieving relevant best practice documentation to improve workflow structure and node selection.`,
        schema: categorizePromptSchema,
    });
    return {
        tool: dynamicTool,
        ...exports.CATEGORIZE_PROMPT_TOOL,
    };
}
//# sourceMappingURL=categorize-prompt.tool.js.map