# Inflow Analytics Performance Audit

## Overview
This document outlines the performance characteristics of the Inflow Analytics platform and identifies critical bottlenecks and optimization opportunities across the monorepo architecture.

## 1. Ingestion Pipeline (packages/sdk & apps/api)
### Current State
- **SDK Footprint**: ~15KB (uncompressed) script included on host websites.
- **Delivery Strategy**: Events are sent immediately via `fetch` with `keepalive: true`.
- **API Bottleneck**: Each tracking request performs a DB query for API Key validation and website ownership.

### Optimization Opportunities
- [x] **Event Batching**: Implement a small delay (e.g., 500ms-1s) in the SDK to batch multiple events (nav, click, scroll) into a single POST request to reduce HTTP overhead.
- [x] **In-Memory Caching**: Cache valid API Keys and Website Ownership lookups using an LRU memory cache to avoid DB hits on every single tracking event.
- [ ] **Zstandard Compression**: Use Brotli/Gzip for SDK payload delivery.

## 2. Analytics Aggregation (apps/api/src/app/api/website)
### Current State
- **Aggregate Logic**: Currently performs heavy JS-side processing for visitor metrics (Unique Visitors, Bounce Rate, etc.) after fetching multiple rows.
- **Query Depth**: Some queries lack specific indexes for `entryTime` ranges.

### Optimization Opportunities
- [x] **Database Aggregation**: Move heavy JS-side filtering/mapping into PostgreSQL using `jsonb_agg` or materialized views for high-traffic websites.
- [x] **Indexing**: Add composite indexes on `(website_id, entry_time)` to speed up date-range filtering.
- [ ] **HyperLogLog**: For unique visitor counts at scale, consider using Redis HyperLogLog to avoid counting unique IDs in SQL on every request.

## 3. Frontend / Dashboard (apps/web)
### Current State
- **Rendering**: Heavy use of Next.js Server Components for data fetching.
- **Client Bundles**: Dashboard uses several charting libraries (Recharts/Lucide) which impact initial load.

### Optimization Opportunities
- [x] **Dynamic Imports**: Use `next/dynamic` for heavy chart components to keep them out of the main bundle during initial dashboard shell rendering.
- [x] **SWR/React Query Caching**: Standardize on a robust client-side caching strategy to prevent redundant API calls when navigating between dashboard tabs.
- [x] **Image Optimization**: Ensure all static assets and favicons use `next/image` or optimized formats (AVIF).

## 4. Build & Monorepo Infrastructure
### Current State
- **Turborepo**: Using basic caching for builds.
- **Deployments**: Separate Vercel deployments for Web and API.

### Optimization Opportunities
- [x] **Remote Caching**: Enable Turborepo Remote Caching to speed up CI/CD pipeline runs.
- [x] **Docker Layer Caching**: Optimize Dockerfiles for the `standalone` output mode to reuse layers more effectively.

## 5. Summary of Recommendations
| Component | Priority | Impact | Effort |
| :--- | :--- | :--- | :--- |
| API Key Redis Caching | CRITICAL | HIGH | MED |
| DB Indexing (EntryTime) | HIGH | HIGH | LOW |
| SDK Event Batching | MEDIUM | MED | MED |
| Dashboard Dynamic Imports | LOW | LOW | LOW |
