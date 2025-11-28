"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestMigrationContext = createTestMigrationContext;
exports.initDbUpToMigration = initDbUpToMigration;
exports.undoLastSingleMigration = undoLastSingleMigration;
exports.runSingleMigration = runSingleMigration;
const config_1 = require("@n8n/config");
const db_1 = require("@n8n/db");
const di_1 = require("@n8n/di");
const typeorm_1 = require("@n8n/typeorm");
const n8n_workflow_1 = require("n8n-workflow");
async function reinitializeDataConnection() {
    const dbConnection = di_1.Container.get(db_1.DbConnection);
    await dbConnection.close();
    await dbConnection.init();
}
function createTestMigrationContext(dataSource) {
    const globalConfig = di_1.Container.get(config_1.GlobalConfig);
    const dbType = globalConfig.database.type;
    const tablePrefix = globalConfig.database.tablePrefix;
    const queryRunner = dataSource.createQueryRunner();
    return {
        queryRunner,
        tablePrefix,
        dbType,
        isMysql: ['mariadb', 'mysqldb'].includes(dbType),
        isSqlite: dbType === 'sqlite',
        isPostgres: dbType === 'postgresdb',
        escape: {
            columnName: (name) => queryRunner.connection.driver.escape(name),
            tableName: (name) => queryRunner.connection.driver.escape(`${tablePrefix}${name}`),
            indexName: (name) => queryRunner.connection.driver.escape(`IDX_${tablePrefix}${name}`),
        },
    };
}
async function initDbUpToMigration(beforeMigrationName) {
    const dataSource = di_1.Container.get(typeorm_1.DataSource);
    if (!Array.isArray(dataSource.options.migrations)) {
        throw new n8n_workflow_1.UnexpectedError('Database migrations are not an array');
    }
    const allMigrations = dataSource.options.migrations;
    const targetIndex = allMigrations.findIndex((m) => m.name === beforeMigrationName);
    if (targetIndex === -1) {
        throw new n8n_workflow_1.UnexpectedError(`Migration "${beforeMigrationName}" not found`);
    }
    const migrationsToRun = allMigrations.slice(0, targetIndex);
    dataSource.options.migrations = migrationsToRun;
    try {
        await reinitializeDataConnection();
        await di_1.Container.get(db_1.DbConnection).migrate();
    }
    finally {
        dataSource.options.migrations = allMigrations;
        await reinitializeDataConnection();
    }
}
async function undoLastSingleMigration() {
    const dataSource = di_1.Container.get(typeorm_1.DataSource);
    await dataSource.undoLastMigration({
        transaction: 'each',
    });
}
async function runSingleMigration(migrationName) {
    const dataSource = di_1.Container.get(typeorm_1.DataSource);
    const allMigrations = dataSource.options.migrations;
    const migration = allMigrations.find((m) => m.name === migrationName);
    if (!migration) {
        throw new n8n_workflow_1.UnexpectedError(`Migration "${migrationName}" not found`);
    }
    dataSource.options.migrations = [migration];
    try {
        await reinitializeDataConnection();
        await di_1.Container.get(db_1.DbConnection).migrate();
    }
    finally {
        dataSource.options.migrations = allMigrations;
        await reinitializeDataConnection();
    }
}
//# sourceMappingURL=migration-test-helpers.js.map