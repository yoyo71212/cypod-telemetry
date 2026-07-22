// cypod-telemetry

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;

const createToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
};

const registerUser = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return next({
                statusCode: 400,
                message: 'Username and password are required'
            });
        }

        const existingUserQuery = 'SELECT * FROM users WHERE username = $1';
        const existingUserResult = await pool.query(existingUserQuery, [username]);

        if (existingUserResult.rows.length > 0) {
            return next({
                statusCode: 400,
                message: 'Username already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const insertUserQuery = 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *';
        const newUserResult = await pool.query(insertUserQuery, [username, hashedPassword]);
        const newUser = newUserResult.rows[0];

        const token = createToken(newUser.id);

        return res.status(201).json({ username: newUser.username, token });
    } catch (error) {
        next(error);
    }
}

const loginUser = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return next({
                statusCode: 400,
                message: 'Username and password are required'
            });
        }

        const userQuery = 'SELECT * FROM users WHERE username = $1';
        const userResult = await pool.query(userQuery, [username]);
        const user = userResult.rows[0];

        if (!user) {
            return next({
                statusCode: 401,
                message: 'Invalid username or password'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return next({
                statusCode: 401,
                message: 'Invalid username or password'
            });
        }

        const token = createToken(user.id);

        return res.json({ token });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    registerUser,
    loginUser
};