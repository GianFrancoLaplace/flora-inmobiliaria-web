DO $$
BEGIN
    CREATE TYPE "currency_enum" AS ENUM ('USD', 'ARS');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

ALTER TABLE "property"
ADD COLUMN IF NOT EXISTS "currency" "currency_enum";

UPDATE "property"
SET "currency" = 'USD'
WHERE "currency" IS NULL;

ALTER TABLE "property"
ALTER COLUMN "currency" SET NOT NULL,
ALTER COLUMN "currency" SET DEFAULT 'USD';

