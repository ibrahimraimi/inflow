CREATE TABLE "page_views" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "page_views_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"client_id" varchar(255),
	"website_id" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"type" varchar(100) NOT NULL,
	"referrer" varchar(2048),
	"entry_time" varchar(100),
	"exit_time" varchar(100),
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
	"ref_params" varchar
);
--> statement-breakpoint
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_website_id_websites_websiteId_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("websiteId") ON DELETE cascade ON UPDATE no action;