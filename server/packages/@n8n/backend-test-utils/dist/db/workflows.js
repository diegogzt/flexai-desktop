"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkflowById = void 0;
exports.newWorkflow = newWorkflow;
exports.createWorkflow = createWorkflow;
exports.createManyWorkflows = createManyWorkflows;
exports.createManyActiveWorkflows = createManyActiveWorkflows;
exports.shareWorkflowWithUsers = shareWorkflowWithUsers;
exports.shareWorkflowWithProjects = shareWorkflowWithProjects;
exports.getWorkflowSharing = getWorkflowSharing;
exports.createWorkflowWithTrigger = createWorkflowWithTrigger;
exports.createWorkflowWithHistory = createWorkflowWithHistory;
exports.createWorkflowWithTriggerAndHistory = createWorkflowWithTriggerAndHistory;
exports.getAllWorkflows = getAllWorkflows;
exports.getAllSharedWorkflows = getAllSharedWorkflows;
exports.createWorkflowHistory = createWorkflowHistory;
exports.setActiveVersion = setActiveVersion;
exports.createActiveWorkflow = createActiveWorkflow;
exports.createWorkflowWithActiveVersion = createWorkflowWithActiveVersion;
const db_1 = require("@n8n/db");
const di_1 = require("@n8n/di");
const n8n_workflow_1 = require("n8n-workflow");
const uuid_1 = require("uuid");
function newWorkflow(attributes = {}) {
    const { active, isArchived, name, nodes, connections, versionId, settings } = attributes;
    const workflowEntity = di_1.Container.get(db_1.WorkflowRepository).create({
        active: active ?? false,
        isArchived: isArchived ?? false,
        name: name ?? 'test workflow',
        nodes: nodes ?? [
            {
                id: 'uuid-1234',
                name: 'Schedule Trigger',
                parameters: {},
                position: [-20, 260],
                type: 'n8n-nodes-base.scheduleTrigger',
                typeVersion: 1,
            },
        ],
        connections: connections ?? {},
        versionId: versionId ?? (0, uuid_1.v4)(),
        settings: settings ?? {},
        ...attributes,
    });
    return workflowEntity;
}
async function createWorkflow(attributes = {}, userOrProject) {
    const workflow = await di_1.Container.get(db_1.WorkflowRepository).save(newWorkflow(attributes));
    if (userOrProject instanceof db_1.User) {
        const user = userOrProject;
        const project = await di_1.Container.get(db_1.ProjectRepository).getPersonalProjectForUserOrFail(user.id);
        await di_1.Container.get(db_1.SharedWorkflowRepository).save(di_1.Container.get(db_1.SharedWorkflowRepository).create({
            project,
            workflow,
            role: 'workflow:owner',
        }));
    }
    if (userOrProject instanceof db_1.Project) {
        const project = userOrProject;
        await di_1.Container.get(db_1.SharedWorkflowRepository).save(di_1.Container.get(db_1.SharedWorkflowRepository).create({
            project,
            workflow,
            role: 'workflow:owner',
        }));
    }
    return workflow;
}
async function createManyWorkflows(amount, attributes = {}, user) {
    const workflowRequests = [...Array(amount)].map(async (_) => await createWorkflow(attributes, user));
    return await Promise.all(workflowRequests);
}
async function createManyActiveWorkflows(amount, attributes = {}, userOrProject) {
    const workflowRequests = [...Array(amount)].map(async (_) => await createActiveWorkflow(attributes, userOrProject));
    return await Promise.all(workflowRequests);
}
async function shareWorkflowWithUsers(workflow, users) {
    const sharedWorkflows = await Promise.all(users.map(async (user) => {
        const project = await di_1.Container.get(db_1.ProjectRepository).getPersonalProjectForUserOrFail(user.id);
        return {
            projectId: project.id,
            workflowId: workflow.id,
            role: 'workflow:editor',
        };
    }));
    return await di_1.Container.get(db_1.SharedWorkflowRepository).save(sharedWorkflows);
}
async function shareWorkflowWithProjects(workflow, projectsWithRole) {
    const newSharedWorkflow = await Promise.all(projectsWithRole.map(async ({ project, role }) => {
        return di_1.Container.get(db_1.SharedWorkflowRepository).create({
            workflowId: workflow.id,
            role: role ?? 'workflow:editor',
            projectId: project.id,
        });
    }));
    return await di_1.Container.get(db_1.SharedWorkflowRepository).save(newSharedWorkflow);
}
async function getWorkflowSharing(workflow) {
    return await di_1.Container.get(db_1.SharedWorkflowRepository).find({
        where: { workflowId: workflow.id },
        relations: { project: true },
    });
}
async function createWorkflowWithTrigger(attributes = {}, userOrProject) {
    const workflow = await createWorkflow({
        nodes: [
            {
                id: 'uuid-1',
                parameters: {},
                name: 'Start',
                type: 'n8n-nodes-base.start',
                typeVersion: 1,
                position: [240, 300],
            },
            {
                id: 'uuid-2',
                parameters: { triggerTimes: { item: [{ mode: 'everyMinute' }] } },
                name: 'Cron',
                type: 'n8n-nodes-base.cron',
                typeVersion: 1,
                position: [500, 300],
            },
            {
                id: 'uuid-3',
                parameters: { options: {} },
                name: 'Set',
                type: 'n8n-nodes-base.set',
                typeVersion: 1,
                position: [780, 300],
            },
        ],
        connections: {
            Cron: { main: [[{ node: 'Set', type: n8n_workflow_1.NodeConnectionTypes.Main, index: 0 }]] },
        },
        ...attributes,
    }, userOrProject);
    return workflow;
}
async function createWorkflowWithHistory(attributes = {}, userOrProject) {
    const workflow = await createWorkflow(attributes, userOrProject);
    const user = userOrProject instanceof db_1.User ? userOrProject : undefined;
    await createWorkflowHistory(workflow, user);
    return workflow;
}
async function createWorkflowWithTriggerAndHistory(attributes = {}, userOrProject) {
    const workflow = await createWorkflowWithTrigger(attributes, userOrProject);
    await createWorkflowHistory(workflow, userOrProject);
    return workflow;
}
async function getAllWorkflows() {
    return await di_1.Container.get(db_1.WorkflowRepository).find();
}
async function getAllSharedWorkflows() {
    return await di_1.Container.get(db_1.SharedWorkflowRepository).find();
}
const getWorkflowById = async (id) => await di_1.Container.get(db_1.WorkflowRepository).findOneBy({ id });
exports.getWorkflowById = getWorkflowById;
async function createWorkflowHistory(workflow, userOrProject) {
    await di_1.Container.get(db_1.WorkflowHistoryRepository).insert({
        workflowId: workflow.id,
        versionId: workflow.versionId,
        nodes: workflow.nodes,
        connections: workflow.connections,
        authors: userOrProject instanceof db_1.User ? userOrProject.email : 'test@example.com',
    });
}
async function setActiveVersion(workflowId, versionId) {
    await di_1.Container.get(db_1.WorkflowRepository)
        .createQueryBuilder()
        .update()
        .set({ activeVersionId: versionId })
        .where('id = :workflowId', { workflowId })
        .execute();
}
async function createActiveWorkflow(attributes = {}, userOrProject) {
    const workflow = await createWorkflowWithTriggerAndHistory({ active: true, ...attributes }, userOrProject);
    await setActiveVersion(workflow.id, workflow.versionId);
    workflow.activeVersionId = workflow.versionId;
    return workflow;
}
async function createWorkflowWithActiveVersion(activeVersionId, attributes = {}, user) {
    const workflow = await createWorkflowWithTriggerAndHistory({ active: true, ...attributes }, user);
    await di_1.Container.get(db_1.WorkflowHistoryRepository).insert({
        workflowId: workflow.id,
        versionId: activeVersionId,
        nodes: workflow.nodes,
        connections: workflow.connections,
        authors: user?.email ?? 'test@example.com',
    });
    await setActiveVersion(workflow.id, activeVersionId);
    workflow.activeVersionId = activeVersionId;
    return workflow;
}
//# sourceMappingURL=workflows.js.map