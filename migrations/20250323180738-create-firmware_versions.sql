-- +migrate Up
CREATE TABLE firmware_versions (
    id uuid NOT NULL DEFAULT uuid_generate_v4 (),
    version varchar(50) NOT NULL,
    release_notes text NOT NULL,
    codename text NOT NULL,
    release_url text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT firmware_versions_pkey PRIMARY KEY (id),
    CONSTRAINT firmware_versions_version_unique UNIQUE (version)
);

-- +migrate Down
DROP TABLE IF EXISTS firmware_versions;

