"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScenarioDataImporter = void 0;
const credentials_api_client_1 = require("../n8n-api-client/credentials-api-client");
const data_table_api_client_1 = require("../n8n-api-client/data-table-api-client");
const project_api_client_1 = require("../n8n-api-client/project-api-client");
const workflows_api_client_1 = require("../n8n-api-client/workflows-api-client");
class ScenarioDataImporter {
    constructor(n8nApiClient) {
        this.workflowApiClient = new workflows_api_client_1.WorkflowApiClient(n8nApiClient);
        this.credentialApiClient = new credentials_api_client_1.CredentialApiClient(n8nApiClient);
        this.dataTableApiClient = new data_table_api_client_1.DataTableApiClient(n8nApiClient);
        this.projectApiClient = new project_api_client_1.ProjectApiClient(n8nApiClient);
    }
    replaceValuesInObject(obj, searchText, targetText) {
        if (Array.isArray(obj)) {
            obj.map((item) => this.replaceValuesInObject(item, searchText, targetText));
        }
        else if (typeof obj === 'object' && obj !== null) {
            for (const [key, value] of Object.entries(obj)) {
                if (typeof value === 'string' && value === searchText) {
                    obj[key] = targetText;
                }
                else {
                    this.replaceValuesInObject(value, searchText, targetText);
                }
            }
        }
    }
    async importTestScenarioData(data) {
        const existingWorkflows = await this.workflowApiClient.getAllWorkflows();
        const existingCredentials = await this.credentialApiClient.getAllCredentials();
        const existingDataTables = await this.dataTableApiClient.getAllDataTables();
        for (const credential of data.credentials) {
            const createdCredential = await this.importCredentials({ existingCredentials, credential });
            for (const workflow of data.workflows) {
                this.replaceValuesInObject(workflow, credential.id, createdCredential.id);
                this.replaceValuesInObject(workflow, credential.name, createdCredential.name);
            }
        }
        for (const workflow of data.workflows) {
            await this.importWorkflow({ existingWorkflows, workflow });
        }
        let dataTableId;
        if (data.dataTable) {
            dataTableId = await this.importDataTable({ existingDataTables, dataTable: data.dataTable });
        }
        return { dataTableId };
    }
    async importCredentials(opts) {
        const existingCredentials = this.findExistingCredentials(opts.existingCredentials, opts.credential);
        if (existingCredentials.length > 0) {
            for (const toDelete of existingCredentials) {
                await this.credentialApiClient.deleteCredential(toDelete.id);
            }
        }
        return await this.credentialApiClient.createCredential({
            ...opts.credential,
            name: this.getBenchmarkCredentialName(opts.credential),
        });
    }
    async importDataTable(opts) {
        const { existingDataTables, dataTable } = opts;
        const projectId = await this.projectApiClient.getPersonalProject();
        const existingTable = existingDataTables.find((dt) => dt.name === this.getBenchmarkDataTableName(dataTable));
        if (existingTable) {
            await this.dataTableApiClient.deleteDataTable(projectId, existingTable.id);
        }
        const { id } = await this.dataTableApiClient.createDataTable(projectId, {
            ...dataTable,
            name: this.getBenchmarkDataTableName(dataTable),
        });
        return id;
    }
    async importWorkflow(opts) {
        const existingWorkflows = this.findExistingWorkflows(opts.existingWorkflows, opts.workflow);
        if (existingWorkflows.length > 0) {
            for (const toDelete of existingWorkflows) {
                await this.workflowApiClient.archiveWorkflow(toDelete.id);
                await this.workflowApiClient.deleteWorkflow(toDelete.id);
            }
        }
        const createdWorkflow = await this.workflowApiClient.createWorkflow({
            ...opts.workflow,
            name: this.getBenchmarkWorkflowName(opts.workflow),
        });
        return await this.workflowApiClient.activateWorkflow(createdWorkflow);
    }
    findExistingCredentials(existingCredentials, credentialToImport) {
        const benchmarkCredentialName = this.getBenchmarkCredentialName(credentialToImport);
        return existingCredentials.filter((existingCredential) => existingCredential.name === benchmarkCredentialName);
    }
    findExistingWorkflows(existingWorkflows, workflowToImport) {
        const benchmarkWorkflowName = this.getBenchmarkWorkflowName(workflowToImport);
        return existingWorkflows.filter((existingWorkflow) => existingWorkflow.name === benchmarkWorkflowName);
    }
    getBenchmarkCredentialName(credential) {
        return `[BENCHMARK] ${credential.name}`;
    }
    getBenchmarkWorkflowName(workflow) {
        return `[BENCHMARK] ${workflow.name}`;
    }
    getBenchmarkDataTableName(dataTable) {
        return `[BENCHMARK] ${dataTable.name}`;
    }
}
exports.ScenarioDataImporter = ScenarioDataImporter;
//# sourceMappingURL=scenario-data-importer.js.map