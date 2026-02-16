# Inflow Analytics - Feature Roadmap

This document outlines proposed features to enhance the Inflow Analytics platform. These features are prioritized based on user value, developer experience, and scalability.

## 1. Analytics Core Enhancements

### Custom Event Tracking
- **Description**: Allow users to track custom events beyond page views (e.g., button clicks, form submissions, video plays).
- **Implementation**: Update `analytics.js` to support an `inflow.track('event_name', { props })` method. Add an `events` table to the database.

### Conversion Funnels
- **Description**: Define steps in a user journey and analyze drop-off rates at each stage.
- **Implementation**: Create a UI to define paths based on URLs or custom events. SQL-based analysis of session flow.

### Duration & Bounce Rate Refinement
- **Description**: More accurate tracking of time-on-page and bounce rates.
- **Implementation**: Improve the heartbeat mechanism in `analytics.js` and calculate exit rates more robustly in `track/route.ts`.

---

## 2. Reporting & Notifications

### Scheduled Email Digests
- **Description**: Weekly or monthly summary reports sent to organization members.
- **Implementation**: Use a cron job (via GitHub Actions or a dedicated worker) and the existing `Resend` integration to send HTML emails.

### Traffic Spike Alerts
- **Description**: Instant notifications (Email, Slack, or Webhook) when traffic exceeds a defined threshold or drops unexpectedly.
- **Implementation**: Background worker to monitor `page_views` trends and trigger alerts via `Resend` or custom webhooks.

---

## 3. User Experience & Collaboration

### Public Dashboards (Shared Links)
- **Description**: Create read-only, shareable URLs for specific website analytics.
- **Implementation**: Add a `is_public` flag to the `websites` table and generate unique tokens for access without authentication.

### Team Annotations
- **Description**: Allow team members to add notes (annotations) to the analytics timeline (e.g., "Launched marketing campaign", "Updated landing page").
- **Implementation**: New `annotations` table linked to `website_id`. Show as markers on the dashboard charts.

### Dark Mode & Custom Branding
- **Description**: Fully support dark mode (via `next-themes`) and allow organizations to upload custom logos for reports.
- **Implementation**: Leverage the existing `organization.logo` field and update UI components to support white-labeling.

---

## 4. Advanced Analysis

### Retention Cohorts
- **Description**: Analyze how many users return over time (Daily/Weekly/Monthly).
- **Implementation**: Group users by their first seen date and track subsequent sessions.

### UTM & Campaign Deep-dive
- **Description**: Dedicated view for campaign performance based on UTM parameters.
- **Implementation**: Aggregation of `utm_source`, `utm_medium`, and `utm_campaign` in the dashboard UI.

---

## 5. Integrations & API

### External API Keys
- **Description**: Allow developers to fetch their analytics data programmatically.
- **Implementation**: New `api_keys` table. Add a middleware to validate `Authorization: Bearer <key>` on a new `/api/v1/stats` endpoint.

### CMS Plugins (WordPress, Shopify)
- **Description**: Low-code integration for popular CMS platforms.
- **Implementation**: Create lightweight wrappers around the `analytics.js` script for easy installation.

---

## Priorities & Roadmap

| Feature | Priority | Complexity |
| :--- | :--- | :--- |
| Custom Events | High | Medium |
| Email Digests | Medium | Medium |
| Public Dashboards | High | Low |
| API Access | Medium | Medium |
| Funnels | Low | High |
