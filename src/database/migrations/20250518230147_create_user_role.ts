import { sql, type Kysely } from 'kysely';

const tableName = 'users';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(tableName)
    .addColumn('role', 'text', (col) => 
      col.notNull().defaultTo('user').check(sql`role IN ('admin', 'user')`)
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(tableName)
    .dropColumn('role')
    .execute();
}