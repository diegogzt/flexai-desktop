import { globalIgnores } from 'eslint/config';
import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import-x';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import stylisticPlugin from '@stylistic/eslint-plugin';
import unicornPlugin from 'eslint-plugin-unicorn';
import lodashPlugin from 'eslint-plugin-lodash';
import { localRulesPlugin } from '../plugin.js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
export const baseConfig = tseslint.config(globalIgnores([
    'node_modules/**',
    'dist/**',
    'eslint.config.mjs',
    'tsup.config.ts',
    'jest.config.js',
    'vite.config.ts',
    'vitest.config.ts',
]), eslint.configs.recommended, tseslint.configs.recommended, tseslint.configs.recommendedTypeChecked, importPlugin.flatConfigs.recommended, importPlugin.flatConfigs.typescript, eslintConfigPrettier, localRulesPlugin.configs.recommended, {
    plugins: {
        'unused-imports': unusedImportsPlugin,
        '@stylistic': stylisticPlugin,
        lodash: lodashPlugin,
        unicorn: unicornPlugin,
        '@typescript-eslint': typescriptPlugin,
    },
    languageOptions: {
        parserOptions: {
            projectService: true,
        },
    },
    settings: {
        'import-x/resolver-next': [createTypeScriptImportResolver()],
    },
    rules: {
        'id-denylist': [
            'error',
            'err',
            'cb',
            'callback',
            'any',
            'Number',
            'number',
            'String',
            'string',
            'Boolean',
            'boolean',
            'Undefined',
            'undefined',
        ],
        'no-void': ['error', { allowAsStatement: true }],
        indent: 'off',
        'no-constant-binary-expression': 'error',
        'sort-imports': 'off',
        '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': true }],
        '@typescript-eslint/no-restricted-types': [
            'error',
            {
                types: {
                    Object: {
                        message: 'Use object instead',
                        fixWith: 'object',
                    },
                    String: {
                        message: 'Use string instead',
                        fixWith: 'string',
                    },
                    Boolean: {
                        message: 'Use boolean instead',
                        fixWith: 'boolean',
                    },
                    Number: {
                        message: 'Use number instead',
                        fixWith: 'number',
                    },
                    Symbol: {
                        message: 'Use symbol instead',
                        fixWith: 'symbol',
                    },
                    Function: {
                        message: [
                            'The `Function` type accepts any function-like value.',
                            'It provides no type safety when calling the function, which can be a common source of bugs.',
                            'It also accepts things like class declarations, which will throw at runtime as they will not be called with `new`.',
                            'If you are expecting the function to accept certain arguments, you should explicitly define the function shape.',
                        ].join('\n'),
                    },
                },
            },
        ],
        '@typescript-eslint/consistent-type-assertions': 'error',
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/consistent-type-exports': 'error',
        '@stylistic/member-delimiter-style': [
            'error',
            {
                multiline: {
                    delimiter: 'semi',
                    requireLast: true,
                },
                singleline: {
                    delimiter: 'semi',
                    requireLast: false,
                },
            },
        ],
        '@stylistic/ident': 'off',
        '@typescript-eslint/naming-convention': [
            'error',
            {
                selector: 'default',
                format: ['camelCase'],
            },
            {
                selector: 'import',
                format: ['camelCase', 'PascalCase'],
            },
            {
                selector: 'variable',
                format: ['camelCase', 'snake_case', 'UPPER_CASE', 'PascalCase'],
                leadingUnderscore: 'allowSingleOrDouble',
                trailingUnderscore: 'allowSingleOrDouble',
            },
            {
                selector: 'property',
                format: ['camelCase', 'snake_case', 'UPPER_CASE'],
                leadingUnderscore: 'allowSingleOrDouble',
                trailingUnderscore: 'allowSingleOrDouble',
            },
            {
                selector: 'typeLike',
                format: ['PascalCase'],
            },
            {
                selector: ['method', 'function', 'parameter'],
                format: ['camelCase'],
                leadingUnderscore: 'allowSingleOrDouble',
            },
        ],
        '@typescript-eslint/no-invalid-void-type': 'error',
        '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
        '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/only-throw-error': 'error',
        '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
        '@typescript-eslint/no-unnecessary-qualifier': 'error',
        '@typescript-eslint/no-unused-expressions': 'error',
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',
        '@typescript-eslint/promise-function-async': 'error',
        '@typescript-eslint/triple-slash-reference': 'off',
        '@typescript-eslint/return-await': ['error', 'always'],
        '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
        'import-x/no-cycle': ['error', { ignoreExternal: false, maxDepth: 3 }],
        'import-x/no-default-export': 'error',
        'import-x/order': [
            'error',
            {
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: true,
                },
                groups: [['builtin', 'external'], 'internal', ['parent', 'index', 'sibling'], 'object'],
                'newlines-between': 'always',
            },
        ],
        'import-x/no-duplicates': 'error',
        'import-x/prefer-default-export': 'off',
        'import-x/named': 'off',
        'import-x/namespace': 'off',
        'import-x/default': 'off',
        'import-x/no-named-as-default-member': 'off',
        'import-x/no-unresolved': 'off',
        'class-methods-use-this': 'off',
        eqeqeq: 'error',
        'no-plusplus': 'off',
        'object-shorthand': 'error',
        'prefer-const': 'error',
        'prefer-spread': 'off',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-restricted-syntax': [
            'error',
            {
                selector: 'TSEnumDeclaration:not([const=true])',
                message: 'Do not declare raw enums as it leads to runtime overhead. Use const enum instead. See https://www.typescriptlang.org/docs/handbook/enums.html#const-enums',
            },
        ],
        'unused-imports/no-unused-imports': process.env.NODE_ENV === 'development' ? 'warn' : 'error',
        'unicorn/no-unnecessary-await': 'error',
        'unicorn/no-useless-promise-resolve-reject': 'error',
        'lodash/path-style': ['error', 'as-needed'],
        'lodash/import-scope': ['error', 'method'],
    },
}, {
    files: ['test/**/*.ts', '**/__tests__/*.ts', '**/*.test.ts', '**/*.cy.ts'],
    rules: {
        'n8n-local-rules/no-plain-errors': 'off',
        '@typescript-eslint/unbound-method': 'off',
        'n8n-local-rules/no-skipped-tests': process.env.NODE_ENV === 'development' ? 'warn' : 'error',
    },
});
//# sourceMappingURL=base.js.map