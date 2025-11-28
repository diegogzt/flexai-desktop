import { z } from 'zod';
import { Z } from 'zod-class';

export class AiValidateConfigRequestDto extends Z.class({
	provider: z.enum(['openai', 'anthropic']),
	apiKey: z.string(),
}) {}
