CREATE TABLE IF NOT EXISTS "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer,
	"phone_number" text,
	"conversation" text,
	"name" text
);

CREATE TABLE IF NOT EXISTS "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone_number" text NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "conversations" ADD CONSTRAINT "conversations_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
