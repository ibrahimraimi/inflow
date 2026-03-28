# Inflow Analytics - Security Policy & Audit

This document outlines the current security posture of the Inflow Analytics platform, including findings from a comprehensive monorepo-wide audit.

## Security Audit Status

| Severity | Vulnerability / Finding | Component Affected | Status | Resolution |
|----------|-----------------------|--------------------|--------|------------|
| **High** | Insecure Direct Object Reference (IDOR) on Page View Exits | `apps/api/src/app/api/track/route.ts` | **FIXED** | Ownership validation implemented. |
| **High** | Unauthorized Data Access in Server Actions | `packages/core/src/server/*.ts` | **FIXED** | Added session/membership guards. |
| **High** | Authorization Bypass in Permission Utility (`isAdmin`) | `packages/core/src/server/permissions.ts` | **FIXED** | Corrected return type and closed on error. |
| **Medium** | Server-Side Request Forgery (SSRF) / Injection via X-Forwarded-For | `apps/api/src/app/api/track/route.ts` | **FIXED** | Implemented IP format validation. |
| **Medium** | Missing CORS Configuration on Public Ingestion Tunnel | `apps/api/src/app/api/track/route.ts` | **FIXED** | Explicitly defined CORS handlers. |
| **Medium** | Missing Input Validation in Management API Routes | `apps/api/src/app/api/*` | **FIXED** | Added Zod schema parsing. |
| **Low** | Ineffective Rate Limit Fallback in Serverless Deployments | `apps/api/src/middleware.ts` | **OPEN** | Recommendation: Redis "Fail Closed". |
| **Low** | Permissive Content Security Policy (CSP) Directives | `apps/dashboard/next.config.ts` | **FIXED** | Updated to be more restrictive while allowing monorepo ports. |

---

## Detailed Security Implementation

### 1. [FIXED] High Severity: IDOR on Page View Exits
The tracking endpoint `/api/track` now strictly enforces that the `clientId` and `websiteId` match the record being updated. Previously, any valid `pageViewId` could be modified without cross-checking ownership, potentially allowing malicious telemetry overrides.

### 2. [FIXED] High Severity: Authorization Bypass in Permission Utility
The `isAdmin()` utility in `packages/core/src/server/permissions.ts` has been refactored to always return a boolean (`!!res?.success`). Previously, it returned a potentially truthy object on some error cases, which could lead to an authorization bypass if checked within a conditional block. It now correctly implements a "Fail Closed" design.

### 3. [FIXED] Medium Severity: SSRF/Injection via `X-Forwarded-For`
Before fetching external geolocation data based on an IP address, `apps/api/src/app/api/track/route.ts` now performs a strict RegEx check for valid IPv4/IPv6 formats. This prevents attackers from injecting malicious URLs or paths into the geolocation lookup mechanism.

### 4. [FIXED] Low Severity: Permissive Content Security Policy (CSP)
We have updated the `Content-Security-Policy` header in both `apps/website/next.config.ts` and `apps/dashboard/next.config.ts`. While maintaining functional interoperability within the monorepo, we have constrained `connect-src` to specifically authorized local and production endpoints.

## Reporting a Vulnerability

If you've discovered a security vulnerability in Inflow Analytics, please follow the guidelines in our [SECURITY.md](SECURITY.md) file.
