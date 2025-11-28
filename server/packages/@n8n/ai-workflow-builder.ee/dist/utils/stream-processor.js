"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_WORKFLOW_UPDATE_TOOLS = void 0;
exports.processStreamChunk = processStreamChunk;
exports.createStreamProcessor = createStreamProcessor;
exports.cleanContextTags = cleanContextTags;
exports.formatMessages = formatMessages;
const messages_1 = require("@langchain/core/messages");
function isAgentUpdateChunk(chunk) {
    return (typeof chunk === 'object' &&
        chunk !== null &&
        ('agent' in chunk ||
            'compact_messages' in chunk ||
            'delete_messages' in chunk ||
            'process_operations' in chunk));
}
function isToolProgressChunk(chunk) {
    return typeof chunk === 'object' && chunk !== null && 'type' in chunk && chunk.type === 'tool';
}
exports.DEFAULT_WORKFLOW_UPDATE_TOOLS = [
    'add_nodes',
    'connect_nodes',
    'update_node_parameters',
    'remove_node',
];
function getLastMessage(messages) {
    if (!messages || messages.length === 0) {
        return null;
    }
    return messages[messages.length - 1];
}
function extractTextFromContent(content) {
    if (Array.isArray(content)) {
        return content
            .filter((part) => part.type === 'text')
            .map((part) => part.text)
            .join('\n');
    }
    return content;
}
function createMessageChunk(text) {
    return {
        role: 'assistant',
        type: 'message',
        text,
    };
}
function processDeleteMessages(chunk) {
    const messages = chunk.delete_messages?.messages;
    if (!messages || messages.length === 0) {
        return null;
    }
    return { messages: [createMessageChunk('Deleted, refresh?')] };
}
function processCompactMessages(chunk) {
    const lastMessage = getLastMessage(chunk.compact_messages?.messages);
    if (!lastMessage) {
        return null;
    }
    const text = extractTextFromContent(lastMessage.content);
    return { messages: [createMessageChunk(text)] };
}
function processAgentMessages(chunk) {
    const lastMessage = getLastMessage(chunk.agent?.messages);
    if (!lastMessage?.content) {
        return null;
    }
    const text = extractTextFromContent(lastMessage.content);
    if (!text) {
        return null;
    }
    return { messages: [createMessageChunk(text)] };
}
function processOperations(chunk) {
    const update = chunk.process_operations;
    if (!update?.workflowJSON || update.workflowOperations === undefined) {
        return null;
    }
    const workflowUpdateChunk = {
        role: 'assistant',
        type: 'workflow-updated',
        codeSnippet: JSON.stringify(update.workflowJSON, null, 2),
    };
    return { messages: [workflowUpdateChunk] };
}
function processCustomToolChunk(chunk) {
    if (!isToolProgressChunk(chunk)) {
        return null;
    }
    return { messages: [chunk] };
}
function processStreamChunk(streamMode, chunk) {
    if (streamMode === 'updates') {
        if (!isAgentUpdateChunk(chunk)) {
            return null;
        }
        return (processDeleteMessages(chunk) ??
            processCompactMessages(chunk) ??
            processAgentMessages(chunk) ??
            processOperations(chunk));
    }
    if (streamMode === 'custom') {
        return processCustomToolChunk(chunk);
    }
    return null;
}
async function* createStreamProcessor(stream) {
    for await (const [streamMode, chunk] of stream) {
        const output = processStreamChunk(streamMode, chunk);
        if (output) {
            yield output;
        }
    }
}
function cleanContextTags(text) {
    return text.replace(/\n*<current_workflow_json>[\s\S]*?<\/current_execution_nodes_schemas>/, '');
}
function formatHumanMessage(msg) {
    if (Array.isArray(msg.content)) {
        const textParts = msg.content.filter((c) => typeof c === 'object' && c !== null && 'type' in c && c.type === 'text' && 'text' in c);
        const text = textParts.map((part) => cleanContextTags(part.text)).join('\n');
        return {
            role: 'user',
            type: 'message',
            text,
        };
    }
    return {
        role: 'user',
        type: 'message',
        text: cleanContextTags(msg.content),
    };
}
function processArrayContent(content) {
    const textMessages = content.filter((c) => typeof c === 'object' && c !== null && 'type' in c && c.type === 'text' && 'text' in c);
    return textMessages.map((textMessage) => ({
        role: 'assistant',
        type: 'message',
        text: textMessage.text,
    }));
}
function processAIMessageContent(msg) {
    if (!msg.content) {
        return [];
    }
    if (Array.isArray(msg.content)) {
        return processArrayContent(msg.content);
    }
    return [
        {
            role: 'assistant',
            type: 'message',
            text: msg.content,
        },
    ];
}
function createToolCallMessage(toolCall, builderTool) {
    return {
        id: toolCall.id,
        toolCallId: toolCall.id,
        role: 'assistant',
        type: 'tool',
        toolName: toolCall.name,
        displayTitle: builderTool?.displayTitle,
        customDisplayTitle: toolCall.args && builderTool?.getCustomDisplayTitle?.(toolCall.args),
        status: 'completed',
        updates: [
            {
                type: 'input',
                data: toolCall.args || {},
            },
        ],
    };
}
function processToolCalls(toolCalls, builderTools) {
    return toolCalls.map((toolCall) => {
        const builderTool = builderTools?.find((bt) => bt.toolName === toolCall.name);
        return createToolCallMessage(toolCall, builderTool);
    });
}
function processToolMessage(msg, formattedMessages) {
    const toolCallId = msg.tool_call_id;
    for (let i = formattedMessages.length - 1; i >= 0; i--) {
        const m = formattedMessages[i];
        if (m.type === 'tool' && m.id === toolCallId) {
            m.updates ??= [];
            m.updates.push({
                type: 'output',
                data: typeof msg.content === 'string' ? { result: msg.content } : msg.content,
            });
            break;
        }
    }
}
function formatMessages(messages, builderTools) {
    const formattedMessages = [];
    for (const msg of messages) {
        if (msg instanceof messages_1.HumanMessage) {
            formattedMessages.push(formatHumanMessage(msg));
        }
        else if (msg instanceof messages_1.AIMessage) {
            formattedMessages.push(...processAIMessageContent(msg));
            if (msg.tool_calls?.length) {
                formattedMessages.push(...processToolCalls(msg.tool_calls, builderTools));
            }
        }
        else if (msg instanceof messages_1.ToolMessage) {
            processToolMessage(msg, formattedMessages);
        }
    }
    return formattedMessages;
}
//# sourceMappingURL=stream-processor.js.map