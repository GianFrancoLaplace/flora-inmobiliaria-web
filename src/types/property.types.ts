import { Characteristic } from "@/types/Characteristic";
import {PropertyTypeEnum , OperationEnum} from "@/types/prisma";

export type User = {
    id_admin: number;
    admin_email: string;
    admin_password: string;
};

export interface PropertyTypes {
  id: number;
  address: string;
  slug: string;
  city: string;
  state: PropertyState;
  price: number;
  description: string;
  ubication: string;
  images: { id: number; url: string }[];
  type?: PropertyType;
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

export interface PropertyFormProps {
	mode: 'create' | 'edit';
	propertyTitle?: string;
	propertyId?: string;
	initialData?: Partial<PropertyData>;
	onSubmit: (data: PropertyData) => Promise<void>;
}

/**
 * DTO para crear una propiedad (sin imágenes)
 * Representa los datos de texto del formulario
 */

/**
 * Metadata de posicionamiento de imagen enviada por el cliente
 */
export interface ImageMetadata {
	position: number;
	isMain: boolean;
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

export interface Image {
    idImage: number;
    idProperty: number;
    url: string;
	altText: string;
	isMain: boolean;
	position: number;
}

export interface CreateImage {
	url: string;
	altText: string;
	isMain: boolean;
	position: number;
	file: File;
}

export enum PropertyState {
    SALE = "venta",
    SOLD = "vendida",
    RENT = "alquiler",
    RENTED = "alquilada"
}

export enum PropertyType {
    HOME = "casa",
    APARTMENT = "departamento",
    FIELD = "campo",
    COMMERCIAL = "local_comercial",
    LAND = "lote"
}