import PropertyForm from '@/components/PropertyForm/PropertyForm';
import {FormMode, ImagePreview, PropertyFormInput} from "@/types/property-form.types";
import { prisma } from  '@/lib/prisma'
import {notFound} from "next/navigation";

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

		imagePreview: property.images.map((img, index): ImagePreview => ({
			preview: img.url!,
			position: img.position,
			isMain: img.isMain,
		}))
	};

	return (
		<div>
			<PropertyForm
				mode={FormMode.EDIT}
				initialData={propertyInput}
			/>
		</div>
	);
}