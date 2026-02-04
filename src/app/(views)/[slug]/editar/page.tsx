import PropertyForm from '@/components/PropertyForm/PropertyForm';
import {FormMode, PropertyFormInput} from "@/types/property-form.types";
import { prisma } from  '@/lib/prisma'
import {notFound} from "next/navigation";
import {ImageItem} from "@/types/image.types";

interface PropertyEditPageProps {
	params: Promise<{ slug: string }>;
}

export default async function PropertyEditPage({ params }: PropertyEditPageProps) {
	const { slug } = await params;

	const property = await prisma.property.findFirst({
		where: { slug } ,
		include: {
			images : true
		}
	});

	if (!property) {
		return (notFound())
	}

	/**
	 * Convertir imágenes de BD a objetos tipo 'existing'
	 * Cada imagen tiene url, id, position e isMain
	 */
	const existingImages: ImageItem[] = property.images.map((img): ImageItem => ({
		type: 'existing',
		id: img.idImage,
		url: img.url!,
		position: img.position,
		isMain: img.isMain,
	}));

	const propertyInput: Partial<PropertyFormInput> = {
		address: property.address ?? undefined,
		city: property.city ?? undefined,
		description: property.description ?? undefined,
		ubication: property.ubication ?? undefined,

		price: property.price ?? undefined,
		surface: property.surface ?? undefined,
		garage: property.garage ?? undefined,
		bedrooms: property.bedrooms ?? undefined,
		bathrooms: property.bathrooms ?? undefined,
		floors: property.floors ?? undefined,
		constructedArea: property.constructedArea ?? undefined,

		type: property.type,
		category: property.category,

		// Sistema de Discriminated Union para imágenes
		images: existingImages,
		deletedImageIds: [],
	};

	return (
		<div>
			<PropertyForm
				mode={FormMode.EDIT}
				initialData={propertyInput}
				propertyId={property.idProperty.toString()}
			/>
		</div>
	);
}