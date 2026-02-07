'use client';

import { useRouter } from 'next/navigation';
import PropertyForm from '@/components/PropertyForm/PropertyForm';
import type { PropertyTypes } from '@/types/property.types';

export default function PropertyCreatePage() {
	const router = useRouter();

	async function handleCreate(data: PropertyTypes) {
		try {
			// 1. Subir imágenes primero
			const uploadedImages = await uploadImages(data.images);

			// 2. Crear propiedad
			const response = await fetch('/api/properties', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...data,
					images: uploadedImages
				})
			});

			if (!response.ok) {
				throw new Error('Error al crear propiedad');
			}

			const newProperty = await response.json();

			// 3. Redireccionar a la vista de la propiedad
			router.push(`/properties/${newProperty.slug}`);

		} catch (error) {
			console.error('Error:', error);
			// TODO: Mostrar toast/notificación de error
		}
	}

	return (
		<div>
			<PropertyForm
				mode="create"
				onSubmit={handleCreate}
			/>
		</div>
	);
}

// Helper para subir imágenes
async function uploadImages(images: any[]) {
	const formData = new FormData();

	images.forEach((img, index) => {
		if (img.file) {
			formData.append('images', img.file);
			formData.append('order', index.toString());
			formData.append('isMain', img.isMain.toString());
		}
	});

	const response = await fetch('/api/properties/images', {
		method: 'POST',
		body: formData
	});

	if (!response.ok) {
		throw new Error('Error al subir imágenes');
	}

	const result = await response.json();
	return result.images;
}