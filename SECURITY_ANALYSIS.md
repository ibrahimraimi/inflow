# Inflow Analytics - Security Analysis

## Overview
This document outlines the findings of a comprehensive security audit conducted across the Inflow Analytics codebase. The audit focused on data ingestion validation, API authentication, database ORM query mechanisms, rate limiting capabilities, and architectural limits. 

## Summary of Findings

| Severity | Vulnerability / Finding | Component Affected |
|----------|-----------------------|--------------------|
| **High** | Insecure Direct Object Reference (IDOR) on Page View Exits | `/api/track/route.ts` |
| **Medium** | Server-Side Request Forgery (SSRF) / Injection via X-Forwarded-For | `/api/track/route.ts` |
| **Medium** | Missing CORS Configuration on Public Ingestion Tunnel | `/api/track/route.ts` |
| **Low** | Ineffective Rate Limit Fallback in Serverless Deployments | `src/lib/rate-limit.ts` |
| **Low** | Permissive Content Security Policy (CSP) Directives | `next.config.ts` |

---

## Detailed Findings & Implementation Plans

### 1. High Severity: IDOR on Page View Exits
**Description:**
The tracking endpoint `/api/track` allows users or tracking scripts to submit page exit telemetry. When `body.type === "exit"` and a `body.pageViewId` is supplied, the backend blindly updates the `totalActiveTime` and `exitUrl` of the respective `pageViews.id` without validating ownership or verifying that the page view actually belongs to the requesting `clientId` or `websiteId`. 

An attacker can execute a script hitting `/api/track` iterating through integers from `pageViewId = 1` sequentially, arbitrarily overwriting telemetry stats and inserting spam `.exitUrl` across all properties in the platform.

**Implementation Plan (Fix):**
1. Modify the `where` clause inside the `pageViews` update in `src/app/api/track/route.ts`.
2. Even if `pageViewId` is supplied, enforce `clientId` and `websiteId` matches:
   ```typescript
   .where(
     body.pageViewId
       ? and(
           eq(pageViews.id, body.pageViewId),
           eq(pageViews.clientId, body.clientId),
           eq(pageViews.websiteId, body.websiteId)
         )
       : and( ... )
   )
   ```

### 2. Medium Severity: SSRF/Injection via `X-Forwarded-For`
**Description:**
The track endpoint retrieves geolocation data by making an external request: `fetch(\`https://free.freeipapi.com/api/json/${visitorIp}\`)`. 
Because `$visitorIp` is derived directly from the user-controlled `X-Forwarded-For` header without strict regex validation, an attacker can manipulate the header to execute SSRF attacks or path traversal against the external API, potentially triggering unauthorized calls or backend crashes from malformed URIs.

**Implementation Plan (Fix):**
1. Validate `ip` strictly before using it in the `fetch` request using a Regex pattern ensuring it conforms exactly to an IPv4/IPv6 address.
2. If validation fails, default to `"Unknown"` geo information rather than executing the `fetch` request.

### 3. Low Severity: Ineffective Rate Limit Fallback
**Description:**
The application utilizes `@upstash/redis` for distributed rate-limiting. However, if Redis is unavailable, it gracefully defaults to an in-memory `Map` in `src/lib/rate-limit.ts`. While standard for monoliths, in a serverless environment like Vercel (Edge or Node runtimes), each function invocation can spin up in isolated microVMs, resetting the memory state. Consequently, an attacker can bypass the fallback rate-limiter completely by continuously triggering cold starts.

**Implementation Plan (Enhancement):**
1. Accept the inherent limitation of serverless memory persistence, but reinforce critical routes (like Next.js native Authentication callbacks) by ensuring that Redis failures trigger an immediate "Fail Closed" state (deny request) on highly sensitive routes (e.g., password resets), while remaining "Fail Open" (with memory limits) on analytics ingestion.

### 4. Medium Severity: Missing CORS Configuration on Public Ingestion Tunnel
**Description:**
The `/api/track` endpoint operates as the universal ingestion tunnel for analytics events dispatched from arbitrary external websites. Currently, the endpoint expects tightly structured `application/json` `POST` requests. Modern browsers mandate a CORS preflight (`OPTIONS` request) when delivering cross-origin JSON. Since neither `src/app/api/track/route.ts` nor `next.config.ts` configure an explicit `OPTIONS` handler or append `Access-Control-Allow-Origin: *` to the tracking endpoints, tracking scripts will face hard browser rejections. 

**Implementation Plan (Fix):**
1. Export an `async function OPTIONS(req: NextRequest)` in `/api/track/route.ts` immediately returning status `200` with the standard CORS clearance headers.
2. Ensure the standard `POST` function universally includes the following headers in its response blocks:
   - `Access-Control-Allow-Origin: *`
   - `Access-Control-Allow-Methods: POST, OPTIONS`
   - `Access-Control-Allow-Headers: Content-Type`

### 5. Low Severity: Permissive Content Security Policy (CSP) Directives
**Description:**
The global security definitions inside `next.config.ts` define an excellent baseline of headers, enforcing `Strict-Transport-Security`, `X-Frame-Options`, etc. However, the Content Security Policy specifically authorizes `'unsafe-inline'` and `'unsafe-eval'` for `script-src`. While potentially necessary for dynamic rendering environments or specific third-party scripts, this notably increases the theoretical blast radius in the event a localized XSS vector is discovered throughout the platform. 

**Implementation Plan (Enhancement):**
1. Perform a script audit to determine whether UI/UX functionality strictly breaks without `'unsafe-eval'`. 
2. If feasible, remove `'unsafe-eval'` and move towards strict hash-based or nonce-based inline constraints globally.

