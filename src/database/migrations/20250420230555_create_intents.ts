import { sql, type Kysely } from 'kysely';

const tableName = 'intents';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tableName)
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('user_message_id', 'uuid', (col) =>
      col.references('user_messages.id').onDelete('cascade').notNull(),
    )
    .addColumn('intent_type', 'text', (col) => col.notNull())
    .addColumn('params', 'json')
    .addColumn('completed_at', 'timestamptz')
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
