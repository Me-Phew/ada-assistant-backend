import { sql, type Kysely } from 'kysely';

const viewName = 'chat_timeline';

export async function up(db: Kysely<any>): Promise<void> {
  db.schema
    .createView(viewName)
    .as(
      db
        .selectFrom('conversations as c')
        .leftJoin('user_messages as um', 'um.conversation_id', 'c.id')
        .leftJoin('assistant_messages as am', 'am.conversation_id', 'c.id')
        .select([
          'c.id as conversation_id',
          'um.id as user_message_id',
          'am.id as assistant_message_id',
          sql`CASE WHEN um.id IS NOT NULL THEN 'USER' ELSE 'ASSISTANT' END`.as(
            'message_type',
          ),
          sql`COALESCE(um.audio_path, am.text_response)`.as('message_text'),
          sql`COALESCE(um.registered_at, am.registered_at)`.as('registered_at'),
        ])
        .orderBy('timestamp'),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  db.schema.dropView(viewName);
}
