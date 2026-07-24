## How to Run

Requirements: Docker + Docker Compose and a filled `.env` file.

`.env`:
```
# SERVER
PORT=3000

# TELEMETRY
TELEMETRY_BACKFILL_THRESHOLD=120000
LIVE_LIMIT=100
BACKFILL_LIMIT=300
WINDOWS_MS=60000
BATTERY_ALERT_THRESHOLD=20
TEMPERATURE_ALERT_THRESHOLD=35

# POSTGRES
POSTGRES_HOST=<postgres_host>
POSTGRES_USER=<postgres_user>
POSTGRES_PASSWORD=<postgres_password>
POSTGRES_DB=<postgres_db>

# JWT
JWT_SECRET=<your_jwt_secret>
```

To start the project, run the following commands:
```
git clone https://github.com/yoyo71212/cypod-telemetry
cd cypod-telemetry
docker-compose up --build -d
```

Cache-aside — invalidate on write rather than update-in-place, so the cache can never diverge from what's actually committed to 
the database.