-- +migrate Up
CREATE TABLE update_logs (
    id serial PRIMARY KEY,
    device_id uuid REFERENCES devices (id) ON DELETE CASCADE,
    firmware_update_id uuid REFERENCES firmware_updates (id) ON DELETE SET NULL,
    timestamp timestamptz NOT NULL DEFAULT now(),
    status varchar(20) NOT NULL CHECK (status IN ('STARTED', 'SUCCESS', 'FAILED', 'ROLLBACK')),
    details text
);

CREATE INDEX idx_update_logs_fk_device_id ON update_logs USING btree (device_id);

CREATE INDEX idx_update_logs_fk_firmware_update_id ON update_logs USING btree (firmware_update_id);

-- +migrate Down
DROP TABLE IF EXISTS update_logs;

