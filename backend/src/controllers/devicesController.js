// cypod-telemetry

const pool = require('../config/db');
const cache = require('../utils/cache');

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

const getLatestDeviceTelemetry = async (req, res, next) => {
    const userId = req.user.id;
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

        if (device.user_id !== userId) {
            return next({
                statusCode: 403,
                message: 'Not authorized to access this device telemetry'
            });
        }

        // note: check cache first
        const cachedTelemetry = cache.getCachedTelemetry(deviceId);

        if (cachedTelemetry) {
            console.log(`[cache] HIT device=${deviceId}`);
            return res.status(200).json({ telemetry: cachedTelemetry, _cache: 'HIT' });
        }

        console.log(`[cache] MISS device=${deviceId}`);
        const latestTelemetryQuery = 'SELECT * FROM telemetry WHERE device_id = $1 ORDER BY created_at DESC LIMIT 1;';
        const latestTelemetryResult = await pool.query(latestTelemetryQuery, [deviceId]);
        const latestTelemetry = latestTelemetryResult.rows[0];

        if (!latestTelemetry) {
            return next({
                statusCode: 404,
                message: 'No telemetry data found for this device'
            });
        }

        // note: cache the latest telemetry for this device
        cache.setCachedTelemetry(deviceId, latestTelemetry);

        return res.status(200).json({ telemetry: latestTelemetry, _cache: 'MISS' });
    } catch (error) {
        next(error);
    }
}

const getDeviceHistory = async (req, res, next) => {
    const userId = req.user.id;
    const { id: deviceId } = req.params;
    const { from, to } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 25));
    const offset = (page - 1) * limit;

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
        if (device.user_id !== userId) {
            return next({
                statusCode: 403,
                message: 'Not authorized to access this device telemetry'
            });
        }

        const conditions = ['device_id = $1'];
        const params = [deviceId];

        if (from) {
            params.push(from);
            conditions.push(`created_at >= $${params.length}`);
        }

        if (to) {
            params.push(to);
            conditions.push(`created_at <= $${params.length}`);
        }

        params.push(limit, offset);

        const historyQuery = `SELECT * FROM telemetry WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length};`;
        const historyResult = await pool.query(historyQuery, params);
        const history = historyResult.rows;

        return res.status(200).json({ history, page, pageSize: limit });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getDevices,
    registerDevice,
    addTelemetry,
    getLatestDeviceTelemetry,
    getDeviceHistory
};