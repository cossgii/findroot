-- CreateIndex
CREATE INDEX "places_creator_id_created_at_idx" ON "public"."places"("creator_id", "created_at");

-- CreateIndex
CREATE INDEX "places_district_category_idx" ON "public"."places"("district", "category");

-- CreateIndex
CREATE INDEX "places_creator_id_address_idx" ON "public"."places"("creator_id", "address");

-- CreateIndex
CREATE INDEX "route_places_route_id_order_idx" ON "public"."route_places"("route_id", "order");

-- CreateIndex
CREATE INDEX "routes_district_id_creator_id_idx" ON "public"."routes"("district_id", "creator_id");
