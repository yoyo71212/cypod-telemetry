// cypod-telemetry

const express = require('express');
const router = express.Router();
const { getAlerts } = require('../controllers/alertsController');
const { protectUser } = require('../middleware/protectUser');

router.get('/', protectUser, getAlerts);

module.exports = router;