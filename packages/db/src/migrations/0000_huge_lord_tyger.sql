CREATE TYPE "public"."role" AS ENUM('member', 'admin', 'owner');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_key_usage_logs" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"api_key_id" varchar(255) NOT NULL,
	"endpoint" text NOT NULL,
	"method" varchar(10) NOT NULL,
	"status" integer NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"key_hash" text NOT NULL,
	"hint" varchar(255) NOT NULL,
	"name" varchar(255),
	"user_id" text NOT NULL,
	"scope" varchar(50) DEFAULT 'all' NOT NULL,
	"created_at" timestamp NOT NULL,
	"last_used_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"website_id" varchar(255) NOT NULL,
	"client_id" varchar(255) NOT NULL,
	"event_name" varchar(255) NOT NULL,
	"properties" jsonb,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "funnels" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "funnels_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"website_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"steps" jsonb NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "links" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "links_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"link_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"short_code" varchar(255) NOT NULL,
	"destination_url" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "links_link_id_unique" UNIQUE("link_id"),
	CONSTRAINT "links_short_code_unique" UNIQUE("short_code")
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"logo" text,
	"created_at" timestamp NOT NULL,
	"metadata" text,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "page_views_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"client_id" varchar(255),
	"website_id" varchar(255) NOT NULL,
	"domain" varchar(255) NOT NULL,
	"url" text,
	"type" varchar(100) NOT NULL,
	"referrer" varchar(2048),
	"entry_time" timestamp,
	"exit_time" timestamp,
	"total_active_time" integer,
	"url_params" varchar,
	"utm_source" varchar(255),
	"utm_medium" varchar(255),
	"utm_campaign" varchar(255),
	"utm_term" varchar(255),
	"utm_content" varchar(255),
	"device" varchar,
	"os" varchar,
	"browser" varchar,
	"city" varchar,
	"region" varchar,
	"country" varchar,
	"country_code" varchar,
	"ref_params" varchar,
	"exit_url" varchar
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"active_organization_id" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "session_replays" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "session_replays_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"website_id" varchar(255) NOT NULL,
	"client_id" varchar(255) NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"events" jsonb NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "websites" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "websites_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"websiteId" varchar(255) NOT NULL,
	"websiteName" varchar(255) NOT NULL,
	"domain" varchar(255) NOT NULL,
	"timeZone" varchar(100) NOT NULL,
	"enableLocalhostTracking" boolean DEFAULT false,
	"is_public" boolean DEFAULT false,
	"public_token" varchar(255),
	"user_id" text NOT NULL,
	"api_key" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "websites_websiteId_unique" UNIQUE("websiteId"),
	CONSTRAINT "websites_domain_unique" UNIQUE("domain"),
	CONSTRAINT "websites_public_token_unique" UNIQUE("public_token"),
	CONSTRAINT "websites_api_key_unique" UNIQUE("api_key")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_key_usage_logs" ADD CONSTRAINT "api_key_usage_logs_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_website_id_websites_websiteId_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("websiteId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funnels" ADD CONSTRAINT "funnels_website_id_websites_websiteId_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("websiteId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_website_id_websites_websiteId_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("websiteId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "websites" ADD CONSTRAINT "websites_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_page_views_website_id_entry_time" ON "page_views" USING btree ("website_id","entry_time");