// cypod-telemetry

// note: deviceId -> { value, expiresAt }
const cache = new Map();
const CACHE_TTL = 30 * 1000;

function getCachedTelemetry(deviceId) {
    const cachedData = cache.get(deviceId);

    if (!cachedData) {
        return null;
    }

    if (Date.now() > cachedData.expiresAt) {
        cache.delete(deviceId);
        return null;
    }
    
    return cachedData.data;
}

function setCachedTelemetry(deviceId, data) {
    cache.set(deviceId, {
        data,
        expiresAt: Date.now() + CACHE_TTL
    });
}

function invalidateCache(deviceId) {
    cache.delete(deviceId);
}

module.exports = {
    getCachedTelemetry,
    setCachedTelemetry,
    invalidateCache
};