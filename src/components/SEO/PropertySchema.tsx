import type { PropertyWithImages } from "@/types/prisma";
import { getBaseUrl } from "@/lib/baseURL";

interface PropertySchemaProps {
	property: PropertyWithImages
}

export function PropertySchema({ property }: PropertySchemaProps) {
	const schema = {
		'@context': 'https://schema.org',
		'@type': 'RealEstateListing',
		name: `${property.type} en ${property.address}`,
		description: property.description,
		url: `${getBaseUrl()}/propiedades/${property.slug}`,

		offers: {
			'@type': 'Offer',
			price: property.price,
			priceCurrency: property.currency ?? 'USD',
			availability: property.category === 'venta'
				? 'https://schema.org/InStock'
				: 'https://schema.org/OutOfStock',
			url: `${getBaseUrl()}/propiedades/${property.slug}`,
		},

		address: {
			'@type': 'PostalAddress',
			streetAddress: property.address,
			addressLocality: 'Tandil',
			addressRegion: 'Buenos Aires',
			addressCountry: 'AR',
		},

		...(property.images?.[0] && {
			image: property.images.map(img => img.url),
		}),

		// ...(property.characteristics. && {
		// 	numberOfRooms: property.characteristics,
		// }),
		//
		// ...(property.bathrooms && {
		// 	numberOfBathroomsTotal: property.bathrooms,
		// }),
		//
		// ...(property.surface && {
		// 	floorSize: {
		// 		'@type': 'QuantitativeValue',
		// 		value: property.surface,
		// 		unitCode: 'MTK' // metros cuadrados
		// 	}
		// }),

		broker: {
			'@type': 'RealEstateAgent',
			name: 'Flora Cordeiro',
			url: `${getBaseUrl()}/`,
			telephone: '+54-XXX-XXXXXXX', // AGREGAR TELÉFONO REAL
			email: "floracordeiroinmobiliaria@gmail.com", // AGREGAR EMAIL REAL
		}
	}

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
		/>
	)
}
