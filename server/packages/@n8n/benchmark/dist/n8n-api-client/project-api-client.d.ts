import type { AuthenticatedN8nApiClient } from './authenticated-n8n-api-client';
export declare class ProjectApiClient {
    private readonly apiClient;
    constructor(apiClient: AuthenticatedN8nApiClient);
    getPersonalProject(): Promise<string>;
}
