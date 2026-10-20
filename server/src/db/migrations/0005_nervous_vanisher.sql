CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"contact_name" varchar(100),
	"email" varchar(255),
	"phone" varchar(30),
	"address" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "suppliers_name_not_blank" CHECK (length(trim("suppliers"."name")) > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "suppliers_name_lower_uidx" ON "suppliers" USING btree (lower("name"));--> statement-breakpoint
CREATE INDEX "suppliers_is_active_idx" ON "suppliers" USING btree ("is_active");