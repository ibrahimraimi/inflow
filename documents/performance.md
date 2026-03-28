# Inflow Analytics - Performance Guide

This document identifies major performance characteristics, critical bottlenecks, and optimization opportunities across the Inflow Analytics platform.

## 1. Ingestion Pipeline (`packages/sdk` & `apps/api`)

The ingestion pipeline handles large streams of incoming telemetry from client-side tracking scripts.

### Completed Optimizations
- **[x] Event Batching**: `packages/sdk` implements a batching mechanism that collects multiple tracking events (nav, click, ping) and flushes them to the API either after a short delay (1000ms) or once the queue reaches 10 items. This drastically reduces HTTP overhead for active users.
- **[x] In-Memory Caching (LRU)**: `apps/api/src/app/api/track/route.ts` utilizes an LRU cache (`lru-cache`) to store valid API Key lookups and website ownership flags, preventing redundant database calls for every tracking ping.
- **[x] Edge Optimized**: The tracking API uses optimized Edge-ready logic for geolocation detection and fast record ingestion.

### Optimization Opportunities
- **[ ] Payload Compression**: Use Brotli/Gzip for delivery of the tracking script from the CDN.
- **[ ] Global Ingestion Points**: Expand `apps/api` across more globally distributed edge regions for zero-latency ingestion.

## 2. Analytics Aggregation (`packages/core/src/server/services`)

Data heavy aggregations are performed by the `AnalyticsService`.

### Completed Optimizations
- **[x] SQL-Native Aggregation**: Heavy processing for visitor metrics (Unique Visitors, Bounce Rate) is performed via PostgreSQL within `packages/core`. This minimizes JS-side memory usage and maximizes database utilization.
- **[x] Performance Indexing**: The `page_views` table in `packages/db` includes a composite index `(website_id, entry_time)` to ensure fast filtering over large time ranges.

### Optimization Opportunities
- **[ ] HyperLogLog**: For extremely high-traffic scenarios (>1M uniques/day), implement Redis HyperLogLog for lightning-fast approximate unique counting.
- **[ ] Materialized Views**: For dashboard overview stats, implement materialized views refreshed on a set interval.

## 3. Dashboard Performance (`apps/dashboard`)

The user-facing dashboard where high-density visualizations are rendered.

### Completed Optimizations
- **[x] Next.js Dynamic Component Loading**: Heavy charting components are dynamically imported (`next/dynamic`) to keep the initial dashboard shell bundle fast and responsive.
- **[x] SWR-based Caching**: The dashboard utilizes `swr` for data fetching, ensuring that navigation between websites and analytics tabs is fast by reusing cached results and updating in the background.

### Optimization Opportunities
- **[ ] Viewport Virtualization**: For large data tables (e.g., in a busy "Top Pages" list), utilize virtualization to render only visible items, keeping the DOM footprint small.

## 4. Strategic Performance Roadmap

| Optimization | Priority | Impact | Effort |
| :--- | :--- | :--- | :--- |
| **Indexing (websiteId, entryTime)** | COMPLETED | HIGH | LOW |
| **SDK Event Batching** | COMPLETED | HIGH | MED |
| **Redis Key Caching** | HIGH | VERY HIGH | MED |
| **Dashboard Virtualization** | LOW | MED | LOW |
