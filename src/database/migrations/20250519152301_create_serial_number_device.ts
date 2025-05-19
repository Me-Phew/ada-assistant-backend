import { type Kysely } from 'kysely';
import { DB } from '../schema/db';

const tableName = 'devices';

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .alterTable(tableName)
    .addColumn('serial_number', 'text', (col) => col.notNull().defaultTo(''))
    .addColumn('board_revision', 'text', (col) => col.notNull().defaultTo('1.0'))
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema.alterTable(tableName).dropColumn('serial_number').execute();
  await db.schema.alterTable(tableName).dropColumn('board_revision').execute();
}