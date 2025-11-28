"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFromAi = validateFromAi;
const is_tool_1 = require("../utils/is-tool");
function containsFromAi(value) {
    if (typeof value !== 'string') {
        return false;
    }
    return /\$from[Aa][Ii]\(.+\)/.test(value);
}
function parametersContainFromAi(parameters) {
    for (const value of Object.values(parameters)) {
        if (containsFromAi(value)) {
            return true;
        }
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            if (parametersContainFromAi(value)) {
                return true;
            }
        }
        if (Array.isArray(value)) {
            for (const item of value) {
                if (containsFromAi(item)) {
                    return true;
                }
                if (item && typeof item === 'object' && !Array.isArray(value)) {
                    if (parametersContainFromAi(value)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}
function validateFromAi(workflow, nodeTypes) {
    const violations = [];
    if (!workflow.nodes || workflow.nodes.length === 0) {
        return violations;
    }
    for (const node of workflow.nodes) {
        const nodeType = nodeTypes.find((type) => type.name === node.type);
        if (!nodeType) {
            continue;
        }
        if ((0, is_tool_1.isTool)(nodeType)) {
            continue;
        }
        if (node.parameters && parametersContainFromAi(node.parameters)) {
            violations.push({
                name: 'non-tool-node-uses-fromai',
                type: 'major',
                description: `Non-tool node "${node.name}" (${node.type}) uses $fromAI in its parameters. $fromAI is only for tool nodes connected to AI agents.`,
                pointsDeducted: 20,
            });
        }
    }
    return violations;
}
//# sourceMappingURL=from-ai.js.map