-- +migrate Up
CREATE TABLE notifications (
    id uuid NOT NULL DEFAULT uuid_generate_v4 (),
    user_id uuid REFERENCES users (id) ON DELETE SET NULL,
    device_id uuid REFERENCES devices (id) ON DELETE SET NULL,
    message text,
    read boolean NOT NULL DEFAULT FALSE,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_notifications_fk_user_id ON notifications USING btree (user_id);

CREATE INDEX idx_notifications_fk_device_id ON notifications USING btree (device_id);

-- +migrate Down
DROP TABLE IF EXISTS notifications;

