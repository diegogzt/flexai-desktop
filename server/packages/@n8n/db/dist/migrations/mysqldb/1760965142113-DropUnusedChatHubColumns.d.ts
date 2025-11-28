import type { MigrationContext, ReversibleMigration } from '../migration-types';
export declare class DropUnusedChatHubColumns1760965142113 implements ReversibleMigration {
    up({ runQuery, tablePrefix, schemaBuilder: { addColumns, dropColumns, column }, }: MigrationContext): Promise<void>;
    down({ schemaBuilder: { dropColumns, addColumns, column, addForeignKey }, }: MigrationContext): Promise<void>;
}
