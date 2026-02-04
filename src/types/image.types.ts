/**
 * Sistema de tipos para gestión de imágenes en PropertyForm
 *
 * Usa Discriminated Union para diferenciar entre:
 * - Imágenes existentes (ya en Cloudinary)
 * - Imágenes nuevas (archivos locales del usuario)
 */

/**
 * Imagen que ya existe en Cloudinary
 * Tiene ID de base de datos y URL remota
 */
export interface ExistingImage {
	type: 'existing';
	id: number;           // ID en la base de datos
	url: string;          // URL de Cloudinary
	position: number;     // Orden de visualización
	isMain: boolean;
}

/**
 * Imagen nueva que el usuario acaba de agregar
 * Tiene archivo File y preview local (blob URL)
 */
export interface NewImage {
	type: 'new';
	file: File;           // Archivo del usuario
	preview: string;      // Data URL para preview (blob://)
	position: number;     // Orden de visualización
	isMain: boolean;      // Si es la imagen principal
}

/**
 * Union type que representa CUALQUIER imagen en el formulario
 * TypeScript puede diferenciar automáticamente según el campo 'type'
 */
export type ImageItem = ExistingImage | NewImage;

/**
 * Metadata que se envía al backend para imágenes nuevas
 * Asocia cada File con su configuración de posición
 */
export interface ImageUploadMetadata {
	position: number;
	isMain: boolean;
}

/**
 * Configuración de una imagen existente que se mantiene
 * Se usa en el PUT para actualizar position/isMain sin resubir
 */
export interface ExistingImageConfig {
	id: number;
	position: number;
	isMain: boolean;
}