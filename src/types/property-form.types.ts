import { PropertyTypeEnum, OperationEnum } from './prisma';

/**
 * Datos del formulario de creación/edición de propiedad
 * type y category en undefined en caso de crear (no hay un predeterminado)
 */
export interface PropertyFormInput {
	// Básicos
	type?: PropertyTypeEnum;
	category?: OperationEnum;
	price: number;
	surface: number;

	// Ubicación
	address: string;
	city: string;
	ubication: string;

	// Descripción
	description: string;

	// Detalles opcionales por tipo
	constructedArea?: number;
	bedrooms?: number;
	bathrooms?: number;
	floors?: number;
	garage?: number;

	imagePreview: ImagePreview[];
}

/**
 * Props del componente PropertyForm
 */
export interface PropertyFormProps {
	mode: FormMode;
	propertyTitle?: string;
	propertyId?: string;
	initialData?: Partial<PropertyFormInput>;
}

/**
 * Metadata de imagen para upload
 */
export interface ImageMetadata {
	position: number;
	isMain: boolean;
}

export interface ImagePreview {
	file: File;           // El binario real
	preview: string;      // Data URL para mostrar
	position: number;     // Orden en galería
	isMain: boolean;      // ¿Es la foto principal?
}

export enum FormMode {
	CREATE = 'CREATE',
	EDIT = 'EDIT',
}