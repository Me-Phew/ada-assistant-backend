-- +migrate Up
CREATE TABLE firmware_updates (
    id uuid NOT NULL DEFAULT uuid_generate_v4 (),
    device_id uuid REFERENCES devices (id) ON DELETE CASCADE,
    firmware_version_id uuid REFERENCES firmware_versions (id) ON DELETE SET NULL,
    status varchar(20) NOT NULL CHECK (status IN ('waiting', 'installed', 'rollback')),
    timestamp timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT firmware_updates_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_firmware_updates_fk_device_id ON firmware_updates USING btree (device_id);

CREATE INDEX idx_firmware_updates_fk_firmware_version_id ON firmware_updates USING btree (firmware_version_id);

-- +migrate Down
DROP TABLE IF EXISTS firmware_updates;

