# Inflow Analytics - Security Analysis

## Overview
This document outlines the findings of a comprehensive security audit conducted across the Inflow Analytics codebase. The audit focused on data ingestion validation, API authentication, database ORM query mechanisms, rate limiting capabilities, and architectural limits.

## Summary of Findings

| Severity | Vulnerability / Finding | Component Affected | Status |
|----------|-----------------------|--------------------|--------|
| **High** | Insecure Direct Object Reference (IDOR) on Page View Exits | `apps/api/src/app/api/track/route.ts` | [FIXED] |
| **High** | Unauthorized Data Access in Server Actions | `packages/core/src/server/*.ts` | [FIXED] |
| **High** | Authorization Bypass in Permission Utility (`isAdmin`) | `packages/core/src/server/permissions.ts` | [FIXED] |
| **Medium** | Server-Side Request Forgery (SSRF) / Injection via X-Forwarded-For | `apps/api/src/app/api/track/route.ts` | [FIXED] |
| **Medium** | Missing CORS Configuration on Public Ingestion Tunnel | `apps/api/src/app/api/track/route.ts` | [FIXED] |
| **Medium** | Missing Input Validation in Management API Routes | `apps/api/src/app/api/*` | [FIXED] |
| **Low** | Ineffective Rate Limit Fallback in Serverless Deployments | `apps/api/src/middleware.ts` | [OPEN] |
| **Low** | Permissive Content Security Policy (CSP) Directives | `apps/web/next.config.ts` | [OPEN] |
| **Low** | Potential CSS Injection in Chart Component | `packages/core/src/components/ui/chart.tsx` | [OPEN] |

---

## Detailed Findings & Implementation Plans

### 1. [FIXED] High Severity: IDOR on Page View Exits
**Description:**
The tracking endpoint `/api/track` allowed users or tracking scripts to submit page exit telemetry without validating ownership. When `body.type === "exit"` and a `body.pageViewId` was supplied, the backend previously updated telemetry without verifying membership.
**Resolution:**
The `where` clause in `apps/api/src/app/api/track/route.ts` now strictly enforces `clientId` and `websiteId` matches before updating telemetry, preventing arbitrary record overrides.

### 2. [FIXED] High Severity: Unauthorized Data Access in Server Actions
**Description:**
Several Server Actions lacked proper session or permission guards, potentially allowing unauthenticated access to sensitive organization/user lists.
**Resolution:**
All sensitive Server Actions in `packages/core/src/server` (e.g., `getUsers`, `getOrganizations`, `addMember`) now correctly call `getCurrentUser()` and verify relevant permissions or membership before returning data or performing mutations.

### 3. [FIXED] High Severity: Authorization Bypass in Permission Utility (`isAdmin`)
**Description:**
The `isAdmin()` utility returned an object on error instead of a boolean. Since JavaScript objects are truthy, a failed permission check (due to an internal error or network failure) could be interpreted as "authorized" if called via `if (!isAdmin())`.
**Resolution:**
Fixed in `packages/core/src/server/permissions.ts` to always return a boolean (`!!res?.success`) and fail closed (return `false`) on any error or exception.

### 4. [FIXED] Medium Severity: SSRF/Injection via `X-Forwarded-For`
**Description:**
The track endpoint retrieved geolocation data by making an external request with user-controlled IP strings, which could lead to SSRF.
**Resolution:**
Implemented strict IP address format validation (Regex) for the `visitorIp` before making external fetch requests. Malformed inputs now default to "Unknown" geolocation without triggering a lookup.

### 5. [FIXED] Medium Severity: Missing CORS Configuration on Public Ingestion Tunnel
**Description:**
The `/api/track` endpoint lacked explicit CORS headers, causing browser rejections for cross-origin tracking scripts.
**Resolution:**
Implemented a global `CORS_HEADERS` object and an `OPTIONS` handler in `apps/api/src/app/api/track/route.ts`, allowing authorized cross-origin `POST` requests from the SDK.

### 6. [FIXED] Medium Severity: Missing Input Validation in Management API Routes
**Description:**
Management API routes accepted payloads without formal validation, potentially allowing malformed data injection.
**Resolution:**
Implemented Zod schemas for all management payloads (websites, links, API keys) in `apps/api` and used `safeParse()` in each endpoint to return `400 Bad Request` on invalid inputs.

### 7. [OPEN] Low Severity: Ineffective Rate Limit Fallback
**Description:**
The application utilizes `@upstash/redis` for distributed rate-limiting, but defaults to an in-memory `Map`. In serverless environments, this can be bypassed by cold-start triggers.
**Recommendation:**
Reinforce critical routes (like password resets) by ensuring that Redis failures trigger a "Fail Closed" state on highly sensitive paths.

### 8. [OPEN] Low Severity: Permissive Content Security Policy (CSP)
**Description:**
The Content Security Policy authorizes `'unsafe-inline'` and `'unsafe-eval'` for `script-src`.
**Recommendation:**
Move towards strict hash-based or nonce-based inline constraints globally and remove `'unsafe-eval'` if not strictly required by third-party SDKs.

### 9. [OPEN] Low Severity: Potential CSS Injection in Chart Component
**Description:**
The `ChartStyle` component uses `dangerouslySetInnerHTML` for CSS variables.
**Recommendation:**
Sanitize keys and values used in the CSS generation to prevent style-based injection if UI configurations are ever user-influenced.
