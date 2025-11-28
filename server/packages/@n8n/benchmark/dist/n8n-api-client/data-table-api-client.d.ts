import type { DataTable } from '../n8n-api-client/n8n-api-client.types';
import type { AuthenticatedN8nApiClient } from './authenticated-n8n-api-client';
export declare class DataTableApiClient {
    private readonly apiClient;
    constructor(apiClient: AuthenticatedN8nApiClient);
    getAllDataTables(): Promise<DataTable[]>;
    deleteDataTable(projectId: string, dataTableId: DataTable['id']): Promise<void>;
    createDataTable(projectId: string, dataTable: DataTable): Promise<DataTable>;
}
