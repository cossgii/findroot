-- CreateTable
CREATE TABLE "public"."alternatives" (
    "id" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "route_place_id" TEXT NOT NULL,
    "place_id" TEXT NOT NULL,

    CONSTRAINT "alternatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "route_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alternatives_route_place_id_idx" ON "public"."alternatives"("route_place_id");

-- CreateIndex
CREATE INDEX "alternatives_place_id_idx" ON "public"."alternatives"("place_id");

-- CreateIndex
CREATE INDEX "comments_route_id_idx" ON "public"."comments"("route_id");

-- CreateIndex
CREATE INDEX "comments_author_id_idx" ON "public"."comments"("author_id");

-- AddForeignKey
ALTER TABLE "public"."alternatives" ADD CONSTRAINT "alternatives_route_place_id_fkey" FOREIGN KEY ("route_place_id") REFERENCES "public"."route_places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alternatives" ADD CONSTRAINT "alternatives_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
