import { useState } from "react";
import { FormMode, PropertyFormInput } from "@/types/property-form.types";

export function usePropertySubmit() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	/**
	 * Decide si crear o editar según el modo.
	 */
	const submit = async (
		data: PropertyFormInput,
		mode: FormMode,
		propertyId?: string
	) => {
		setIsLoading(true);
		setError(null);

		try {
			const formDataPayload = buildFormData(data, mode);

			return mode === FormMode.CREATE
				? await submitCreate(formDataPayload)
				: await submitEdit(formDataPayload, propertyId!);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * TRANSFORMACIÓN A FORMDATA
	 * Convierte PropertyFormInput en FormData listo para HTTP.
	 * Función pura = mismo input siempre da mismo output (sin side effects).
	 */
	const buildFormData = (data: PropertyFormInput, mode: FormMode): FormData => {
		const formData = new FormData();

		addPropertyFields(formData, data, mode);
		addImageFields(formData, data, mode);

		return formData;
	};

	const addPropertyFields = (
		formData: FormData,
		data: PropertyFormInput,
		mode: FormMode
	): void => {
		// Campos obligatorios (siempre presentes)
		formData.append('address', data.address);
		formData.append('city', data.city);
		formData.append('price', data.price.toString());
		formData.append('surface', data.surface.toString());
		formData.append('description', data.description);
		formData.append('ubication', data.ubication);
		formData.append('type', data.type!);
		formData.append('category', data.category!);


		// Campos opcionales (solo si tienen valor)
		if (data.constructedArea !== undefined) {
			formData.append('constructedArea', data.constructedArea.toString());
		}
		if (data.bedrooms !== undefined) {
			formData.append('bedrooms', data.bedrooms.toString());
		}
		if (data.bathrooms !== undefined) {
			formData.append('bathrooms', data.bathrooms.toString());
		}
		if (data.garage !== undefined) {
			formData.append('garage', data.garage.toString());
		}
		if (data.floors !== undefined) {
			formData.append('floors', data.floors.toString());
		}
	};

	/**
	 * AGREGAR CAMPOS DE IMÁGENES
	 * Lógica diferenciada según modo CREATE vs EDIT.
	 *
	 * CREATE: Solo envía imágenes nuevas con metadata
	 * EDIT: Envía config de existentes + deleted IDs + nuevas con metadata
	 */
	const addImageFields = (
		formData: FormData,
		data: PropertyFormInput,
		mode: FormMode
	): void => {
		const existingImages = data.images.filter(img => img.type === 'existing');
		const newImages = data.images.filter(img => img.type === 'new');

		if (mode === FormMode.CREATE) {
			newImages.forEach(img => {
				formData.append('images', img.file);
			});

			const metadata = newImages.map((img) => ({
				position: img.position,
				isMain: img.isMain
			}));
			formData.append('imageMetadata', JSON.stringify(metadata));

		} else {
			const existingConfig = existingImages.map(img => ({
				id: img.id,
				position: img.position,
				isMain: img.isMain
			}));
			formData.append('existingImages', JSON.stringify(existingConfig));

			formData.append('deletedImageIds', JSON.stringify(data.deletedImageIds));

			newImages.forEach(img => {
				formData.append('images', img.file);
			});

			const newMetadata = newImages.map((img) => ({
				position: img.position,
				isMain: img.isMain
			}));
			formData.append('imageMetadata', JSON.stringify(newMetadata));
		}
	};

	/**
	 * HTTP POST - Crear propiedad
	 */
	const submitCreate = async (formData: FormData) => {
		const response = await fetch('/api/properties', {
			method: 'POST',
			body: formData,
		});

		if (!response.ok) {
			throw new Error('Error al crear propiedad');
		}

		return await response.json();
	};

	/**
	 * HTTP PUT - Actualizar propiedad
	 * TODO: endpoint PUT /api/properties/[id]
	 */
	const submitEdit = async (formData: FormData, propertyId: string) => {
		const response = await fetch(`/api/properties/${propertyId}`, {
			method: 'PUT',
			body: formData,
		});

		if (!response.ok) {
			throw new Error('Error al actualizar propiedad');
		}

		return await response.json();
	};

	return { submit, isLoading, error };
}