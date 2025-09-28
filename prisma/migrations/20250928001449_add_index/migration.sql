-- CreateIndex
CREATE INDEX "places_creator_id_idx" ON "public"."places"("creator_id");

-- CreateIndex
CREATE INDEX "places_address_idx" ON "public"."places"("address");

-- CreateIndex
CREATE INDEX "places_category_idx" ON "public"."places"("category");

-- CreateIndex
CREATE INDEX "routes_creator_id_idx" ON "public"."routes"("creator_id");
