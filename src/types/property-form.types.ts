import { PropertyTypeEnum, OperationEnum } from './prisma';
import { ImageItem } from "@/types/image.types"

export interface PropertyFormInput {
	type?: PropertyTypeEnum;
	category?: OperationEnum;
	price: number;
	surface: number;
	address: string;
	city: string;
	ubication: string;
	description: string;
	constructedArea?: number;
	bedrooms?: number;
	bathrooms?: number;
	floors?: number;
	garage?: number;
	images: ImageItem[];
	deletedImageIds: number[];
}

export interface PropertyFormProps {
	mode: FormMode;
	propertyTitle?: string;
	propertyId?: string;
	initialData?: Partial<PropertyFormInput>;
}

export interface ImageMetadata {
	position: number;
	isMain: boolean;
}

export interface ImagePreview {
	file?: File;
	preview: string;
	position: number;
	isMain: boolean;
}

export enum FormMode {
	CREATE = 'CREATE',
	EDIT = 'EDIT',
}