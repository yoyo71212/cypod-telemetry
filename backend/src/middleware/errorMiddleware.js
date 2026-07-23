// cypod-telemetry

const errorHandler = (err, req, res, next) => {
    const isKnownError = Boolean(err.statusCode);
    const statusCode = err.statusCode || 500;

    console.error(`{ success: ${false}, statusCode: ${statusCode}, message: ${err.message} }`);

    res.status(statusCode).json({
        success: false,
        message: isKnownError ? err.message : "Internal Server Error",
    });
}

module.exports = errorHandler;