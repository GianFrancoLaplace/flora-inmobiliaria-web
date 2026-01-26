/**
 * Schemas de validación Zod para propiedades
 */

import { z } from 'zod';
import { PropertyType, PropertyState } from '@/types/property.types';

// ============================================================================
// CONSTANTES DE VALIDACIÓN
// ============================================================================

/** Tamaño máximo por imagen: 5MB */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/** Cantidad mínima de imágenes */
export const MIN_IMAGES = 1;

/** Cantidad máxima de imágenes */
export const MAX_IMAGES = 10;

/** Tipos MIME permitidos */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const;

// ============================================================================
// SCHEMAS DE VALIDACIÓN
// ============================================================================

/**
 * Schema para validar datos de la propiedad
 */
export const createPropertySchema = z.object({
	description: z
		.string()
		.min(10, 'La descripción debe tener al menos 10 caracteres')
		.max(2000, 'La descripción no puede exceder 2000 caracteres'),

	price: z
		.number()
		.positive('El precio debe ser mayor a 0')
		.max(999999999, 'El precio excede el límite permitido'),

	type: z.nativeEnum(PropertyType, {
		errorMap: () => ({ message: 'Tipo de propiedad inválido' }),
	}),

	state: z.nativeEnum(PropertyState, {
		errorMap: () => ({ message: 'Estado de propiedad inválido' }),
	}),

	address: z
		.string()
		.min(5, 'La dirección debe tener al menos 5 caracteres')
		.max(200, 'La dirección no puede exceder 200 caracteres'),

	ubication: z
		.string()
		.min(3, 'La ubicación debe tener al menos 3 caracteres')
		.max(100, 'La ubicación no puede exceder 100 caracteres'),

	city: z
		.string()
		.min(2, 'La ciudad debe tener al menos 2 caracteres')
		.max(100, 'La ciudad no puede exceder 100 caracteres'),
});

/**
 * Schema para validar metadata individual de imagen
 */
export const imageMetadataSchema = z.object({
	position: z
		.number()
		.int('La posición debe ser un número entero')
		.min(0, 'La posición debe ser mayor o igual a 0')
		.max(MAX_IMAGES - 1, `La posición debe ser menor a ${MAX_IMAGES}`),

	isMain: z.boolean(),
});

/**
 * Schema para validar array de metadata de imágenes
 *
 * Validaciones de negocio:
 * - Exactamente UNA imagen debe ser principal (isMain: true)
 * - Las posiciones deben ser únicas
 * - Las posiciones deben ser consecutivas desde 0
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
			message: 'Las posiciones deben ser consecutivas desde 0 (ejemplo: 0, 1, 2)',
		}
	);

/**
 * Tipo inferido del schema (para TypeScript)
 */
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type ImageMetadataInput = z.infer<typeof imageMetadataSchema>;