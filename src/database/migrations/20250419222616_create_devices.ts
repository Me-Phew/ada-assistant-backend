import { sql, type Kysely } from 'kysely';

const tableName = 'devices';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tableName)
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('user_id', 'uuid', (col) =>
      col.references('users.id').onDelete('cascade'),
    )
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('model', 'text', (col) => col.notNull())
    .addColumn('factory_firmware_version', 'uuid', (col) =>
      col.references('firmware_versions.id').onDelete('cascade').notNull(),
    )
    .addColumn('current_firmware_version', 'uuid', (col) =>
      col.references('firmware_versions.id').onDelete('cascade').notNull(),
    )
    .addColumn('last_seen', 'timestamptz')
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
