import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";

import { schema } from "./schema";

config({ path: ".env.dev" });

export const db = drizzle(process.env.DATABASE_URL as string, { schema });
