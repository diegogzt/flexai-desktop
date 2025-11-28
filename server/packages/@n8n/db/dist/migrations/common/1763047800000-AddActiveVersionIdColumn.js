"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddActiveVersionIdColumn1763047800000 = void 0;
const WORKFLOWS_TABLE_NAME = 'workflow_entity';
const WORKFLOW_HISTORY_TABLE_NAME = 'workflow_history';
class AddActiveVersionIdColumn1763047800000 {
    async up({ schemaBuilder: { addColumns, column, addForeignKey }, queryRunner, escape, }) {
        const workflowsTableName = escape.tableName(WORKFLOWS_TABLE_NAME);
        await addColumns(WORKFLOWS_TABLE_NAME, [column('activeVersionId').varchar(36)]);
        await addForeignKey(WORKFLOWS_TABLE_NAME, 'activeVersionId', [WORKFLOW_HISTORY_TABLE_NAME, 'versionId'], undefined, 'RESTRICT');
        const versionIdColumn = escape.columnName('versionId');
        const activeColumn = escape.columnName('active');
        const activeVersionIdColumn = escape.columnName('activeVersionId');
        await queryRunner.query(`UPDATE ${workflowsTableName}
			 SET ${activeVersionIdColumn} = ${versionIdColumn}
			 WHERE ${activeColumn} = true`);
    }
    async down({ schemaBuilder: { dropColumns, dropForeignKey } }) {
        await dropForeignKey(WORKFLOWS_TABLE_NAME, 'activeVersionId', [
            WORKFLOW_HISTORY_TABLE_NAME,
            'versionId',
        ]);
        await dropColumns(WORKFLOWS_TABLE_NAME, ['activeVersionId']);
    }
}
exports.AddActiveVersionIdColumn1763047800000 = AddActiveVersionIdColumn1763047800000;
//# sourceMappingURL=1763047800000-AddActiveVersionIdColumn.js.map