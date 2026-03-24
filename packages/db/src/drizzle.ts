import { drizzle } from "drizzle-orm/neon-http";

import { schema } from "./schema";

const databaseUrl = process.env.DATABASE_URL;

// Dummy URL is provided to prevent crashes during static analysis
export const db = drizzle(
  databaseUrl || "postgresql://user:password@localhost/placeholder",
  { schema }
);
