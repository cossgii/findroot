-- CreateIndex
CREATE INDEX "Like_placeId_idx" ON "public"."Like"("placeId");

-- CreateIndex
CREATE INDEX "Like_routeId_idx" ON "public"."Like"("routeId");

-- CreateIndex
CREATE INDEX "Place_district_idx" ON "public"."Place"("district");

-- CreateIndex
CREATE INDEX "Route_districtId_idx" ON "public"."Route"("districtId");
