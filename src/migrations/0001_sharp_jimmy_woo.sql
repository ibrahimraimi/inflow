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
ALTER TABLE "events" ADD CONSTRAINT "events_website_id_websites_websiteId_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("websiteId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funnels" ADD CONSTRAINT "funnels_website_id_websites_websiteId_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("websiteId") ON DELETE cascade ON UPDATE no action;