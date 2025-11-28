"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateConnections = validateConnections;
const n8n_workflow_1 = require("n8n-workflow");
const node_helpers_1 = require("../../utils/node-helpers");
const resolve_connections_1 = require("../../validation/utils/resolve-connections");
function getProvidedInputTypes(nodeConnections) {
    const providedInputTypes = new Map();
    if (!nodeConnections)
        return providedInputTypes;
    for (const [connectionType, connections] of Object.entries(nodeConnections)) {
        let totalConnections = 0;
        for (const connectionSet of connections) {
            if (!connectionSet)
                continue;
            totalConnections += connectionSet.length;
        }
        if (totalConnections > 0) {
            providedInputTypes.set(connectionType, totalConnections);
        }
    }
    return providedInputTypes;
}
function checkMissingRequiredInputs(nodeInfo, providedInputTypes) {
    const issues = [];
    if (!nodeInfo.resolvedInputs)
        return issues;
    for (const input of nodeInfo.resolvedInputs) {
        const providedCount = providedInputTypes.get(input.type) ?? 0;
        if (input.required && providedCount === 0) {
            issues.push({
                name: 'node-missing-required-input',
                type: 'critical',
                description: `Node ${nodeInfo.node.name} (${nodeInfo.node.type}) is missing required input of type ${input.type}`,
                pointsDeducted: 50,
            });
        }
    }
    return issues;
}
function checkUnsupportedConnections(nodeInfo, providedInputTypes) {
    const issues = [];
    if (!nodeInfo.resolvedInputs)
        return issues;
    const supportedTypes = new Set(nodeInfo.resolvedInputs.map((input) => input.type));
    for (const [type] of providedInputTypes) {
        if (!supportedTypes.has(type)) {
            issues.push({
                name: 'node-unsupported-connection-input',
                type: 'critical',
                description: `Node ${nodeInfo.node.name} (${nodeInfo.node.type}) received unsupported connection type ${type}`,
                pointsDeducted: 50,
            });
        }
    }
    return issues;
}
function checkMergeNodeConnections(nodeInfo, nodeConnections) {
    const issues = [];
    if (/\.merge$/.test(nodeInfo.node.type)) {
        const providedInputTypes = getProvidedInputTypes(nodeConnections);
        const totalInputConnections = providedInputTypes.get('main') ?? 0;
        if (totalInputConnections < 2) {
            issues.push({
                name: 'node-merge-single-input',
                type: 'major',
                description: `Merge node ${nodeInfo.node.name} has only ${totalInputConnections} input connection(s). Merge nodes require at least 2 inputs to function properly.`,
                pointsDeducted: 20,
            });
        }
        const expectedInputs = nodeInfo.resolvedInputs?.filter((input) => input.type === 'main').length ?? 1;
        if (totalInputConnections !== expectedInputs) {
            issues.push({
                name: 'node-merge-incorrect-num-inputs',
                type: 'minor',
                description: `Merge node ${nodeInfo.node.name} has ${totalInputConnections} input connections but is configured to accept ${expectedInputs}.`,
                pointsDeducted: 10,
            });
        }
        const mainConnections = nodeConnections?.main ?? [];
        const missingIndexes = [];
        for (let inputIndex = 0; inputIndex < expectedInputs; inputIndex++) {
            const connectionsForIndex = mainConnections[inputIndex];
            const hasConnections = Array.isArray(connectionsForIndex) && connectionsForIndex.length > 0;
            if (!hasConnections) {
                missingIndexes.push(inputIndex + 1);
            }
        }
        if (missingIndexes.length > 0) {
            issues.push({
                name: 'node-merge-missing-input',
                type: 'major',
                description: `Merge node ${nodeInfo.node.name} is missing connections for input(s) ${missingIndexes.join(', ')}.`,
                pointsDeducted: 20,
            });
        }
    }
    return issues;
}
function checkSubNodeRootConnections(workflow, nodeInfo, nodesByName) {
    const issues = [];
    const { node, nodeType, resolvedOutputs } = nodeInfo;
    if (!resolvedOutputs || resolvedOutputs.size === 0) {
        return issues;
    }
    if (!(0, node_helpers_1.isSubNode)(nodeType, node)) {
        return issues;
    }
    const aiOutputs = Array.from(resolvedOutputs).filter((output) => output.startsWith('ai_'));
    if (aiOutputs.length === 0) {
        return issues;
    }
    const nodeConnections = workflow.connections?.[node.name];
    for (const outputType of aiOutputs) {
        const connectionsForType = nodeConnections?.[outputType];
        const hasRootConnection = connectionsForType?.some((connectionGroup) => connectionGroup?.some((connection) => connection?.node && nodesByName.has(connection.node)));
        if (!hasRootConnection) {
            issues.push({
                name: 'sub-node-not-connected',
                type: 'critical',
                description: `Sub-node ${node.name} (${node.type}) provides ${outputType} but is not connected to a root node.`,
                pointsDeducted: 50,
            });
        }
    }
    return issues;
}
function validateConnections(workflow, nodeTypes) {
    const violations = [];
    if (!workflow.connections) {
        workflow.connections = {};
    }
    const connectionsByDestination = (0, n8n_workflow_1.mapConnectionsByDestination)(workflow.connections);
    const nodesByName = new Map(workflow.nodes.map((node) => [node.name, node]));
    const nodeTypeMap = new Map(nodeTypes.map((type) => [type.name, type]));
    for (const node of workflow.nodes) {
        const nodeType = nodeTypeMap.get(node.type);
        if (!nodeType) {
            violations.push({
                name: 'node-type-not-found',
                type: 'critical',
                description: `Node type ${node.type} not found for node ${node.name}`,
                pointsDeducted: 50,
            });
            continue;
        }
        const nodeInfo = { node, nodeType };
        try {
            nodeInfo.resolvedInputs = (0, resolve_connections_1.resolveNodeInputs)(nodeInfo);
            nodeInfo.resolvedOutputs = (0, resolve_connections_1.resolveNodeOutputs)(nodeInfo);
        }
        catch (error) {
            violations.push({
                name: 'failed-to-resolve-connections',
                type: 'critical',
                description: `Failed to resolve connections for node ${node.name} (${node.type}): ${error instanceof Error ? error.message : String(error)}`,
                pointsDeducted: 50,
            });
            continue;
        }
        const nodeConnections = connectionsByDestination[node.name];
        const providedInputTypes = getProvidedInputTypes(nodeConnections);
        violations.push(...checkMissingRequiredInputs(nodeInfo, providedInputTypes));
        violations.push(...checkUnsupportedConnections(nodeInfo, providedInputTypes));
        violations.push(...checkMergeNodeConnections(nodeInfo, nodeConnections));
        violations.push(...checkSubNodeRootConnections(workflow, nodeInfo, nodesByName));
    }
    return violations;
}
//# sourceMappingURL=connections.js.map