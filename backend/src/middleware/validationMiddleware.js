// cypod-telemetry

const { body, validationResult } = require('express-validator');

const validateRegisterDevice = [
    body('device_id')
        .exists().withMessage('Device ID is required').bail()
        // note: according to sample_telemetry.json, device_id should match the format DEV-XXXX where XXXX is a 4-digit number
        .matches(/^DEV-\d{4}$/).withMessage('Device ID must match the format DEV-XXXX').bail(),
    body('name')
        .exists().withMessage('Device name is required').bail()
        .isLength({ min: 1, max: 255 }).withMessage('Device name must be between 1 and 255 characters long')
];

const validateTelemetryData = [
    body('battery')
        .exists().withMessage('Battery is required').bail()
        .isFloat({ min: 0, max: 100 }).withMessage('Battery must be a float between 0 and 100').bail()
        // note: according to sample_telemetry.json, battery can have up to 1 decimal place
        .custom((value) => {
            const decimalPlaces = value.toString().split('.')[1];
            if (decimalPlaces && decimalPlaces.length > 1) {
                throw new Error('Battery must have up to 1 decimal place');
            }
            return true;
        }),

    body('temperature')
        .exists().withMessage('Temperature is required').bail()
        .isFloat().withMessage('Temperature must be a float').bail()
        // note: according to sample_telemetry.json, temperature can have up to 1 decimal place
        .custom((value) => {
            const decimalPlaces = value.toString().split('.')[1];
            if (decimalPlaces && decimalPlaces.length > 1) {
                throw new Error('Temperature must have up to 1 decimal place');
            }
            return true;
        }),

    body('lat')
        .optional({ nullable: true })
        .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90').bail()
        // note: according to sample_telemetry.json, latitude can have up to 6 decimal places
        .custom((value) => {
            const decimalPlaces = value.toString().split('.')[1];
            if (decimalPlaces && decimalPlaces.length > 6) {
                throw new Error('Latitude must have up to 6 decimal places');
            }
            return true;
        }),

    body('lng')
        .optional({ nullable: true })
        .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180').bail()
        // note: according to sample_telemetry.json, longitude can have up to 6 decimal places
        .custom((value) => {
            const decimalPlaces = value.toString().split('.')[1];
            if (decimalPlaces && decimalPlaces.length > 6) {
                throw new Error('Longitude must have up to 6 decimal places');
            }
            return true;
        }),

    body('status')
        .exists().withMessage('Status is required').bail()
        .isIn(['OK', 'FAULT']).withMessage('Status must be either "OK" or "FAULT"')
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

module.exports = {
    validateRegisterDevice,
    validateTelemetryData,
    handleValidationErrors
};