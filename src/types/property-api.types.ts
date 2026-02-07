import { PropertyTypeEnum, OperationEnum } from './prisma';
import { ImageMetadata } from './property-form.types';

/**
 * DTO para crear propiedad vía API
 * Usado en PropertyService.create()
 */
export interface CreatePropertyDto {
	address: string;
	city: string;
	category: OperationEnum;
	price: number;
	description: string;
	surface: number;
	ubication: string;
	type: PropertyTypeEnum;
	garage?: number;
	bedrooms?: number;
	bathrooms?: number;
	floors?: number;
	constructedArea?: number;
}

export interface PropertyUpdateData {
	address?: string;
	city?: string;
	ubication?: string;
	price?: number;
	description?: string;
	type?: PropertyTypeEnum;
	category?:OperationEnum;
	surface?: number;
	bedrooms?: number;
	bathrooms?: number;
	garage?: number;
	floors?: number;
	constructed_area?: number;
}

export interface PropertyData {
	id: number;
	address: string;
	city: string;
	ubication: string;
	price: number;
	description: string;
	type: PropertyTypeEnum;
	category:OperationEnum;
	surface: number;
	bedrooms: number;
	bathrooms: number;
	garage: number;
	floors: number;
	constructed_area: number;
	images: { id: number; url: string }[];
}