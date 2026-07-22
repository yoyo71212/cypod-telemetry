-- cypod-telemetry

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE devices (
    id VARCHAR(8) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id)
);

CREATE TYPE telemetry_status AS ENUM ('OK', 'FAULT');

CREATE TABLE telemetry (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(8) NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    battery DOUBLE PRECISION NOT NULL,
    temperature DOUBLE PRECISION NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    status telemetry_status NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_backfilled BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TYPE alerts_category AS ENUM ('BATTERY', 'TEMPERATURE');

CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(8) NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    message VARCHAR(255) NOT NULL,
    category alerts_category NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_telemetry_device_created_at ON telemetry(device_id, created_at DESC);