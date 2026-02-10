import { z } from "zod";

export const trackEventSchema = z.object({
  clientId: z.string().min(1),
  websiteId: z.string().uuid(),
  domain: z.string().min(1),
  url: z.string().url().optional().or(z.string().startsWith("/")),
  type: z.enum(["entry", "exit"]),
  referrer: z.string().optional(),
  entryTime: z.string().datetime().optional(),
  exitTime: z.string().datetime().optional(),
  totalActiveTime: z.number().int().nonnegative().optional(),
  urlParams: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
  refParams: z.string().optional(),
  exitUrl: z.string().optional(),
});
