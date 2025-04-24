import { sql, type Kysely } from 'kysely';

const tableName = 'update_logs';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tableName)
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('device_id', 'uuid', (col) =>
      col.references('devices.id').onDelete('cascade').notNull(),
    )
    .addColumn('firmware_update_id', 'uuid', (col) =>
      col.references('firmware_updates.id').onDelete('cascade').notNull(),
    )
    .addColumn('status', 'text', (col) =>
      col.check(sql`status IN ('STARTED', 'SUCCESS', 'FAILED', 'ROLLBACK')`),
    )
    .addColumn('details', 'text')
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
