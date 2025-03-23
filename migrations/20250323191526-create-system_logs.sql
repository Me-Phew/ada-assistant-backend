-- +migrate Up
CREATE TABLE system_logs (
    id serial PRIMARY KEY,
    timestamp timestamptz NOT NULL DEFAULT now(),
    severity varchar(20) NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')),
    component text,
    message text
);

-- +migrate Down
DROP TABLE IF EXISTS system_logs;

