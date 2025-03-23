-- +migrate Up
CREATE TABLE intents (
    id uuid NOT NULL DEFAULT uuid_generate_v4 (),
    user_message_id uuid REFERENCES user_messages (id) ON DELETE CASCADE,
    intent_type varchar(50),
    parameters json,
    timestamp timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT intents_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_intents_fk_user_message_id ON intents USING btree (user_message_id);

-- +migrate Down
DROP TABLE IF EXISTS intents;

