import { type Kysely } from 'kysely';
import { DB } from '../schema/db';

const tableName = 'devices';

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .alterTable(tableName)
    .addColumn('paired_at', 'timestamp')
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema.alterTable(tableName).dropColumn('paired_at').execute();
}
