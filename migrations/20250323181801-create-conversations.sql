-- +migrate Up
CREATE TABLE conversations(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    device_id uuid REFERENCES devices(id) ON DELETE CASCADE,
    date date NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT conversations_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_conversations_fk_user_id ON conversations USING btree(user_id);

CREATE INDEX idx_conversations_fk_device_id ON conversations USING btree(device_id);

-- +migrate Down
DROP TABLE IF EXISTS conversations;

