// cypod-telemetry

const express = require('express');
const cors = require('cors');

const errorHandler = require('./middleware/errorMiddleware');

const authRoutes = require('./routers/authRoutes');
const devicesRoutes = require('./routers/devicesRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/auth', authRoutes);

app.use('/devices', devicesRoutes);

app.use(errorHandler);

module.exports = app;