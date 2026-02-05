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


export interface CreatePropertyPayload {
	data: CreatePropertyDto;
	files: File[];
	imageMetadata: ImageMetadata[];
}