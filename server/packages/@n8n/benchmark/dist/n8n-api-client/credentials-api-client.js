"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialApiClient = void 0;
class CredentialApiClient {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }
    async getAllCredentials() {
        const response = await this.apiClient.get('/credentials');
        return response.data.data;
    }
    async createCredential(credential) {
        const response = await this.apiClient.post('/credentials', {
            ...credential,
            id: undefined,
        });
        return response.data.data;
    }
    async deleteCredential(credentialId) {
        await this.apiClient.delete(`/credentials/${credentialId}`);
    }
}
exports.CredentialApiClient = CredentialApiClient;
//# sourceMappingURL=credentials-api-client.js.map