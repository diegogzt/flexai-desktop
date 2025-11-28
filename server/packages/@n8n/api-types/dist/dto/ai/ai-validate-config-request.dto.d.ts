import { z } from 'zod';
import { Z } from 'zod-class';
declare const AiValidateConfigRequestDto_base: Z.Class<{
    provider: z.ZodEnum<["openai", "anthropic"]>;
    apiKey: z.ZodString;
}>;
export declare class AiValidateConfigRequestDto extends AiValidateConfigRequestDto_base {
}
export {};
