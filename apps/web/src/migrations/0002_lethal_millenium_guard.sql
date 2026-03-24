ALTER TABLE "websites" ADD COLUMN "is_public" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "websites" ADD COLUMN "public_token" varchar(255);--> statement-breakpoint
ALTER TABLE "websites" ADD CONSTRAINT "websites_public_token_unique" UNIQUE("public_token");