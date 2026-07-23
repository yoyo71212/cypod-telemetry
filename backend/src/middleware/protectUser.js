// cypod-telemetry

const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const protectUser = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userQuery = 'SELECT * FROM users WHERE id = $1';
            const userResult = await pool.query(userQuery, [decoded.userId]);
            const user = userResult.rows[0];

            if (!user) {
                return next({
                    statusCode: 401,
                    message: 'Not authorized, user not found'
                });
            }
            req.user = user;
            
            next();
        } catch (error) {
            return next({
                statusCode: 401,
                message: 'Not authorized, token failed'
            });
        }
    }

    if (!token) {
        return next({
            statusCode: 401,
            message: 'Not authorized, no token'
        });
    }
}

module.exports = { protectUser };