import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/baseURL";
import { PropertySchema } from "@/components/SEO/PropertySchema";
import TechnicalSheet from "@/components/TechnicalFile/TechnicalSheet";

type PageProps = {
	params: Promise<{ slug: string }>;
};

/**
 * Genera metadata para SEO

 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;

	const property = await prisma.property.findFirst({
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
		description: property.description?.substring(0, 160) || "",
		openGraph: {
			title: `${property.type} - $${property.price.toLocaleString("es-AR")}`,
			description: property.description || "",
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

	// Fetch directo de Prisma - Server Component privilege
	const property = await prisma.property.findFirst({
		where: { slug },
		include: {
			images: {
				orderBy: { position: "asc" },
			},
		},
	});

	if (!property) {
		return notFound();
	}

	return (
		<main>
			<PropertySchema property={property} />
			<TechnicalSheet property={property} />
		</main>
	);
}