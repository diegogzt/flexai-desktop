"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTrigger = validateTrigger;
const isTriggerNode = (nodeType) => nodeType.group.includes('trigger');
function validateTrigger(workflow, nodeTypes) {
    const violations = [];
    const triggerNodes = [];
    if (!workflow.nodes || workflow.nodes.length === 0) {
        return violations;
    }
    for (const node of workflow.nodes) {
        const nodeType = nodeTypes.find((type) => type.name === node.type);
        if (!nodeType) {
            continue;
        }
        if (isTriggerNode(nodeType)) {
            triggerNodes.push(node.name);
        }
    }
    const hasTrigger = triggerNodes.length > 0;
    if (!hasTrigger) {
        violations.push({
            name: 'workflow-has-no-trigger',
            type: 'critical',
            description: 'Workflow must have at least one trigger node to start execution',
            pointsDeducted: 50,
        });
    }
    return violations;
}
//# sourceMappingURL=trigger.js.map