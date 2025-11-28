import { type DatabaseType } from '@n8n/db';
import { DataSource, type QueryRunner } from '@n8n/typeorm';
export interface TestMigrationContext {
    queryRunner: QueryRunner;
    tablePrefix: string;
    dbType: DatabaseType;
    isMysql: boolean;
    isSqlite: boolean;
    isPostgres: boolean;
    escape: {
        columnName(name: string): string;
        tableName(name: string): string;
        indexName(name: string): string;
    };
}
export declare function createTestMigrationContext(dataSource: DataSource): TestMigrationContext;
export declare function initDbUpToMigration(beforeMigrationName: string): Promise<void>;
export declare function undoLastSingleMigration(): Promise<void>;
export declare function runSingleMigration(migrationName: string): Promise<void>;
