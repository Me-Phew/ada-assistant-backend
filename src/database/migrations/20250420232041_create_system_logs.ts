import { sql, type Kysely } from 'kysely';

const tableName = 'system_logs';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tableName)
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('registered_at', 'timestamptz', (col) => col.notNull())
    .addColumn('severity', 'text', (col) =>
      col
        .notNull()
        .check(sql`severity IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')`),
    )
    .addColumn('log_message', 'text', (col) => col.notNull())
    .addColumn('component', 'text')
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tableName).execute();
}
