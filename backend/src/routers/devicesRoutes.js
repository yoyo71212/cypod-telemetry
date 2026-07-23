// cypod-telemetry

const express = require('express');
const router = express.Router();

const {
    getDevices,
    registerDevice,
} = require('../controllers/devicesController');
const { protectUser } = require('../middleware/protectUser');
const { validateTelemetryData, handleValidationErrors } = require('../middleware/validationMiddleware');
const { telemetryRateLimit } = require('../middleware/rateLimitMiddleware');

router.get('/', protectUser, getDevices);
router.post('/', protectUser, registerDevice);

module.exports = router;