import { Characteristic } from "@/types/Characteristic";

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
  characteristics: Characteristic[];
  images: { id: number; url: string }[];
  type?: PropertyType;
}

/**
 * DTO para crear una propiedad (sin imágenes)
 * Representa los datos de texto del formulario
 */
export interface CreatePropertyDTO {
	address: string;
	city: string;
	state: PropertyState;
	price: number;
	description: string;
	ubication: string;
	type: PropertyType;
}

/**
 * Metadata de imagen enviada por el cliente
 */
export interface ImageMetadata {
	position: number;
	isMain: boolean;
	url: string;
	altText: string;
}


export interface PropertyUpdateData {
    address?: string;
    city?: string;
    state: PropertyState;
    ubication?: string;
    price?: number;
    description?: string;
    type?: PropertyType;
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