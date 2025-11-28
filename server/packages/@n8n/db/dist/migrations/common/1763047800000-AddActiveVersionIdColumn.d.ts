import type { MigrationContext, ReversibleMigration } from '../migration-types';
export declare class AddActiveVersionIdColumn1763047800000 implements ReversibleMigration {
    up({ schemaBuilder: { addColumns, column, addForeignKey }, queryRunner, escape, }: MigrationContext): Promise<void>;
    down({ schemaBuilder: { dropColumns, dropForeignKey } }: MigrationContext): Promise<void>;
}
