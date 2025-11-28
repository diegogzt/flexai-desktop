import type { IRestApiContext } from '../types';
import { makeRestApiRequest } from '../utils';

export async function validateAiConfig(
	context: IRestApiContext,
	config: { provider: string; apiKey: string },
): Promise<void> {
	await makeRestApiRequest(context, 'POST', '/ai/validate-config', config);
}
