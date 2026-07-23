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

module.exports = {
    getDevices,
    registerDevice
};