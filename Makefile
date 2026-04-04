.PHONY: help dev build start lint format type-check db-generate db-migrate db-push docker-build docker-up docker-down docker-logs clean install ci

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

run: ## Start development server
	bun run dev

build: ## Build the applications
	bun run build

start: ## Start production servers
	bun run start

lint: ## Run linter
	bun run lint

format: ## Format code
	bun run format

type-check: ## Run TypeScript type checking across workspace
	bun turbo lint:types

db-generate: ## Generate database migrations
	bun --filter @inflow/db db:generate

db-migrate: ## Run database migrations
	bun --filter @inflow/db db:migrate

db-push: ## Push database schema
	bun --filter @inflow/db db:push

docker-build: ## Build Docker images
	docker compose build

docker-up: ## Start Docker containers
	docker compose up -d

docker-down: ## Stop Docker containers
	docker compose down

docker-logs: ## View Docker container logs
	docker compose logs -f

docker-rebuild: ## Rebuild and restart Docker containers
	docker compose up -d --build

clean: ## Clean build artifacts
	rm -rf apps/**/.next node_modules packages/**/dist

install: ## Install dependencies
	bun install

ci: lint type-check build ## Run CI checks locally
