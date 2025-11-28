"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectApiClient = void 0;
class ProjectApiClient {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }
    async getPersonalProject() {
        const response = await this.apiClient.get('/projects/personal');
        return response.data.data.id;
    }
}
exports.ProjectApiClient = ProjectApiClient;
//# sourceMappingURL=project-api-client.js.map