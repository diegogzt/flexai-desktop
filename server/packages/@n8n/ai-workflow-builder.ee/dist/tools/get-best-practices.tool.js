"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET_BEST_PRACTICES_TOOL = void 0;
exports.createGetBestPracticesTool = createGetBestPracticesTool;
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
const errors_1 = require("../errors");
const best_practices_1 = require("../tools/best-practices");
const progress_1 = require("../tools/helpers/progress");
const response_1 = require("../tools/helpers/response");
const categorization_1 = require("../types/categorization");
const getBestPracticesSchema = zod_1.z.object({
    techniques: zod_1.z
        .array(zod_1.z.nativeEnum(categorization_1.WorkflowTechnique))
        .min(1)
        .describe('List of workflow techniques to retrieve best practices for'),
});
function formatBestPractices(techniques) {
    const parts = [];
    const foundDocs = [];
    for (const technique of techniques) {
        const doc = best_practices_1.documentation[technique];
        if (doc) {
            foundDocs.push(doc.getDocumentation());
        }
    }
    if (foundDocs.length > 0) {
        parts.push('<best_practices>');
        parts.push(foundDocs.join('\n---\n'));
        parts.push('</best_practices>');
    }
    return parts.join('\n');
}
exports.GET_BEST_PRACTICES_TOOL = {
    toolName: 'get_best_practices',
    displayTitle: 'Getting best practices',
};
function createGetBestPracticesTool() {
    const dynamicTool = (0, tools_1.tool)((input, config) => {
        const reporter = (0, progress_1.createProgressReporter)(config, exports.GET_BEST_PRACTICES_TOOL.toolName, exports.GET_BEST_PRACTICES_TOOL.displayTitle);
        try {
            const validatedInput = getBestPracticesSchema.parse(input);
            const { techniques } = validatedInput;
            reporter.start(validatedInput);
            reporter.progress(`Retrieving best practices for ${techniques.length} technique(s)...`);
            const availableDocs = techniques.filter((technique) => best_practices_1.documentation[technique]);
            if (availableDocs.length === 0) {
                const message = `No best practices documentation available for the requested techniques: ${techniques.join(', ')}`;
                reporter.complete({ techniques, found: 0 });
                return (0, response_1.createSuccessResponse)(config, message);
            }
            const message = formatBestPractices(techniques);
            reporter.complete({
                techniques,
                found: availableDocs.length,
                missing: techniques.length - availableDocs.length,
            });
            return (0, response_1.createSuccessResponse)(config, message);
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
                toolName: exports.GET_BEST_PRACTICES_TOOL.toolName,
                cause: error instanceof Error ? error : undefined,
            });
            reporter.error(toolError);
            return (0, response_1.createErrorResponse)(config, toolError);
        }
    }, {
        name: exports.GET_BEST_PRACTICES_TOOL.toolName,
        description: `Retrieve best practices documentation for specific workflow techniques.

Use this tool after categorizing a user's prompt to get relevant guidance on:
- Recommended nodes and their purposes
- Common pitfalls to avoid
- Performance and resource management tips
- Implementation patterns and best practices
- General tips on building workflows that utilise the provided techniques

This helps build better workflows by applying proven patterns and avoiding common mistakes.`,
        schema: getBestPracticesSchema,
    });
    return {
        tool: dynamicTool,
        ...exports.GET_BEST_PRACTICES_TOOL,
    };
}
//# sourceMappingURL=get-best-practices.tool.js.map