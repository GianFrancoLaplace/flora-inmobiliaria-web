import TechnicalSheet from '@/components/TechnicalFile/TechnicalSheet';
import {PropertySchema} from "@/components/SEO/PropertySchema";
import { getBaseUrl } from "@/lib/baseURL";
import {notFound} from "next/navigation";

type PageProps = {
	params: Promise<{ id: string }>;
};

export default async function FichaPropiedadPage({ params }: PageProps) {
	const { id } = await params;
	console.log(getBaseUrl());
	const response = await fetch(getBaseUrl() + `/api/properties/${id}`);
	if (!response.ok) {
		console.error(`Error obteniendo propiedad con id: ${id}:`, response.statusText);

		if (response.status === 404) {
			return notFound();
		}
		throw new Error(`Failed to fetch property: ${response.statusText}`);
	}
	const property = await response.json();

	return (
		<main>
			<PropertySchema property={property} />
			<TechnicalSheet mode="view" property={property} />
		</main>
	);
}