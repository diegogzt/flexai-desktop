import { BinaryDataStorageRule } from './binary-data-storage.rule';
import { CliActivateAllWorkflowsRule } from './cli-activate-all-workflows.rule';
import { GitNodeBareReposRule } from './git-node-bare-repos.rule';
import { RemovedDatabaseTypesRule } from './removed-database-types.rule';
import { SettingsFilePermissionsRule } from './settings-file-permissions.rule';
import { SqliteLegacyDriverRule } from './sqlite-legacy-driver.rule';
import { TaskRunnersRule } from './task-runners.rule';
declare const v2Rules: (typeof BinaryDataStorageRule | typeof CliActivateAllWorkflowsRule | typeof GitNodeBareReposRule | typeof RemovedDatabaseTypesRule | typeof SettingsFilePermissionsRule | typeof SqliteLegacyDriverRule | typeof TaskRunnersRule)[];
export { v2Rules };
