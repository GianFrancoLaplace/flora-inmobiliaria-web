/**
 * Re-exports de tipos generados por Prisma
 * Single source of truth para modelos de DB
 */

import type {
	Property as PropertyDbModel,
	Image as ImageDbModel,
	Admin as AdminDbModel,
} from '@prisma/client';

export type {
	PropertyDbModel,
	ImageDbModel,
	AdminDbModel,
};

export {
	PropertyTypeEnum,
	OperationEnum,
} from '@prisma/client';

export type PropertyWithImages = PropertyDbModel & {
	images: ImageDbModel[];
};
