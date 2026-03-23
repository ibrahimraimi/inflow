CREATE TABLE "session_replays" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "session_replays_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"website_id" varchar(255) NOT NULL,
	"client_id" varchar(255) NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"events" jsonb NOT NULL,
	"created_at" timestamp NOT NULL
);
