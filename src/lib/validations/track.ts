import { z } from "zod";

export const trackEventSchema = z.object({
  clientId: z.string().min(1),
  websiteId: z.string().min(1),
  domain: z.string().min(1),
  url: z.string().url().optional().or(z.string().startsWith("/")),
  type: z.enum(["entry", "exit", "ping", "event"]),
  pageViewId: z.number().int().positive().optional(),
  eventName: z.string().optional(),
  properties: z.any().optional(),
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

export const trackReplaySchema = z.object({
  websiteId: z.string().uuid(),
  clientId: z.string().min(1),
  sessionId: z.string().min(1),
  events: z.array(z.object({
    type: z.enum(["click", "scroll", "nav", "input"]),
    timestamp: z.number(),
    url: z.string().optional(),
    x: z.number().optional(),
    y: z.number().optional(),
    target: z.string().optional(),
    path: z.string().optional(),
    value: z.string().optional(),
  })),
});
