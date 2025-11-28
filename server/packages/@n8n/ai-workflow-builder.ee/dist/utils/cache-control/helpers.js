"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserToolMessageIndices = findUserToolMessageIndices;
exports.cleanStaleWorkflowContext = cleanStaleWorkflowContext;
exports.applyCacheControlMarkers = applyCacheControlMarkers;
const messages_1 = require("@langchain/core/messages");
function isTextBlock(block) {
    return (typeof block === 'object' &&
        block !== null &&
        'text' in block &&
        typeof block.text === 'string');
}
function hasCacheControl(block) {
    return typeof block === 'object' && block !== null && 'cache_control' in block;
}
function findUserToolMessageIndices(messages) {
    const userToolIndices = [];
    for (let i = 0; i < messages.length; i++) {
        if (messages[i] instanceof messages_1.HumanMessage || messages[i] instanceof messages_1.ToolMessage) {
            userToolIndices.push(i);
        }
    }
    return userToolIndices;
}
function cleanStaleWorkflowContext(messages, userToolIndices) {
    if (userToolIndices.length === 0) {
        return;
    }
    for (let i = 0; i < userToolIndices.length - 1; i++) {
        const idx = userToolIndices[i];
        const message = messages[idx];
        if (typeof message.content === 'string') {
            message.content = message.content.replace(/\n*<current_workflow_json>[\s\S]*?<\/current_execution_nodes_schemas>/, '');
        }
        if (Array.isArray(message.content)) {
            for (const block of message.content) {
                if (hasCacheControl(block)) {
                    delete block.cache_control;
                }
            }
        }
    }
}
function applyCacheControlMarkers(messages, userToolIndices, workflowContext) {
    if (userToolIndices.length === 0) {
        return;
    }
    const lastIdx = userToolIndices[userToolIndices.length - 1];
    const lastMessage = messages[lastIdx];
    if (typeof lastMessage.content === 'string') {
        lastMessage.content = lastMessage.content + workflowContext;
    }
    if (userToolIndices.length > 1) {
        const secondToLastIdx = userToolIndices[userToolIndices.length - 2];
        const secondToLastMessage = messages[secondToLastIdx];
        if (typeof secondToLastMessage.content === 'string') {
            secondToLastMessage.content = [
                {
                    type: 'text',
                    text: secondToLastMessage.content,
                    cache_control: { type: 'ephemeral' },
                },
            ];
        }
        else if (Array.isArray(secondToLastMessage.content)) {
            const lastBlock = secondToLastMessage.content[secondToLastMessage.content.length - 1];
            if (isTextBlock(lastBlock)) {
                lastBlock.cache_control = { type: 'ephemeral' };
            }
        }
    }
    const lastUserToolIdx = userToolIndices[userToolIndices.length - 1];
    const lastUserToolMessage = messages[lastUserToolIdx];
    if (typeof lastUserToolMessage.content === 'string') {
        lastUserToolMessage.content = [
            {
                type: 'text',
                text: lastUserToolMessage.content,
                cache_control: { type: 'ephemeral' },
            },
        ];
    }
    else if (Array.isArray(lastUserToolMessage.content)) {
        const lastBlock = lastUserToolMessage.content[lastUserToolMessage.content.length - 1];
        if (isTextBlock(lastBlock)) {
            lastBlock.cache_control = { type: 'ephemeral' };
        }
    }
}
//# sourceMappingURL=helpers.js.map