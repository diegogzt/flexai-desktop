import { z } from 'zod';
import { Z } from 'zod-class';
declare const SettingsUpdateRequestDto_base: Z.Class<{
    userActivated: z.ZodOptional<z.ZodBoolean>;
    allowSSOManualLogin: z.ZodOptional<z.ZodBoolean>;
    easyAIWorkflowOnboarded: z.ZodOptional<z.ZodBoolean>;
    dismissedCallouts: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
    aiConfig: z.ZodOptional<z.ZodObject<{
        provider: z.ZodEnum<["openai", "anthropic"]>;
        apiKey: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        provider: "openai" | "anthropic";
        apiKey: string;
    }, {
        provider: "openai" | "anthropic";
        apiKey: string;
    }>>;
}>;
export declare class SettingsUpdateRequestDto extends SettingsUpdateRequestDto_base {
}
export {};
