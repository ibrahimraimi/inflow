import { relations } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  integer,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  activeOrganizationId: text("active_organization_id"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at").notNull(),
  metadata: text("metadata"),
});

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
}));

export type Organization = typeof organization.$inferSelect;

export const role = pgEnum("role", ["member", "admin", "owner"]);

export type Role = (typeof role.enumValues)[number];

export const member = pgTable("member", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: role("role").default("member").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export type Member = typeof member.$inferSelect & {
  user: typeof user.$inferSelect;
};

export type User = typeof user.$inferSelect;

export const invitation = pgTable("invitation", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const websites = pgTable("websites", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  websiteId: varchar({ length: 255 }).notNull().unique(),
  websiteName: varchar({ length: 255 }).notNull(),
  domain: varchar({ length: 255 }).notNull().unique(),
  timeZone: varchar({ length: 100 }).notNull(),
  enableLocalhostTracking: boolean().default(false),
  isPublic: boolean("is_public").default(false),
  publicToken: varchar("public_token", { length: 255 }).unique(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  apiKey: varchar("api_key", { length: 255 }).unique(),
});

export const links = pgTable("links", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  linkId: varchar("link_id", { length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  shortCode: varchar("short_code", { length: 255 }).notNull().unique(),
  destinationUrl: text("destination_url").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const pageViews = pgTable("page_views", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  clientId: varchar("client_id", { length: 255 }),
  websiteId: varchar("website_id", { length: 255 })
    .notNull()
    .references(() => websites.websiteId, { onDelete: "cascade" }),
  domain: varchar("domain", { length: 255 }).notNull(),
  url: text("url"),
  type: varchar("type", { length: 100 }).notNull(),
  referrer: varchar("referrer", { length: 2048 }),
  entryTime: varchar("entry_time", { length: 100 }),
  exitTime: varchar("exit_time", { length: 100 }),
  totalActiveTime: integer("total_active_time"),
  urlParams: varchar("url_params"),
  utmSource: varchar("utm_source", { length: 255 }),
  utmMedium: varchar("utm_medium", { length: 255 }),
  utmCampaign: varchar("utm_campaign", { length: 255 }),
  utmTerm: varchar("utm_term", { length: 255 }),
  utmContent: varchar("utm_content", { length: 255 }),
  device: varchar("device"),
  os: varchar("os"),
  browser: varchar("browser"),
  city: varchar("city"),
  region: varchar("region"),
  country: varchar("country"),
  countryCode: varchar("country_code"),
  refParams: varchar("ref_params"),
  exitUrl: varchar("exit_url"),
});
export const events = pgTable("events", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  websiteId: varchar("website_id", { length: 255 })
    .notNull()
    .references(() => websites.websiteId, { onDelete: "cascade" }),
  clientId: varchar("client_id", { length: 255 }).notNull(),
  eventName: varchar("event_name", { length: 255 }).notNull(),
  properties: jsonb("properties"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const funnels = pgTable("funnels", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  websiteId: varchar("website_id", { length: 255 })
    .notNull()
    .references(() => websites.websiteId, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  steps: jsonb("steps").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const apiKeys = pgTable("api_keys", {
  id: varchar("id", { length: 255 }).primaryKey(),
  keyHash: text("key_hash").notNull(),
  hint: varchar("hint", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  scope: varchar("scope", { length: 50 }).default("all").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  lastUsedAt: timestamp("last_used_at"),
});

export const apiKeyUsageLogs = pgTable("api_key_usage_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  apiKeyId: varchar("api_key_id", { length: 255 })
    .notNull()
    .references(() => apiKeys.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  status: integer("status").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});
export const sessionReplays = pgTable("session_replays", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  websiteId: varchar("website_id", { length: 255 })
    .notNull(),
  clientId: varchar("client_id", { length: 255 }).notNull(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  events: jsonb("events").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const schema = {
  user,
  session,
  account,
  verification,
  organization,
  member,
  invitation,
  websites,
  links,
  pageViews,
  events,
  funnels,
  apiKeys,
  apiKeyUsageLogs,
  sessionReplays,
  organizationRelations,
  memberRelations,
};
