CREATE TABLE "websites" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "websites_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"websiteId" varchar(255) NOT NULL,
	"domain" varchar(255) NOT NULL,
	"timeZone" varchar(100) NOT NULL,
	"enableLocalhostTracking" boolean DEFAULT false,
	"user_id" text NOT NULL,
	CONSTRAINT "websites_websiteId_unique" UNIQUE("websiteId"),
	CONSTRAINT "websites_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
ALTER TABLE "websites" ADD CONSTRAINT "websites_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;