.PHONY: up down migrate sam-local test-alpha test-beta

# Start infrastructure
up:
	docker-compose up -d

# Stop infrastructure
down:
	docker-compose down

# Run Drizzle migrations (Assumes drizzle-kit is configured)
migrate:
	npx drizzle-kit push

# Start SAM local API
sam-local:
	sam local start-api --env-vars locals.json --docker-network betterhr-net

# Helper to test Company Alpha Admin
test-alpha:
	curl -H "x-dev-role: ADMIN" http://localhost:3000/employees

# Helper to test Company Beta Employee
test-beta:
	curl -H "x-dev-role: EMPLOYEE" http://localhost:3000/employees
