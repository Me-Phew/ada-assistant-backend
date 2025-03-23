-- +migrate Up
CREATE TABLE transcriptions (
    id uuid NOT NULL DEFAULT uuid_generate_v4 (),
    user_message_id uuid REFERENCES user_messages (id) ON DELETE CASCADE,
    transcribed_text text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT transcriptions_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_transcriptions_fk_user_message_id ON transcriptions USING btree (user_message_id);

-- +migrate Down
DROP TABLE IF EXISTS transcriptions;

