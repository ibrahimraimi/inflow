import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";

import { schema } from "./schema";

config({ path: ".env" });
config({ path: ".env" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "DATABASE_URL is not set. Database operations will fail at runtime."
    );
  }
}

// We use a dummy URL for build time if none is provided to prevent crashes during static analysis
export const db = drizzle(
  databaseUrl || "postgresql://user:password@localhost/placeholder",
  { schema }
);
