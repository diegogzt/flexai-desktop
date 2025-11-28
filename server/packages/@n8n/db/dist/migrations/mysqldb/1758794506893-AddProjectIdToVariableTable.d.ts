import type { MigrationContext, ReversibleMigration } from '../migration-types';
export declare class AddProjectIdToVariableTable1758794506893 implements ReversibleMigration {
    up({ schemaBuilder: { addColumns, column, dropIndex, addForeignKey }, queryRunner, escape, }: MigrationContext): Promise<void>;
    down({ queryRunner, escape }: MigrationContext): Promise<void>;
}
