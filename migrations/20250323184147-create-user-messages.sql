-- +migrate Up
CREATE TABLE user_messages (
    id uuid NOT NULL DEFAULT uuid_generate_v4 (),
    conversation_id uuid REFERENCES conversations (id) ON DELETE CASCADE,
    audio_path text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT user_messages_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_user_messages_fk_conversation_id ON user_messages USING btree (conversation_id);

-- +migrate Down
DROP TABLE IF EXISTS user_messages;

