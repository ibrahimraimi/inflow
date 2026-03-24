import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@inflow/core/lib/auth";

export const { POST, GET } = toNextJsHandler(auth);
