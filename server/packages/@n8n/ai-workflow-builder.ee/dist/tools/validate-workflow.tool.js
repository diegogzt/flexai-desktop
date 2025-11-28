"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALIDATE_WORKFLOW_TOOL = void 0;
exports.createValidateWorkflowTool = createValidateWorkflowTool;
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
const programmatic_1 = require("../validation/programmatic");
const types_1 = require("../validation/types");
const errors_1 = require("../errors");
const workflow_validation_1 = require("../utils/workflow-validation");
const progress_1 = require("./helpers/progress");
const response_1 = require("./helpers/response");
const state_1 = require("./helpers/state");
const validateWorkflowSchema = zod_1.z.object({}).strict().default({});
exports.VALIDATE_WORKFLOW_TOOL = {
    toolName: 'validate_workflow',
    displayTitle: 'Validating workflow',
};
function collectValidationResultForTelemetry(results) {
    const status = Object.fromEntries(types_1.PROGRAMMATIC_VIOLATION_NAMES.map((name) => [name, 'pass']));
    Object.values(results).forEach((violations) => {
        violations?.forEach((violation) => {
            status[violation.name] = 'fail';
        });
    });
    return status;
}
function createValidateWorkflowTool(parsedNodeTypes, logger) {
    const dynamicTool = (0, tools_1.tool)(async (input, config) => {
        const reporter = (0, progress_1.createProgressReporter)(config, exports.VALIDATE_WORKFLOW_TOOL.toolName, exports.VALIDATE_WORKFLOW_TOOL.displayTitle);
        try {
            const validatedInput = validateWorkflowSchema.parse(input ?? {});
            reporter.start(validatedInput);
            const state = (0, state_1.getWorkflowState)();
            (0, progress_1.reportProgress)(reporter, 'Running programmatic checks');
            const violations = (0, programmatic_1.programmaticValidation)({
                generatedWorkflow: state.workflowJSON,
            }, parsedNodeTypes);
            const validationResultForTelemetry = collectValidationResultForTelemetry(violations);
            const message = (0, workflow_validation_1.formatWorkflowValidation)(violations);
            reporter.complete({ message });
            return (0, response_1.createSuccessResponse)(config, message, {
                workflowValidation: violations,
                validationHistory: [validationResultForTelemetry],
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
            const toolError = new errors_1.ToolExecutionError(error instanceof Error ? error.message : 'Failed to validate workflow', {
                toolName: exports.VALIDATE_WORKFLOW_TOOL.toolName,
                cause: error instanceof Error ? error : undefined,
            });
            logger?.warn('validate_workflow tool failed', { error: toolError });
            reporter.error(toolError);
            return (0, response_1.createErrorResponse)(config, toolError);
        }
    }, {
        name: exports.VALIDATE_WORKFLOW_TOOL.toolName,
        description: 'Run validation checks against the current workflow. Call this after making changes to ensure the workflow is valid.',
        schema: validateWorkflowSchema,
    });
    return {
        tool: dynamicTool,
        ...exports.VALIDATE_WORKFLOW_TOOL,
    };
}
//# sourceMappingURL=validate-workflow.tool.js.map