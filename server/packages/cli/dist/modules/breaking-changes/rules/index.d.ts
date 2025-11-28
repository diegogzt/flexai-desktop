declare const allRules: (typeof import("./v2/binary-data-storage.rule").BinaryDataStorageRule | typeof import("./v2/cli-activate-all-workflows.rule").CliActivateAllWorkflowsRule | typeof import("./v2/git-node-bare-repos.rule").GitNodeBareReposRule | typeof import("./v2/removed-database-types.rule").RemovedDatabaseTypesRule | typeof import("./v2/settings-file-permissions.rule").SettingsFilePermissionsRule | typeof import("./v2/sqlite-legacy-driver.rule").SqliteLegacyDriverRule | typeof import("./v2/task-runners.rule").TaskRunnersRule)[];
type RuleConstructors = (typeof allRules)[number];
type RuleInstances = InstanceType<RuleConstructors>;
export { allRules, type RuleInstances };
