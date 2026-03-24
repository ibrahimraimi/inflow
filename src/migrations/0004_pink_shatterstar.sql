CREATE TABLE IF NOT EXISTS "api_key_usage_logs" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"api_key_id" varchar(255) NOT NULL,
	"endpoint" text NOT NULL,
	"method" varchar(10) NOT NULL,
	"status" integer NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'scope') THEN
        ALTER TABLE "api_keys" ADD COLUMN "scope" varchar(50) DEFAULT 'all' NOT NULL;
    END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'api_key_usage_logs_api_key_id_api_keys_id_fk') THEN
        ALTER TABLE "api_key_usage_logs" ADD CONSTRAINT "api_key_usage_logs_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;