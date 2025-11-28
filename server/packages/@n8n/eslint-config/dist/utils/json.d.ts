import type { TSESTree } from '@typescript-eslint/utils';
export declare const isJsonParseCall: (node: TSESTree.CallExpression) => boolean;
export declare const isJsonStringifyCall: (node: TSESTree.CallExpression) => boolean;
