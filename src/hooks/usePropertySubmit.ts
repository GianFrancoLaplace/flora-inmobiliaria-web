import { useState } from "react";
import { FormMode, PropertyFormInput } from "@/types/property-form.types";

export function usePropertySubmit() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

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
		formData.append('address', data.address);
		formData.append('city', data.city.trim());
		formData.append('price', data.price.toString());
		formData.append('currency', data.currency ?? "USD");
		formData.append('surface', data.surface.toString());
		formData.append('description', data.description);
		formData.append('ubication', data.ubication.trim());
		formData.append('type', data.type!);
		formData.append('category', data.category!);

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
		if (data.services && data.services.length >= 0) {
			formData.append('services', JSON.stringify(data.services));
		}
	};

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

	const extractErrorMessage = async (response: Response, fallback: string) => {
		try {
			const data = await response.json();
			if (data?.error) return String(data.error);
			if (data?.message) return String(data.message);
			if (Array.isArray(data?.errors) && data.errors.length > 0) {
				const first = data.errors[0];
				if (first?.message) return String(first.message);
			}
		} catch {
			// Ignorar parse errors y usar fallback
		}
		return fallback;
	};

	const submitCreate = async (formData: FormData) => {
		const response = await fetch('/api/properties', {
			method: 'POST',
			body: formData,
		});

		if (!response.ok) {
			const message = await extractErrorMessage(response, 'Error al crear propiedad');
			throw new Error(message);
		}

		return await response.json();
	};

	const submitEdit = async (formData: FormData, propertyId: string) => {
		const response = await fetch(`/api/properties/${propertyId}`, {
			method: 'PUT',
			body: formData,
		});

		if (!response.ok) {
			const message = await extractErrorMessage(response, 'Error al actualizar propiedad');
			throw new Error(message);
		}

		return await response.json();
	};

	return { submit, isLoading, error };
}
