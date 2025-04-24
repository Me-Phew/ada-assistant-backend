import { sql, type Kysely } from 'kysely';

const tableName = 'device_events';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tableName)
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('device_id', 'uuid', (col) =>
      col.references('devices.id').onDelete('cascade').notNull(),
    )
    .addColumn('registered_at', 'timestamptz', (col) => col.notNull())
    .addColumn('type', 'text', (col) =>
      col
        .notNull()
        .check(
          sql`type IN ('BOOT', 'RESTART', 'DISCONNECTED', 'ERROR', 'CONFIG_CHANGE')`,
        ),
    )
    .addColumn('description', 'text', (col) => col.notNull())
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
