import type { Logger } from '@n8n/backend-common';
import type { INodeTypeDescription } from 'n8n-workflow';
import type { BuilderTool, BuilderToolBase } from '../utils/stream-processor';
export declare const VALIDATE_WORKFLOW_TOOL: BuilderToolBase;
export declare function createValidateWorkflowTool(parsedNodeTypes: INodeTypeDescription[], logger?: Logger): BuilderTool;
