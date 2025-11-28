"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProjectIdToVariableTable1758794506893 = void 0;
const VARIABLES_TABLE_NAME = 'variables';
const UNIQUE_PROJECT_KEY_INDEX_NAME = 'variables_project_key_unique';
const UNIQUE_GLOBAL_KEY_INDEX_NAME = 'variables_global_key_unique';
const PROJECT_ID_FOREIGN_KEY_NAME = 'variables_projectId_foreign';
class AddProjectIdToVariableTable1758794506893 {
    async up({ schemaBuilder: { addColumns, column, dropIndex, addForeignKey }, queryRunner, escape, }) {
        const variablesTableName = escape.tableName(VARIABLES_TABLE_NAME);
        await dropIndex(VARIABLES_TABLE_NAME, ['key'], { customIndexName: 'key' });
        await addColumns(VARIABLES_TABLE_NAME, [column('projectId').varchar(36)]);
        await queryRunner.query(`
			ALTER TABLE ${variablesTableName}
			ADD COLUMN globalKey VARCHAR(255) GENERATED ALWAYS AS (
				CASE WHEN projectId IS NULL THEN \`key\` ELSE NULL END
			) STORED;
		`);
        await addForeignKey(VARIABLES_TABLE_NAME, 'projectId', ['project', 'id'], PROJECT_ID_FOREIGN_KEY_NAME);
        await queryRunner.query(`
			CREATE UNIQUE INDEX ${UNIQUE_PROJECT_KEY_INDEX_NAME}
			ON ${variablesTableName} (projectId, \`key\`);
		`);
        await queryRunner.query(`
			CREATE UNIQUE INDEX ${UNIQUE_GLOBAL_KEY_INDEX_NAME}
			ON ${variablesTableName} (globalKey);
		`);
    }
    async down({ queryRunner, escape }) {
        const variablesTableName = escape.tableName(VARIABLES_TABLE_NAME);
        await queryRunner.query(`DELETE FROM ${variablesTableName} WHERE projectId IS NOT NULL;`);
        await queryRunner.query(`DROP INDEX ${UNIQUE_GLOBAL_KEY_INDEX_NAME} ON ${variablesTableName};`);
        await queryRunner.query(`ALTER TABLE ${variablesTableName} DROP COLUMN globalKey;`);
        await queryRunner.query(`ALTER TABLE ${variablesTableName} DROP FOREIGN KEY ${PROJECT_ID_FOREIGN_KEY_NAME};`);
        await queryRunner.query(`DROP INDEX ${UNIQUE_PROJECT_KEY_INDEX_NAME} ON ${variablesTableName};`);
        await queryRunner.query(`ALTER TABLE ${variablesTableName} DROP COLUMN projectId;`);
        await queryRunner.query(`ALTER TABLE ${variablesTableName} ADD CONSTRAINT \`key\` UNIQUE (\`key\`);`);
    }
}
exports.AddProjectIdToVariableTable1758794506893 = AddProjectIdToVariableTable1758794506893;
//# sourceMappingURL=1758794506893-AddProjectIdToVariableTable.js.map