-- +migrate Up
CREATE TABLE device_events (
    id serial PRIMARY KEY,
    device_id uuid REFERENCES devices (id) ON DELETE CASCADE,
    timestamp timestamptz NOT NULL DEFAULT now(),
    event_type varchar(20) NOT NULL CHECK (event_type IN ('BOOT', 'RESTART', 'DISCONNECTED', 'ERROR', 'CONFIG_CHANGE')),
    details text
);

CREATE INDEX idx_device_events_fk_device_id ON device_events USING btree (device_id);

-- +migrate Down
DROP TABLE IF EXISTS device_events;

