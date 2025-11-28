import { z } from 'zod';
export declare const usageStateSchema: z.ZodObject<{
    loading: z.ZodBoolean;
    data: z.ZodObject<{
        usage: z.ZodObject<{
            activeWorkflowTriggers: z.ZodObject<{
                limit: z.ZodNumber;
                value: z.ZodNumber;
                warningThreshold: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                value: number;
                limit: number;
                warningThreshold: number;
            }, {
                value: number;
                limit: number;
                warningThreshold: number;
            }>;
            workflowsHavingEvaluations: z.ZodObject<{
                limit: z.ZodNumber;
                value: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                value: number;
                limit: number;
            }, {
                value: number;
                limit: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            activeWorkflowTriggers: {
                value: number;
                limit: number;
                warningThreshold: number;
            };
            workflowsHavingEvaluations: {
                value: number;
                limit: number;
            };
        }, {
            activeWorkflowTriggers: {
                value: number;
                limit: number;
                warningThreshold: number;
            };
            workflowsHavingEvaluations: {
                value: number;
                limit: number;
            };
        }>;
        license: z.ZodObject<{
            planId: z.ZodString;
            planName: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            planId: string;
            planName: string;
        }, {
            planId: string;
            planName: string;
        }>;
        managementToken: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        usage: {
            activeWorkflowTriggers: {
                value: number;
                limit: number;
                warningThreshold: number;
            };
            workflowsHavingEvaluations: {
                value: number;
                limit: number;
            };
        };
        license: {
            planId: string;
            planName: string;
        };
        managementToken?: string | undefined;
    }, {
        usage: {
            activeWorkflowTriggers: {
                value: number;
                limit: number;
                warningThreshold: number;
            };
            workflowsHavingEvaluations: {
                value: number;
                limit: number;
            };
        };
        license: {
            planId: string;
            planName: string;
        };
        managementToken?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    data: {
        usage: {
            activeWorkflowTriggers: {
                value: number;
                limit: number;
                warningThreshold: number;
            };
            workflowsHavingEvaluations: {
                value: number;
                limit: number;
            };
        };
        license: {
            planId: string;
            planName: string;
        };
        managementToken?: string | undefined;
    };
    loading: boolean;
}, {
    data: {
        usage: {
            activeWorkflowTriggers: {
                value: number;
                limit: number;
                warningThreshold: number;
            };
            workflowsHavingEvaluations: {
                value: number;
                limit: number;
            };
        };
        license: {
            planId: string;
            planName: string;
        };
        managementToken?: string | undefined;
    };
    loading: boolean;
}>;
export type UsageState = z.infer<typeof usageStateSchema>;
