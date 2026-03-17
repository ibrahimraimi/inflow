CREATE TABLE "api_keys" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"key_hash" text NOT NULL,
	"hint" varchar(255) NOT NULL,
	"name" varchar(255),
	"user_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"last_used_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;