import { PropertyTypeEnum, OperationEnum } from './prisma';

/**
 * Datos del formulario de creación/edición de propiedad
 * Usado exclusivamente en PropertyForm component
 */
export interface PropertyFormInput {
	// Básicos
	type: PropertyTypeEnum;
	category: OperationEnum;
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

	// Imágenes (solo en frontend)
	images: File[];
}

/**
 * Props del componente PropertyForm
 */
export interface PropertyFormProps {
	mode: 'create' | 'edit';
	propertyTitle?: string;
	propertyId?: string;
	initialData?: Partial<PropertyFormInput>;
	onSubmit: (
		data: PropertyFormInput,
		images: File[],
		metadata: ImageMetadata[]
	) => Promise<void>;
}

/**
 * Metadata de imagen para upload
 */
export interface ImageMetadata {
	position: number;
	isMain: boolean;
}