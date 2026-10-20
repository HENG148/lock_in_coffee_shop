CREATE TABLE "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"unit" varchar(30) NOT NULL,
	"current_stock" numeric(12, 3) DEFAULT '0' NOT NULL,
	"low_stock_threshold" numeric(12, 3) DEFAULT '0' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_items_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "inventory_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inventory_item_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"quantity_delta" numeric(12, 3) NOT NULL,
	"stock_before" numeric(12, 3) NOT NULL,
	"stock_after" numeric(12, 3) NOT NULL,
	"reason" text,
	"reference_type" varchar(50),
	"reference_id" uuid,
	"performed_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inv_tx_type_check" CHECK ("inventory_transactions"."type" IN ('restock','waste','usage','correction')),
	CONSTRAINT "inv_tx_stock_after_nonneg" CHECK ("inventory_transactions"."stock_after" >= 0),
	CONSTRAINT "inv_tx_delta_sign_check" CHECK (("inventory_transactions"."type" = 'restock' AND "inventory_transactions"."quantity_delta" > 0)
       OR ("inventory_transactions"."type" IN ('waste','usage') AND "inventory_transactions"."quantity_delta" < 0)
       OR ("inventory_transactions"."type" = 'correction' AND "inventory_transactions"."quantity_delta" <> 0)),
	CONSTRAINT "inv_tx_reason_required" CHECK ("inventory_transactions"."type" NOT IN ('waste','correction') OR length(trim(coalesce("inventory_transactions"."reason", ''))) > 0)
);
--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inv_tx_item_created_idx" ON "inventory_transactions" USING btree ("inventory_item_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "inv_tx_type_created_idx" ON "inventory_transactions" USING btree ("type","created_at");