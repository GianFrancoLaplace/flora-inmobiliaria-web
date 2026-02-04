import {useState} from "react";
import {FormMode, PropertyFormInput} from "@/types/property-form.types";

export function usePropertySubmit() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const submit = async (data: PropertyFormInput, mode: FormMode) => {
		setIsLoading(true);
		setError(null);

		try {
			if (mode === FormMode.CREATE) {
				return await submitCreate(data);
			} else {
				return await submitEdit(data);
			}
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("Ocurrió un error inesperado");
			}
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Submit para CREATE - todas las imágenes son nuevas
	 */
	const submitCreate = async (data: PropertyFormInput) => {
		const formData = new FormData();

		// Campos Obligatorios
		formData.append('address', data.address);
		formData.append('city', data.city);
		formData.append('state', data.category!);
		formData.append('price', data.price.toString());
		formData.append('description', data.description);
		formData.append('ubication', data.ubication);
		formData.append('type', data.type!);
		formData.append('surface', data.surface.toString());

		// Campos Opcionales
		if (data.garage) formData.append('garage', data.garage.toString());
		if (data.bedrooms) formData.append('bedrooms', data.bedrooms.toString());
		if (data.bathrooms) formData.append('bathrooms', data.bathrooms.toString());
		if (data.floors) formData.append('floors', data.floors.toString());
		if (data.constructedArea) {
			formData.append('constructedArea', data.constructedArea.toString());
		}

		// En CREATE todas las imágenes son tipo 'new'
		const newImages = data.images.filter(img => img.type === 'new');

		newImages.forEach(img => {
			formData.append('images', img.file);
		});

		const metadata = newImages.map((img, idx) => ({
			position: idx,
			isMain: img.isMain
		}));
		formData.append('imageMetadata', JSON.stringify(metadata));

		// Fetch
		const response = await fetch('/api/properties', {
			method: 'POST',
			body: formData,
		});

		if (!response.ok) {
			throw new Error('Error al crear propiedad');
		}

		const property = await response.json();
		return property;
	};

	/**
	 * Submit para EDIT - puede tener imágenes existentes y nuevas
	 *
	 * TODO: Implementar cuando el backend tenga el endpoint PUT
	 *
	 * El payload debe incluir:
	 * - Datos de la propiedad (campos de texto/números)
	 * - existingImages: array con {id, position, isMain} de imágenes que se mantienen
	 * - deletedImageIds: array de IDs a eliminar de Cloudinary
	 * - FormData con archivos nuevos + metadata de cada uno
	 */
	const submitEdit = async (data: PropertyFormInput) => {
		// Separar imágenes por tipo
		const existingImages = data.images.filter(img => img.type === 'existing');
		const newImages = data.images.filter(img => img.type === 'new');

		// Preparar configuración de imágenes existentes
		const existingImagesConfig = existingImages.map(img => ({
			id: img.id,
			position: img.position,
			isMain: img.isMain
		}));

		console.log('EDIT PAYLOAD preparado:', {
			propertyData: {
				address: data.address,
				city: data.city,
				price: data.price,
				surface: data.surface,
				description: data.description,
				ubication: data.ubication,
				type: data.type,
				category: data.category,
				garage: data.garage,
				bedrooms: data.bedrooms,
				bathrooms: data.bathrooms,
				floors: data.floors,
				constructedArea: data.constructedArea,
			},
			existingImages: existingImagesConfig,
			deletedImageIds: data.deletedImageIds,
			newImagesCount: newImages.length
		});

		// TODO: Hacer el fetch PUT
		throw new Error('Endpoint PUT aún no implementado por el backend');
	};

	return { submit, isLoading, error };
}