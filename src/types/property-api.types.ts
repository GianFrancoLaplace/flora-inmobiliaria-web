import { PropertyTypeEnum, OperationEnum, ServiceEnum } from './prisma';

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
	services?: ServiceEnum[];
}

export interface PropertyUpdateData {
	address?: string;
	city?: string;
	ubication?: string;
	price?: number;
	description?: string;
	type?: PropertyTypeEnum;
	category?: OperationEnum;
	surface?: number;
	bedrooms?: number;
	bathrooms?: number;
	garage?: number;
	floors?: number;
	constructed_area?: number;
	services?: ServiceEnum[];
}

export interface PropertyData {
	id: number;
	address: string;
	city: string;
	ubication: string;
	price: number;
	description: string;
	type: PropertyTypeEnum;
	category: OperationEnum;
	surface: number;
	bedrooms: number;
	bathrooms: number;
	garage: number;
	floors: number;
	constructed_area: number;
	services: ServiceEnum[];
	images: { id: number; url: string }[];
}