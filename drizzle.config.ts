import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({
  path: ".env.dev",
});

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
});
