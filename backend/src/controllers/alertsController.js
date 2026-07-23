// cypod-telemetry

const pool = require('../config/db');

const getAlerts = async (req, res, next) => {
    const userId = req.user.id;
    try {
        const alertsQuery = 'SELECT a.id, a.device_id, a.message, a.category, a.is_active, a.created_at, a.resolved_at FROM alerts AS a INNER JOIN devices AS d ON a.device_id = d.id WHERE d.user_id = $1 AND a.is_active = true ORDER BY a.created_at DESC;';
        const alertsResult = await pool.query(alertsQuery, [userId]);
        const alerts = alertsResult.rows;

        return res.status(200).json({ alerts });
    } catch (error) {
        next(error);
    }
}

module.exports = { getAlerts };