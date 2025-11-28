"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTools = validateTools;
const expressions_1 = require("../utils/expressions");
const is_tool_1 = require("../utils/is-tool");
const toolsWithoutParameters = [
    '@n8n/n8n-nodes-langchain.toolCalculator',
    '@n8n/n8n-nodes-langchain.toolVectorStore',
    '@n8n/n8n-nodes-langchain.vectorStoreInMemory',
    '@n8n/n8n-nodes-langchain.mcpClientTool',
    '@n8n/n8n-nodes-langchain.toolWikipedia',
    '@n8n/n8n-nodes-langchain.toolSerpApi',
];
function validateTools(workflow, nodeTypes) {
    const violations = [];
    if (!workflow.nodes || workflow.nodes.length === 0) {
        return violations;
    }
    for (const node of workflow.nodes) {
        const nodeType = nodeTypes.find((type) => type.name === node.type);
        if (!nodeType) {
            continue;
        }
        if ((0, is_tool_1.isTool)(nodeType) && !toolsWithoutParameters.includes(node.type)) {
            if (!node.parameters || Object.keys(node.parameters).length === 0) {
                violations.push({
                    name: 'tool-node-has-no-parameters',
                    type: 'major',
                    description: `Tool node "${node.name}" has no parameters set.`,
                    pointsDeducted: 20,
                });
                continue;
            }
            if (!(0, expressions_1.nodeParametersContainExpression)(node.parameters)) {
                violations.push({
                    name: 'tool-node-static-parameters',
                    type: 'major',
                    description: `Tool node "${node.name}" has no expressions in its parameters. This likely means it is not using dynamic input.`,
                    pointsDeducted: 20,
                });
            }
        }
    }
    return violations;
}
//# sourceMappingURL=tools.js.map