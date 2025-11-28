"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBuilderTools = getBuilderTools;
exports.getBuilderToolsForDisplay = getBuilderToolsForDisplay;
const add_node_tool_1 = require("./add-node.tool");
const categorize_prompt_tool_1 = require("./categorize-prompt.tool");
const connect_nodes_tool_1 = require("./connect-nodes.tool");
const get_best_practices_tool_1 = require("./get-best-practices.tool");
const get_node_parameter_tool_1 = require("./get-node-parameter.tool");
const node_details_tool_1 = require("./node-details.tool");
const node_search_tool_1 = require("./node-search.tool");
const remove_connection_tool_1 = require("./remove-connection.tool");
const remove_node_tool_1 = require("./remove-node.tool");
const update_node_parameters_tool_1 = require("./update-node-parameters.tool");
const validate_workflow_tool_1 = require("./validate-workflow.tool");
function getBuilderTools({ parsedNodeTypes, logger, llmComplexTask, instanceUrl, }) {
    return [
        (0, categorize_prompt_tool_1.createCategorizePromptTool)(llmComplexTask, logger),
        (0, get_best_practices_tool_1.createGetBestPracticesTool)(),
        (0, node_search_tool_1.createNodeSearchTool)(parsedNodeTypes),
        (0, node_details_tool_1.createNodeDetailsTool)(parsedNodeTypes),
        (0, add_node_tool_1.createAddNodeTool)(parsedNodeTypes),
        (0, connect_nodes_tool_1.createConnectNodesTool)(parsedNodeTypes, logger),
        (0, remove_connection_tool_1.createRemoveConnectionTool)(logger),
        (0, remove_node_tool_1.createRemoveNodeTool)(logger),
        (0, update_node_parameters_tool_1.createUpdateNodeParametersTool)(parsedNodeTypes, llmComplexTask, logger, instanceUrl),
        (0, get_node_parameter_tool_1.createGetNodeParameterTool)(),
        (0, validate_workflow_tool_1.createValidateWorkflowTool)(parsedNodeTypes, logger),
    ];
}
function getBuilderToolsForDisplay({ nodeTypes, }) {
    return [
        categorize_prompt_tool_1.CATEGORIZE_PROMPT_TOOL,
        get_best_practices_tool_1.GET_BEST_PRACTICES_TOOL,
        node_search_tool_1.NODE_SEARCH_TOOL,
        node_details_tool_1.NODE_DETAILS_TOOL,
        (0, add_node_tool_1.getAddNodeToolBase)(nodeTypes),
        connect_nodes_tool_1.CONNECT_NODES_TOOL,
        remove_connection_tool_1.REMOVE_CONNECTION_TOOL,
        remove_node_tool_1.REMOVE_NODE_TOOL,
        update_node_parameters_tool_1.UPDATING_NODE_PARAMETER_TOOL,
        get_node_parameter_tool_1.GET_NODE_PARAMETER_TOOL,
        validate_workflow_tool_1.VALIDATE_WORKFLOW_TOOL,
    ];
}
//# sourceMappingURL=builder-tools.js.map