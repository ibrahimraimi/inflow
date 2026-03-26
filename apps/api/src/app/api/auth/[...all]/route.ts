import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@inflow/core/lib/auth";

/**
 * @swagger
 * /api/auth:
 *   get:
 *     summary: Authentication endpoints (Better Auth)
 *     description: Handles authentication flows like session retrieval and social login.
 *     responses:
 *       200:
 *         description: Auth response
 *   post:
 *     summary: Authentication endpoints (Better Auth)
 *     description: Handles login, signup, and other state-changing auth operations.
 *     responses:
 *       200:
 *         description: Auth response
 */
export const { POST, GET } = toNextJsHandler(auth);
