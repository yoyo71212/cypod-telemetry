// cypod-telemetry

const pool = require('../config/db');

const getDevices = async (req, res, next) => {
    const userId = req.user.id;

    try {
        const devicesQuery = 'SELECT * FROM devices WHERE user_id = $1';
        const devicesResult = await pool.query(devicesQuery, [userId]);
        const devices = devicesResult.rows;

        return res.status(200).json({ devices });
    } catch (error) {
        next(error);
    }
}

const registerDevice = async (req, res, next) => {
    const userId = req.user.id;
    const { id, name } = req.body;

    try {
        const registerQuery = 'INSERT INTO devices (id, name, user_id) VALUES ($1, $2, $3) RETURNING *';
        const registerResult = await pool.query(registerQuery, [id, name, userId]);
        const device = registerResult.rows[0];

        return res.status(201).json({ device });
    } catch (error) {
        next(error);
    }
}

const addTelemetry = async (req, res, next) => {
    const { battery, temperature, lat, lng, status, timestamp } = req.body;
    const { id: deviceId } = req.params;

    try {
        const deviceQuery = 'SELECT * FROM devices WHERE id = $1;';
        const deviceResult = await pool.query(deviceQuery, [deviceId]);
        const device = deviceResult.rows[0];

        if (!device) {
            return next({
                statusCode: 404,
                message: 'Device not found'
            });
        }

        if (device.user_id !== req.user.id) {
            return next({
                statusCode: 403,
                message: 'Not authorized to add telemetry for this device'
            });
        }

        const receivedAt = new Date();
        const isBackfilled = (receivedAt - new Date(timestamp)) > process.env.TELEMETRY_BACKFILL_THRESHOLD;

        const insertTelemetryQuery = 'INSERT INTO telemetry (device_id, battery, temperature, lat, lng, status, created_at, received_at, is_backfilled) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *';
        const insertTelemetryResult = await pool.query(insertTelemetryQuery, [deviceId, battery, temperature, lat, lng, status, timestamp, receivedAt, isBackfilled]);
        const telemetry = insertTelemetryResult.rows[0];


        await raiseAlerts(telemetry);

        // note: invalidate cache for this device to ensure the next telemetry fetch gets the latest data (cache-aside)
        // note: the trade-off is that the first request is always a miss but it ensures that the data is accurate as it's updated from the database after the insertion is done
        await cache.invalidateCache(deviceId);

        return res.status(201).json({ telemetry });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getDevices,
    registerDevice,
    addTelemetry
};