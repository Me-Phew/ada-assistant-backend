import { sql, type Kysely } from 'kysely';

const tableName = 'firmware_updates';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tableName)
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('device_id', 'uuid', (col) =>
      col.references('devices.id').onDelete('cascade').notNull(),
    )
    .addColumn('firmware_version_id', 'uuid', (col) =>
      col.references('firmware_versions.id').onDelete('cascade').notNull(),
    )
    .addColumn('status', 'text', (col) =>
      col.notNull().check(sql`status IN ('waiting', 'installed', 'rollback')`),
    )
    .addColumn('status_updated_at', 'timestamptz')
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
