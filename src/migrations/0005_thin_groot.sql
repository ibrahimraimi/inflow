DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'websites' AND column_name = 'api_key') THEN
        ALTER TABLE "websites" ADD COLUMN "api_key" varchar(255);
        ALTER TABLE "websites" ADD CONSTRAINT "websites_api_key_unique" UNIQUE("api_key");
    END IF;
END $$;