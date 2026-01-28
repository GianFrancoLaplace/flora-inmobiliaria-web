import TechnicalSheet from '@/components/TechnicalFile/TechnicalSheet';
import {PropertySchema} from "@/components/SEO/PropertySchema";
import { getBaseUrl } from "@/lib/baseURL";
import {notFound} from "next/navigation";
import {Metadata} from "next";
import {prisma} from "@/lib/prisma";
import {typeMap, stateMap} from "@/helpers/PropertyMapper"
import {PropertyState, PropertyTypes} from "@/types/property.types";
import {OperationEnum} from "@prisma/client";

type PageProps = {
	params: Promise<{ slug: string }>;
};

/**
 * Genera metadata para SEO
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;

	const property = await prisma.property.findUnique({
		where: { slug },
		include: {
			images: {
				take: 1,
				orderBy: { position: "asc" },
			},
		},
	});

	if (!property) {
		return { title: "Propiedad no encontrada" };
	}

	const mainImage = property.images[0]?.url;
	const canonicalUrl = `${getBaseUrl()}/${slug}`;

	return {
		title: `${property.type} en ${property.category} - ${property.address}`,
		description: property.description.substring(0, 160),
		openGraph: {
			title: `${property.type} - $${property.price.toLocaleString("es-AR")}`,
			description: property.description,
			images: mainImage ? [mainImage] : [],
			url: canonicalUrl,
		},
		alternates: {
			canonical: canonicalUrl,
		},
	};
}

export default async function PropertyPage({ params }: PageProps) {
	const { slug } = await params;

	const property = await prisma.property.findUnique({
		where: { slug },
		include: {
			characteristics: true,
			images: {
				orderBy: { position: "asc" },
			},
		},
	});

	if (!property) {
		return notFound();
	}

	// Mapeo a tu tipo PropertyTypes
	const formattedProperty : PropertyTypes = {
		id: property.idProperty,
		address: property.address,
		slug: property.slug,
		city: property.city,
		state: stateMap[property.category as OperationEnum] ?? PropertyState.RENT,
		price: property.price,
		description: property.description,
		ubication: property.ubication,
		type: typeMap[property.type],
		images: property.images.map((img) => ({
			id: img.idImage,
			url: img.url ?? "",
		})),
		characteristics: property.characteristics
			.filter((c) => {
				const isIntegerValid = c.dataType === "integer" && c.valueInteger !== null && c.valueInteger !== 0;
				const isTextValid = c.dataType === "text" && c.valueText && c.valueText.trim() !== "";
				return isIntegerValid || isTextValid;
			})
			.map((c) => ({
				id: c.idCharacteristic,
				characteristic: c.characteristic,
				// Usamos 'as const' para que TS no crea que es un string genérico
				data_type: (c.dataType === "integer" ? "integer" : "text") as "integer" | "text",
				// Cambiamos null por undefined usando ??
				value_integer: c.dataType === "integer" ? (c.valueInteger ?? undefined) : undefined,
				value_text: c.dataType === "text" ? (c.valueText?.trim() ?? undefined) : undefined,
			})),
	};

	return (
		<main>
			<PropertySchema property={formattedProperty} />
			<TechnicalSheet mode="view" property={formattedProperty} />
		</main>
	);
}