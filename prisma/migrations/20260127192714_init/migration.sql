-- CreateEnum
CREATE TYPE "property_type_enum" AS ENUM ('casa', 'departamento', 'campo', 'local_comercial', 'lote');

-- CreateEnum
CREATE TYPE "operation_enum" AS ENUM ('alquiler', 'venta', 'alquilada', 'vendida');

-- CreateEnum
CREATE TYPE "characteristic_category_enum" AS ENUM ('superficie_total', 'superficie_descubierta', 'superficie_semicubierta', 'superficie_cubierta', 'ambientes', 'dormitorios', 'dormitorios_suite', 'banos', 'cocheras', 'cobertura_cochera', 'balcon_terraza', 'expensas', 'fecha_expensa', 'agua', 'cantidad_plantas', 'tipo_piso', 'estado_inmueble', 'orientacion', 'luminosidad', 'disposicion', 'antiguedad', 'ubicacion_cuadra', 'otros');

-- CreateEnum
CREATE TYPE "property_status_enum" AS ENUM ('activa', 'reservada', 'vendida', 'suspendida');

-- CreateTable
CREATE TABLE "property" (
    "id_property" SERIAL NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "type" "property_type_enum" NOT NULL,
    "category" "operation_enum" NOT NULL,
    "address" TEXT,
    "ubication" TEXT,
    "city" TEXT,
    "slug" VARCHAR(160),

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
CREATE TABLE "characteristic" (
    "id_characteristic" SERIAL NOT NULL,
    "characteristic" VARCHAR(255) NOT NULL,
    "property_id" INTEGER NOT NULL,
    "category" "characteristic_category_enum" DEFAULT 'otros',
    "data_type" VARCHAR(20) NOT NULL,
    "value_integer" INTEGER,
    "value_text" TEXT,

    CONSTRAINT "characteristic_pkey" PRIMARY KEY ("id_characteristic")
);

-- CreateTable
CREATE TABLE "image" (
    "id_image" SERIAL NOT NULL,
    "url" TEXT,
    "id_property" INTEGER,
    "alt_text" TEXT,
    "position" INTEGER NOT NULL,
    "is_main" BOOLEAN NOT NULL,

    CONSTRAINT "image_pkey" PRIMARY KEY ("id_image")
);

-- CreateIndex
CREATE UNIQUE INDEX "property_slug_key" ON "property"("slug");

-- AddForeignKey
ALTER TABLE "characteristic" ADD CONSTRAINT "Characteristic_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "property"("id_property") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "fk_image_propery" FOREIGN KEY ("id_property") REFERENCES "property"("id_property") ON DELETE CASCADE ON UPDATE CASCADE;
