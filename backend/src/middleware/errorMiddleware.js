const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || res.statusCode || 500;

    console.error(`{ success: ${false}, statusCode: ${statusCode}, message: ${err.message} }`);

    res.status(statusCode).json({
        success: false,
        message:  err.message || "Internal Server Error",
    });
}

module.exports = errorHandler;