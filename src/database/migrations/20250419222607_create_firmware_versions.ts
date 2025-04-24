import { sql, type Kysely } from 'kysely';

const tableName = 'firmware_versions';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tableName)
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('version', 'text', (col) => col.notNull())
    .addColumn('release_notes', 'text', (col) => col.notNull())
    .addColumn('codename', 'text', (col) => col.notNull())
    .addColumn('release_url', 'text', (col) => col.notNull())
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
