import type { Credential } from '../n8n-api-client/n8n-api-client.types';
import type { AuthenticatedN8nApiClient } from './authenticated-n8n-api-client';
export declare class CredentialApiClient {
    private readonly apiClient;
    constructor(apiClient: AuthenticatedN8nApiClient);
    getAllCredentials(): Promise<Credential[]>;
    createCredential(credential: Credential): Promise<Credential>;
    deleteCredential(credentialId: Credential['id']): Promise<void>;
}
