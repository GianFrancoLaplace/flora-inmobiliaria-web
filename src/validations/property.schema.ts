/**
 * Schemas de validación Zod para propiedades
 */

import { z } from 'zod';
import {OperationEnum, PropertyTypeEnum} from '@/types/prisma'

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB en bytes

export const MIN_IMAGES = 1;

export const MAX_IMAGES = 10;

export const ALLOWED_IMAGE_TYPES = [
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp',
] as const;

export const imageMetadataSchema = z.object({
	position: z
		.number()
		.int()
		.min(0, 'La posición debe ser mayor o igual a 0')
		.max(MAX_IMAGES - 1, `La posición debe ser menor a ${MAX_IMAGES}`),
	isMain: z.boolean(),
});

/**
 * Schema para validar array de metadata de imágenes
 * Incluye validaciones de negocio:
 * - Exactamente una imagen principal
 * - Posiciones únicas
 * - Cantidad correcta de metadata vs imágenes
 */
export const imageMetadataArraySchema = z
	.array(imageMetadataSchema)
	.min(MIN_IMAGES, `Debe haber al menos ${MIN_IMAGES} imagen`)
	.max(MAX_IMAGES, `No se permiten más de ${MAX_IMAGES} imágenes`)
	.refine(
		(metadata) => {
			const mainImages = metadata.filter((m) => m.isMain);
			return mainImages.length === 1;
		},
		{
			message: 'Debe haber exactamente una imagen marcada como principal',
		}
	)
	.refine(
		(metadata) => {
			const positions = metadata.map((m) => m.position);
			const uniquePositions = new Set(positions);
			return positions.length === uniquePositions.size;
		},
		{
			message: 'Las posiciones de las imágenes deben ser únicas',
		}
	)
	.refine(
		(metadata) => {
			const positions = metadata.map((m) => m.position).sort((a, b) => a - b);
			const expectedPositions = Array.from({ length: metadata.length }, (_, i) => i);
			return JSON.stringify(positions) === JSON.stringify(expectedPositions);
		},
		{
			message: 'Las posiciones deben ser consecutivas desde 0',
		}
	);

/**
 * Schema base para validar datos de la propiedad
 * Incluye campos obligatorios y opcionales con sus validaciones básicas
 * Las validaciones condicionales (según tipo de propiedad) se aplican en .superRefine()
 */
export const createPropertySchema = z.object({
	// Campos obligatorios para TODOS los tipos
	description: z
		.string()
		.min(10, 'La descripción debe tener al menos 50 caracteres')
		.max(200, 'La descripción no puede exceder 200 caracteres'),
	price: z
		.number()
		.positive('El precio debe ser mayor a 0')
		.max(999999999, 'El precio excede el límite permitido'),
	type: z.nativeEnum(PropertyTypeEnum, {
		errorMap: () => ({ message: 'Tipo de propiedad inválido' }),
	}),
	category: z.nativeEnum(OperationEnum, {
		errorMap: () => ({ message: 'Estado de propiedad inválido' }),
	}),
	address: z
		.string()
		.min(5, 'La dirección debe tener al menos 5 caracteres')
		.max(200, 'La dirección no puede exceder 200 caracteres'),
	surface: z
		.number()
		.positive('La superficie debe ser mayor a 0')
		.max(999999, 'La superficie excede el límite permitido (999,999 m²)')
		.finite('La superficie debe ser un número válido'),

	// Campos opcionales (pueden ser undefined)
	ubication: z
		.string()
		.min(3, 'La ubicación debe tener al menos 3 caracteres')
		.max(100, 'La ubicación no puede exceder 100 caracteres')
		.optional(),
	city: z
		.string()
		.min(2, 'La ciudad debe tener al menos 2 caracteres')
		.max(100, 'La ciudad no puede exceder 100 caracteres')
		.optional(),
	constructedArea: z
		.number()
		.positive('El área construida debe ser mayor a 0')
		.max(999999, 'El área construida excede el límite (999,999 m²)')
		.finite('El área construida debe ser un número válido')
		.optional(),
	bedrooms: z.preprocess(
		(val) => (typeof val === 'number' && isNaN(val)) ? undefined : val,
		z.number().int().max(50).optional()
	),
	bathrooms: z.preprocess(
		(val) => (typeof val === 'number' && isNaN(val)) ? undefined : val,
		z.number().int().max(50).optional()
	),
	floors: z
		.number()
		.int('El número de pisos debe ser entero')
		.min(1, 'Debe haber al menos 1 piso')
		.max(200, 'El número de pisos excede el límite (200)')
		.optional(),
	garage: z
		.number()
		.int('El número de cocheras debe ser entero')
		.min(0, 'El número de cocheras no puede ser negativo')
		.max(50, 'El número de cocheras excede el límite (50)')
		.optional(),
})
	.superRefine((data, ctx) => {
		/**
		 * VALIDACIONES CONDICIONALES PARA CASAS (house)
		 * - constructedArea es obligatorio
		 * - bedrooms es obligatorio (≥1)
		 * - bathrooms es obligatorio (≥1)
		 * - floors es opcional
		 * - garage es opcional
		 * - Regla de negocio: constructedArea <= surface
		 */
		if (data.type === PropertyTypeEnum.casa) {
			// constructedArea obligatorio para casas
			// if (!data.constructedArea || data.constructedArea <= 0) {
			// 	ctx.addIssue({
			// 		code: z.ZodIssueCode.custom,
			// 		path: ['constructedArea'],
			// 		message: 'El área construida es obligatoria para casas'
			// 	});
			// }

			// bedrooms obligatorio para casas (mínimo 1)
			if (data.bedrooms === undefined || data.bedrooms < 1) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['bedrooms'],
					message: 'El número de dormitorios es requerido para casas'
				});
			}

			// bathrooms obligatorio para casas (mínimo 1)
			if (data.bathrooms === undefined || data.bathrooms < 1) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['bathrooms'],
					message: 'El número de baños es requerido para casas'
				});
			}

			// Regla de negocio: área construida no puede ser mayor al lote
			if (data.constructedArea && data.surface && data.constructedArea > data.surface) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['constructedArea'],
					message: 'El área construida no puede ser mayor que la superficie del lote'
				});
			}
		}

		/**
		 * VALIDACIONES CONDICIONALES PARA DEPARTAMENTOS (apartment)
		 * - bedrooms es obligatorio (≥1)
		 * - bathrooms es obligatorio (≥1)
		 * - garage es opcional
		 * - constructedArea NO aplica
		 * - floors NO aplica
		 */
		if (data.type === PropertyTypeEnum.departamento) {
			// bedrooms obligatorio para departamentos (mínimo 1)
			if (data.bedrooms === undefined || data.bedrooms < 1) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['bedrooms'],
					message: 'Los departamentos deben tener al menos 1 dormitorio'
				});
			}

			// bathrooms obligatorio para departamentos (mínimo 1)
			if (data.bathrooms === undefined || data.bathrooms < 1) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['bathrooms'],
					message: 'Los departamentos deben tener al menos 1 baño'
				});
			}
		}

		/**
		 * VALIDACIONES CONDICIONALES PARA TERRENOS (land)
		 * - Solo requiere campos base (type, category, price, address, surface, description)
		 * - Ningún campo adicional es obligatorio
		 * - bedrooms, bathrooms, constructedArea, floors, garage NO aplican
		 */
		// Para terrenos no hay validaciones adicionales - solo campos base
	});

/**
 * Tipo inferido del schema de validación
 */
export type CreatePropertySchemaType = z.infer<typeof createPropertySchema>;