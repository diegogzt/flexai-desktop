"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.programmaticValidation = programmaticValidation;
const checks_1 = require("../validation/checks");
function programmaticValidation(input, nodeTypes) {
    const { generatedWorkflow } = input;
    const connectionsValidationResult = (0, checks_1.validateConnections)(generatedWorkflow, nodeTypes);
    const nodesValidationResult = (0, checks_1.validateNodes)(generatedWorkflow, nodeTypes);
    const triggerValidationResult = (0, checks_1.validateTrigger)(generatedWorkflow, nodeTypes);
    const agentPromptValidationResult = (0, checks_1.validateAgentPrompt)(generatedWorkflow);
    const toolsValidationResult = (0, checks_1.validateTools)(generatedWorkflow, nodeTypes);
    const fromAiValidationResult = (0, checks_1.validateFromAi)(generatedWorkflow, nodeTypes);
    return {
        connections: connectionsValidationResult,
        nodes: nodesValidationResult,
        trigger: triggerValidationResult,
        agentPrompt: agentPromptValidationResult,
        tools: toolsValidationResult,
        fromAi: fromAiValidationResult,
    };
}
//# sourceMappingURL=programmatic.js.map