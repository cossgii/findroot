-- CreateIndex
CREATE INDEX "places_district_created_at_idx" ON "public"."places"("district", "created_at");

-- CreateIndex
CREATE INDEX "routes_district_id_created_at_idx" ON "public"."routes"("district_id", "created_at");
