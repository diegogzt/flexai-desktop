import type { ESLint } from 'eslint';
export declare const localRulesPlugin: {
    configs: {
        recommended: {
            plugins: {
                'n8n-local-rules': {
                    meta: {
                        name: string;
                    };
                    configs: {};
                    rules: ESLint.Plugin["rules"];
                };
            };
            rules: {
                'n8n-local-rules/no-uncaught-json-parse': "error";
                'n8n-local-rules/no-json-parse-json-stringify': "error";
                'n8n-local-rules/no-unneeded-backticks': "error";
                'n8n-local-rules/no-interpolation-in-regular-string': "error";
                'n8n-local-rules/no-unused-param-in-catch-clause': "error";
                'n8n-local-rules/no-useless-catch-throw': "error";
                'n8n-local-rules/no-internal-package-import': "error";
            };
        };
    };
    meta: {
        name: string;
    };
    rules: ESLint.Plugin["rules"];
};
