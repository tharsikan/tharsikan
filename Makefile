.PHONY: up down db-migrate seed sam-local dev-env

# Start infrastructure
up:
	docker-compose up -d

# Stop infrastructure
down:
	docker-compose down

# Run Drizzle migrations (assuming drizzle-kit is configured)
db-migrate:
	npx drizzle-kit push

# Seed the database (manual trigger if needed, though docker-compose does it on first run)
seed:
	docker exec -i betterhr-db psql -U postgres -d betterhr < seed.sql

# Start SAM local API
sam-local:
	sam local start-api --env-vars locals.json --docker-network betterhr-net --warm-containers EAGER

# Full dev environment setup
dev-env: up db-migrate sam-local
