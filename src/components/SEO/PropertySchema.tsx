import { Property } from '@/types/Property'

interface PropertySchemaProps {
	property: Property
}

export function PropertySchema({ property }: PropertySchemaProps) {
	const schema = {
		'@context': 'https://schema.org',
		'@type': 'RealEstateListing',
		name: `${property.type} en ${property.address}`,
		description: property.description,
		url: `https://flora-cordeiro-inmobiliaria.vercel.app/propiedades/ficha/${property.id}`,

		offers: {
			'@type': 'Offer',
			price: property.price,
			priceCurrency: 'ARS',
			availability: property.state === 'venta'
				? 'https://schema.org/InStock'
				: 'https://schema.org/OutOfStock',
			url: `https://flora-cordeiro-inmobiliaria.vercel.app/propiedades/ficha/${property.id}`,
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
			url: 'https://flora-cordeiro-inmobiliaria.vercel.app/',
			telephone: '+54-XXX-XXXXXXX', // AGREGAR TELÉFONO REAL
			email: 'contacto@floracordeiro.com', // AGREGAR EMAIL REAL
		}
	}

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
		/>
	)
}