-- +migrate Up
CREATE TABLE devices (
    id uuid NOT NULL DEFAULT uuid_generate_v4 (),
    user_id uuid REFERENCES users (id) ON DELETE CASCADE,
    "name" varchar(255),
    model varchar(255),
    factory_firmware_version_id uuid REFERENCES firmware_versions (id) ON DELETE SET NULL,
    current_firmware_version_id uuid REFERENCES firmware_versions (id) ON DELETE SET NULL,
    last_seen timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT devices_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_devices_fk_user_id ON devices (user_id);

CREATE INDEX idx_devices_fk_factory_firmware_version_id ON devices USING btree (factory_firmware_version_id);

CREATE INDEX idx_devices_fk_current_firmware_version_id ON devices USING btree (current_firmware_version_id);

-- +migrate Down
DROP TABLE IF EXISTS devices;

