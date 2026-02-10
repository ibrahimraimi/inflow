import { z } from "zod";

export const websiteCreateSchema = z.object({
  websiteId: z.string().uuid(),
  websiteName: z.string().min(1).max(255),
  domain: z
    .string()
    .url()
    .or(
      z
        .string()
        .regex(
          /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i,
        ),
    ),
  timeZone: z.string().min(1),
  enableLocalhostTracking: z.boolean().optional().default(false),
});

export const websiteQuerySchema = z.object({
  websiteId: z.string().uuid().optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  websiteOnly: z.enum(["true", "false"]).optional(),
});
