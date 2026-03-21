import { z } from "zod";

export const apiKeyCreateSchema = z.object({
  name: z.string().min(1).max(100).optional().default("API Key"),
  scope: z.enum(["all", "read_stats", "write_stats"]).optional().default("all"),
});
