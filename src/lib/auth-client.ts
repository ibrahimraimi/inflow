import {
  lastLoginMethodClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.BASE_URL || "https://inflow.studio21.studio",
  plugins: [organizationClient(), lastLoginMethodClient()],
});
