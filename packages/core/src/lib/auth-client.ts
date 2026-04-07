import {
  lastLoginMethodClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { getBaseUrl } from "./url";

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [organizationClient(), lastLoginMethodClient()],
});
