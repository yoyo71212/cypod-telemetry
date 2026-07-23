// cypod-telemetry

const express = require('express');
const router = express.Router();

const {
    getDevices,
    registerDevice,
    addTelemetry
} = require('../controllers/devicesController');
const { protectUser } = require('../middleware/protectUser');
const { validateRegisterDevice, validateTelemetryData, handleValidationErrors } = require('../middleware/validationMiddleware');
const { telemetryRateLimit } = require('../middleware/rateLimitMiddleware');

router.get('/', protectUser, getDevices);
router.post('/', protectUser, validateRegisterDevice, handleValidationErrors, registerDevice);
router.post('/:id/telemetry', protectUser, telemetryRateLimit, validateTelemetryData, handleValidationErrors, addTelemetry);

module.exports = router;