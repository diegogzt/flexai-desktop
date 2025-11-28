"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableApiClient = void 0;
class DataTableApiClient {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }
    async getAllDataTables() {
        const response = await this.apiClient.get('/data-tables-global');
        return response.data.data.data;
    }
    async deleteDataTable(projectId, dataTableId) {
        await this.apiClient.delete(`/projects/${projectId}/data-tables/${dataTableId}`);
    }
    async createDataTable(projectId, dataTable) {
        const response = await this.apiClient.post(`/projects/${projectId}/data-tables`, {
            ...dataTable,
        });
        return response.data.data;
    }
}
exports.DataTableApiClient = DataTableApiClient;
//# sourceMappingURL=data-table-api-client.js.map