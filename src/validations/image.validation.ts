/**
 * Validaciones para archivos de imagen
 */

import {
	MAX_IMAGE_SIZE,
	MIN_IMAGES,
	MAX_IMAGES,
	ALLOWED_IMAGE_TYPES,
} from './property.schema';

/**
 * Resultado de validación individual
 */
export interface ImageValidationResult {
	valid: boolean;
	error?: string;
}

/**
 * Resultado de validación de múltiples imágenes
 */
export interface ImagesValidationResult {
	valid: boolean;
	errors: string[];
}

/**
 * Valida un archivo de imagen individual
 * Verifica tipo MIME y tamaño
 */
export function validateImageFile(file: File): ImageValidationResult {
	// Validar tipo MIME
	if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
		return {
			valid: false,
			error: `Tipo no permitido: ${file.type}. Permitidos: jpeg, jpg, png, webp`,
		};
	}

	// Validar tamaño
	if (file.size > MAX_IMAGE_SIZE) {
		const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
		const maxSizeMB = (MAX_IMAGE_SIZE / (1024 * 1024)).toFixed(0);
		return {
			valid: false,
			error: `Archivo muy grande: ${sizeMB}MB (máximo ${maxSizeMB}MB)`,
		};
	}

	return { valid: true };
}

/**
 * Valida array completo de imágenes
 */
export function validateImageFiles(files: File[]): ImagesValidationResult {
	const errors: string[] = [];

	// Validar cantidad
	if (files.length < MIN_IMAGES) {
		errors.push(`Se requiere al menos ${MIN_IMAGES} imagen`);
	}

	if (files.length > MAX_IMAGES) {
		errors.push(`No se permiten más de ${MAX_IMAGES} imágenes`);
	}

	// Validar cada imagen
	files.forEach((file, index) => {
		const result = validateImageFile(file);
		if (!result.valid && result.error) {
			errors.push(`Imagen ${index + 1}: ${result.error}`);
		}
	});

	return {
		valid: errors.length === 0,
		errors,
	};
}