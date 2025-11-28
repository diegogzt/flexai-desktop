export const isJsonParseCall = (node) => node.callee.type === 'MemberExpression' &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'JSON' &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === 'parse';
export const isJsonStringifyCall = (node) => {
    const parseArg = node.arguments?.[0];
    return (parseArg !== undefined &&
        parseArg.type === 'CallExpression' &&
        parseArg.callee.type === 'MemberExpression' &&
        parseArg.callee.object.type === 'Identifier' &&
        parseArg.callee.object.name === 'JSON' &&
        parseArg.callee.property.type === 'Identifier' &&
        parseArg.callee.property.name === 'stringify');
};
//# sourceMappingURL=json.js.map