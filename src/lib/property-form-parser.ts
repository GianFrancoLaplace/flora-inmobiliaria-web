import { PropertyFormInput, ImageMetadata, ImagePreview } from '@/types/property-form.types';
import { CreatePropertyDto } from '@/types/property-api.types';

/**
 * Transforma PropertyFormInput del formulario a los 3 parámetros del servicio
 */
export function parsePropertyFormToService(input: PropertyFormInput) {
	const { imagePreview : images } = input;

	const dto: CreatePropertyDto = {
		address: input.address,
		city: input.city,
		state: input.category!,  // category → state
		price: input.price,
		description: input.description,
		surface: input.surface,
		ubication: input.ubication,
		type: input.type!,
		// Opcionales
		garage: input.garage,
		bedrooms: input.bedrooms,
		bathrooms: input.bathrooms,
		floors: input.floors,
		constructedArea: input.constructedArea,
	};

	const files: File[] = images.map((img: ImagePreview) => img.file);

	const imageMetadata: ImageMetadata[] = images.map((img: ImagePreview, idx : number) => ({
		position: idx,  // Basado en índice actual
		isMain: img.isMain
	}));

	return { dto, files, imageMetadata };
}