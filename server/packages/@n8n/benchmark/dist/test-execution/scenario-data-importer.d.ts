import type { AuthenticatedN8nApiClient } from '../n8n-api-client/authenticated-n8n-api-client';
import type { LoadableScenarioData } from '../scenario/scenario-data-loader';
export declare class ScenarioDataImporter {
    private readonly workflowApiClient;
    private readonly credentialApiClient;
    private readonly dataTableApiClient;
    private readonly projectApiClient;
    constructor(n8nApiClient: AuthenticatedN8nApiClient);
    private replaceValuesInObject;
    importTestScenarioData(data: LoadableScenarioData): Promise<{
        dataTableId: string | undefined;
    }>;
    private importCredentials;
    private importDataTable;
    private importWorkflow;
    private findExistingCredentials;
    private findExistingWorkflows;
    private getBenchmarkCredentialName;
    private getBenchmarkWorkflowName;
    private getBenchmarkDataTableName;
}
