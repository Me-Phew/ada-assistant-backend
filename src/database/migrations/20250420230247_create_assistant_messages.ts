import { sql, type Kysely } from 'kysely';

const tableName = 'assistant_messages';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tableName)
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('conversation_id', 'uuid', (col) =>
      col.references('conversations.id').onDelete('cascade').notNull(),
    )
    .addColumn('message_text', 'text', (col) => col.notNull())
    .addColumn('registered_at', 'timestamptz', (col) => col.notNull())
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
