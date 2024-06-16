CREATE TABLE IF NOT EXISTS "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid,
	"phone_number" varchar NOT NULL,
	"conversation" varchar,
	"name" varchar(256),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"uodated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"phone_number" varchar NOT NULL,
	"address_ip" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"uodated_at" timestamp DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "conversations" ADD CONSTRAINT "conversations_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
