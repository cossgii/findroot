-- CreateTable
CREATE TABLE "public"."alternative_route_places" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "description" TEXT,
    "route_place_id" TEXT NOT NULL,
    "place_id" TEXT NOT NULL,

    CONSTRAINT "alternative_route_places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "author_id" TEXT NOT NULL,
    "place_id" TEXT NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alternative_route_places_route_place_id_idx" ON "public"."alternative_route_places"("route_place_id");

-- CreateIndex
CREATE INDEX "alternative_route_places_place_id_idx" ON "public"."alternative_route_places"("place_id");

-- CreateIndex
CREATE INDEX "comments_author_id_idx" ON "public"."comments"("author_id");

-- CreateIndex
CREATE INDEX "comments_place_id_idx" ON "public"."comments"("place_id");

-- AddForeignKey
ALTER TABLE "public"."alternative_route_places" ADD CONSTRAINT "alternative_route_places_route_place_id_fkey" FOREIGN KEY ("route_place_id") REFERENCES "public"."route_places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alternative_route_places" ADD CONSTRAINT "alternative_route_places_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE CASCADE ON UPDATE CASCADE;
