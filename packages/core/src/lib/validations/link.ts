import { z } from "zod";

export const linkCreateSchema = z.object({
  linkId: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  shortCode: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/),
  destinationUrl: z.string().url(),
});
