# Inflow Architecture - Overview & Roadmap

This document evaluates the current state of Inflow's architecture following the migration to a high-performance monorepo and provides a strategic roadmap for future scaling.

## Project Overview

Inflow is a modern, privacy-focused, self-hosted analytics platform designed as a lightweight alternative to Google Analytics. It is organized as a **Turborepo** monorepo using **Bun** workspaces.

### Global Directory Organization
```text
.
├── apps/                # Standalone applications
│   ├── api/             # Backend API & Data Ingestion (Port 3001)
│   ├── dashboard/       # Main User Dashboard (Port 3002)
│   └── website/         # Marketing Site & Documentation (Port 3000)
├── packages/            # Internal shared libraries
│   ├── core/            # Business logic, services, and shared server actions
│   ├── db/              # Database schema and Drizzle client
│   ├── types/           # Global TypeScript interfaces
│   ├── sdk/             # Client-side tracking script
│   ├── ui/              # Shared design system & analytics components
│   ├── config-typescript/ # Base TS configurations
│   └── config-biome/    # Base Biome configurations
```

## Recent Improvements

- **High-Performance Ingestion**: The `/api/track` endpoint in `apps/api` is optimized for global delivery, utilizing an `LRUCache` to persist valid API keys and website lookups, significantly reducing database load on high-traffic paths.
- **Service-Oriented Architecture**: Business logic has been extracted from API routes into dedicated services within `packages/core/src/server/services` (e.g., `AnalyticsService`, `TeamService`, `EventsService`).
- **Distributed Rate Limiting**: Redis-backed implementation via Upstash with in-memory fallback for high reliability.
- **Improved Security**: Comprehensive fixes for IDOR (Insecure Direct Object Reference) and server-side authorization bypasses have been implemented across the ingestion and management APIs.

## Code Quality Assessment

### Strengths
- **End-to-End Type Safety**: Shared types in `packages/types` and strict Zod validation (`packages/core/src/lib/validations`) ensure data integrity across the entire monorepo.
- **Unified Design System**: All visualization and UI components are centralized in `packages/ui` for consistency and rapid prototyping.
- **Developer Experience**: Integrated local development environment via Docker (PostgreSQL & Redis) and standard `make` commands.

### Areas for Improvement (Roadmap)
- **Tracking Script Enhancements**: While the SDK supports event batching, the `packages/sdk` can be further optimized for smaller footprint and even more robust exit tracking using `navigator.sendBeacon`.
- **Period-over-Period Data**: Enhance `AnalyticsService` to support historical comparison (e.g., this week vs. last week) in the dashboard visualizations.
- **E2E Testing Suite**: Implement a comprehensive Playwright/Cypress suite covering the full user lifecycle (signup -> onboarding -> integration -> analytics).

## Strategic Roadmap

### Phase 1 (Core Optimization)
- [x] Migrate to Monorepo (apps/packages architecture)
- [x] Implement Redis-backed rate limiting
- [x] Extract core services (Analytics, Teams)
- [x] Fix critical IDOR and security flaws

### Phase 2 (Scale & Insights)
- [ ] Implement event batching in the production SDK script.
- [ ] Add historical period-over-period comparisons in the dashboard.
- [ ] Expand the E2E testing suite for critical paths.

### Phase 3 (Global Distribution)
- [ ] Implement a message queue (e.g., Upstash QStash) to decouple ingestion from DB writes during traffic spikes.
- [ ] Add multi-region read-replicas for faster global dashboard performance.
