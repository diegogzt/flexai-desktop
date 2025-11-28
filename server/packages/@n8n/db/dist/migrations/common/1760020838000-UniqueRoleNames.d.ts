import type { MigrationContext, ReversibleMigration } from '../migration-types';
export declare class UniqueRoleNames1760020838000 implements ReversibleMigration {
    up({ isMysql, escape, runQuery }: MigrationContext): Promise<void>;
    down({ isMysql, escape, runQuery }: MigrationContext): Promise<void>;
}
