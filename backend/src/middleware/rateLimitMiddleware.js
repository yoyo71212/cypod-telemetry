// cypod-telemetry

const LIVE_LIMIT = process.env.LIVE_LIMIT || 10;
const BACKFILL_LIMIT = process.env.BACKFILL_LIMIT || 300;
const WINDOW_MS = process.env.WINDOW_MS || 60 * 1000;
const BACKFILL_THRESHOLD_MS = process.env.BACKFILL_THRESHOLD || 2 * 60 * 1000;

const liveHits = new Map();
const backfillHits = new Map();

function pruneAndCount(map, deviceId, now) {
    const hits = (map.get(deviceId) || []).filter((timestamp) => now - timestamp < WINDOW_MS);
    hits.push(now);
    map.set(deviceId, hits);
    return hits.length;
}

const telemetryRateLimit = (req, res, next) => {
    const { id: deviceId } = req.params;
    const { timestamp } = req.body;

    const now = Date.now();
    const recordedAt = new Date(timestamp).getTime();
    const isBackfill = !Number.isNaN(recordedAt) && (now - recordedAt) > BACKFILL_THRESHOLD_MS;

    const hitCount = isBackfill ? pruneAndCount(backfillHits, deviceId, now) : pruneAndCount(liveHits, deviceId, now);

    const limit = isBackfill ? BACKFILL_LIMIT : LIVE_LIMIT;

    if (hitCount > limit) {
        return next({
            statusCode: 429,
            message: `Rate limit exceeded for ${isBackfill ? 'backfill' : 'live'} telemetry. Limit is ${limit} requests per minute.`
        });
    }

    next();
}

module.exports = { telemetryRateLimit };