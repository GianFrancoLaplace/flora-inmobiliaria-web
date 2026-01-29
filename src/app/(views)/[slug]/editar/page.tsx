'use client';

import { useRouter } from 'next/navigation';
import { use } from 'react';
import PropertyForm from '@/components/PropertyForm/PropertyForm';
import type { PropertyTypes } from '@/types/property.types';

interface PropertyEditPageProps {
	params: Promise<{ slug: string }>;
}

export default function PropertyEditPage({ params }: PropertyEditPageProps) {
	const router = useRouter();
	const { slug } = use(params);

	// TODO: Fetch de la propiedad
	// Por ahora simulamos con un objeto vacío
	const property: PropertyTypes = {
		// ... datos cargados desde API
	};

	async function handleUpdate(data: PropertyTypes) {
		try {
			const newImages = data.images.filter(img => img.file);
			const uploadedImages = newImages.length > 0
				? await uploadImages(newImages)
				: [];

			const allImages = [
				...data.images.filter(img => !img.file),
				...uploadedImages
			];

			const response = await fetch(`/api/properties/${slug}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...data,
					images: allImages
				})
			});

			if (!response.ok) {
				throw new Error('Error al actualizar');
			}

			router.push(`/properties/${slug}`);

		} catch (error) {
			console.error('Error:', error);
			// TODO: Mostrar toast/notificación de error
		}
	}

	return (
		<div>
			<PropertyForm
				mode="edit"
				initialData={property}
				onSubmit={handleUpdate}
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