-- CreateEnum
CREATE TYPE "property_type_enum" AS ENUM ('casa', 'departamento', 'campo', 'local_comercial', 'lote');

-- CreateEnum
CREATE TYPE "operation_enum" AS ENUM ('alquiler', 'venta');

-- CreateEnum
CREATE TYPE "service_enum" AS ENUM ('agua', 'luz', 'gas', 'internet', 'cloacas');

-- CreateTable
CREATE TABLE "property" (
    "id_property" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "type" "property_type_enum" NOT NULL,
    "category" "operation_enum" NOT NULL,
    "address" TEXT NOT NULL,
    "ubication" TEXT,
    "city" TEXT,
    "surface" INTEGER NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "garage" INTEGER,
    "floors" INTEGER,
    "constructed_area" INTEGER,
    "services" "service_enum"[],
    "slug" TEXT NOT NULL,

    CONSTRAINT "property_pkey" PRIMARY KEY ("id_property")
);

-- CreateTable
CREATE TABLE "admin" (
    "id_admin" SERIAL NOT NULL,
    "admin_email" VARCHAR(255) NOT NULL,
    "admin_password" VARCHAR(255) NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id_admin")
);

-- CreateTable
CREATE TABLE "image" (
    "id_image" SERIAL NOT NULL,
    "url" TEXT,
    "alt_text" TEXT,
    "position" INTEGER NOT NULL,
    "is_main" BOOLEAN NOT NULL,
    "id_property" INTEGER,

    CONSTRAINT "image_pkey" PRIMARY KEY ("id_image")
);

-- CreateIndex
CREATE UNIQUE INDEX "property_slug_key" ON "property"("slug");

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "fk_image_propery" FOREIGN KEY ("id_property") REFERENCES "property"("id_property") ON DELETE CASCADE ON UPDATE CASCADE;

