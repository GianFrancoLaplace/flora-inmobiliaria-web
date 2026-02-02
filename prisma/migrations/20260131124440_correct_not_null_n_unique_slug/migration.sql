/*
  Warnings:

  - The values [alquilada,vendida] on the enum `operation_enum` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `characteristic` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `surface` to the `property` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "operation_enum_new" AS ENUM ('alquiler', 'venta');
ALTER TABLE "property" ALTER COLUMN "category" TYPE "operation_enum_new" USING ("category"::text::"operation_enum_new");
ALTER TYPE "operation_enum" RENAME TO "operation_enum_old";
ALTER TYPE "operation_enum_new" RENAME TO "operation_enum";
DROP TYPE "operation_enum_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "characteristic" DROP CONSTRAINT "Characteristic_property_id_fkey";

-- AlterTable
ALTER TABLE "property" ADD COLUMN     "bathrooms" INTEGER,
ADD COLUMN     "bedrooms" INTEGER,
ADD COLUMN     "constructed_area" INTEGER,
ADD COLUMN     "floors" INTEGER,
ADD COLUMN     "garage" INTEGER,
ADD COLUMN     "surface" INTEGER NOT NULL,
ALTER COLUMN "ubication" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "slug" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "characteristic";

-- DropEnum
DROP TYPE "property_status_enum";

-- CreateTable
CREATE TABLE "services" (
    "id" INTEGER NOT NULL,
    "name" TEXT,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services_property" (
    "id_property" INTEGER NOT NULL,
    "id_service" INTEGER NOT NULL,

    CONSTRAINT "services_property_pkey" PRIMARY KEY ("id_property","id_service")
);
