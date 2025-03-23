-- +migrate Up
CREATE TABLE assistant_messages (
    id uuid NOT NULL DEFAULT uuid_generate_v4 (),
    conversation_id uuid REFERENCES conversations (id) ON DELETE CASCADE,
    text_response text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT assistant_messages_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_assistant_messages_fk_conversation_id ON assistant_messages USING btree (conversation_id);

-- +migrate Down
DROP TABLE IF EXISTS assistant_messages;

