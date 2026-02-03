import {useState} from "react";
import {PropertyFormInput} from "@/types/property-form.types";

export function usePropertySubmit() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const submit = async (data: PropertyFormInput) => {
		setIsLoading(true);
		setError(null);

		try {

			const formData = new FormData();

			// Campos Obligatorios
			formData.append('address', data.address);
			formData.append('city', data.city);
			formData.append('state', data.category!); // Ajustado de 'category' a 'state' para que coincida
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

			// Ajustado para que coincida con el nombre de la propiedad 'constructedArea'
			if (data.constructedArea) {
				formData.append('constructedArea', data.constructedArea.toString());
			}

			data.imagePreview.forEach(img => {
				formData.append('images', img.file);
			});

			const metadata = data.imagePreview.map((img, idx) => ({
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

	return { submit, isLoading, error };
}