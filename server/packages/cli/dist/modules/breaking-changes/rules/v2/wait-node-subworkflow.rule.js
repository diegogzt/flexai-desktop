"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitNodeSubworkflowRule = void 0;
const di_1 = require("@n8n/di");
const n8n_workflow_1 = require("n8n-workflow");
let WaitNodeSubworkflowRule = class WaitNodeSubworkflowRule {
    constructor() {
        this.id = 'wait-node-subworkflow-v2';
        this.waitingNodeConfig = [
            {
                nodeTypes: [
                    'n8n-nodes-base.wait',
                    'n8n-nodes-base.form',
                    '@n8n/n8n-nodes-langchain.chat',
                    'n8n-nodes-base.respondToWebhook',
                ],
            },
            {
                nodeTypes: [
                    'n8n-nodes-base.slack',
                    'n8n-nodes-base.telegram',
                    'n8n-nodes-base.googleChat',
                    'n8n-nodes-base.gmail',
                    'n8n-nodes-base.emailSend',
                    'n8n-nodes-base.whatsApp',
                    'n8n-nodes-base.microsoftTeams',
                    'n8n-nodes-base.microsoftOutlook',
                    'n8n-nodes-base.discord',
                ],
                operation: n8n_workflow_1.SEND_AND_WAIT_OPERATION,
            },
            {
                nodeTypes: ['n8n-nodes-base.github'],
                operation: 'dispatchAndWait',
            },
        ];
    }
    getMetadata() {
        return {
            version: 'v2',
            title: 'Waiting node behavior change in sub-workflows',
            description: 'Waiting nodes (Wait, Form, and HITL nodes) in sub-workflows now return data from the last node instead of the node before the waiting node',
            category: "workflow",
            severity: 'medium',
            documentationUrl: 'https://docs.n8n.io/2-0-breaking-changes/#return-expected-sub-workflow-data-when-it-contains-a-wait-node',
        };
    }
    async getRecommendations(_workflowResults) {
        return [
            {
                action: 'Review sub-workflow output handling',
                description: 'Check workflows that use Execute Workflow node to call sub-workflows containing waiting nodes (Wait, Form, or HITL nodes). The output data structure may have changed.',
            },
            {
                action: 'Update downstream logic',
                description: 'Adjust any logic in parent workflows that depends on the data returned from sub-workflows with waiting nodes, as it now returns the last node data instead of the node before the waiting node.',
            },
            {
                action: 'Test affected workflows',
                description: 'Test all workflows with Execute Workflow nodes calling sub-workflows that contain waiting nodes to ensure the new behavior works as expected.',
            },
        ];
    }
    hasWaitingOperation(node, requiredOperation) {
        const operation = node.parameters.operation;
        return operation === requiredOperation;
    }
    async detectWorkflow(_workflow, nodesGroupedByType) {
        const foundWaitingNodes = [];
        for (const { nodeTypes, operation } of this.waitingNodeConfig) {
            for (const nodeType of nodeTypes) {
                const nodes = nodesGroupedByType.get(nodeType) ?? [];
                const waitingNodes = operation
                    ? nodes.filter((node) => this.hasWaitingOperation(node, operation))
                    : nodes;
                for (const node of waitingNodes) {
                    const nodeTypeName = nodeType.split('.').pop() ?? nodeType;
                    foundWaitingNodes.push({ node, nodeTypeName });
                }
            }
        }
        if (foundWaitingNodes.length === 0) {
            return { isAffected: false, issues: [] };
        }
        const executeWorkflowTriggerNodes = nodesGroupedByType.get('n8n-nodes-base.executeWorkflowTrigger') ?? [];
        if (executeWorkflowTriggerNodes.length === 0) {
            return { isAffected: false, issues: [] };
        }
        const issues = foundWaitingNodes.map(({ node, nodeTypeName }) => ({
            title: 'Sub-workflow with waiting node has changed output behavior',
            description: `This workflow is a sub-workflow (contains Execute Workflow Trigger) with a waiting node (${nodeTypeName}). The data returned to the parent workflow from sub-workflows containing waiting nodes has changed. Previously, the child workflow returned data from the node before the waiting node. Now they return data from the last node in the workflow.`,
            level: 'warning',
            nodeId: node.id,
            nodeName: node.name,
        }));
        return {
            isAffected: true,
            issues,
        };
    }
};
exports.WaitNodeSubworkflowRule = WaitNodeSubworkflowRule;
exports.WaitNodeSubworkflowRule = WaitNodeSubworkflowRule = __decorate([
    (0, di_1.Service)()
], WaitNodeSubworkflowRule);
//# sourceMappingURL=wait-node-subworkflow.rule.js.map