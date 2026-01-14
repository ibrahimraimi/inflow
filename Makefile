.PHONY: help dev build start lint format type-check docker-build docker-up docker-down docker-logs clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## Start development server
	bun dev

build: ## Build the application
	bun run build

start: ## Start production server
	bun start

lint: ## Run linter
	bun run lint

format: ## Format code
	bun run format

type-check: ## Run TypeScript type checking
	bunx tsc --noEmit

db-generate: ## Generate database migrations
	bun db:generate

db-migrate: ## Run database migrations
	bun db:migrate

db-push: ## Push database schema
	bun db:push

docker-build: ## Build Docker image
	docker build -t inflow:latest .

docker-up: ## Start Docker containers
	docker compose up -d

docker-down: ## Stop Docker containers
	docker compose down

docker-logs: ## View Docker container logs
	docker compose logs -f

docker-rebuild: ## Rebuild and restart Docker containers
	docker compose up -d --build

clean: ## Clean build artifacts
	rm -rf .next node_modules

install: ## Install dependencies
	bun install

ci: lint type-check build ## Run CI checks locally
