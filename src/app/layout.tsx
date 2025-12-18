import type { Metadata } from "next";
import './(views)/ui/globals.css';
// Asegúrate que la ruta de la fuente sea correcta
import { cactus } from "@/app/(views)/ui/fonts";
import NavBar from "@/components/NavBar/NavBar";
import Footer from "@/components/Footer/Footer";
import WhatsAppRedirection from "@/components/WhatsAppRedirection/WhatsAppRedirection";

// URL base definida para evitar repeticiones
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ? process.env.NEXT_PUBLIC_BASE_URL : "";


export const metadata: Metadata = {
	metadataBase: new URL(BASE_URL),

	title: {
		default: 'Flora Cordeiro - Inmobiliaria en Tandil | Casas, Departamentos, Terrenos',
		template: '%s | Flora Cordeiro Inmobiliaria'
	},

	description: 'Inmobiliaria especializada en Tandil. Más de 10 años de experiencia en compra, venta y alquiler de propiedades. Atención personalizada por Flora Cordeiro.',

	keywords: [
		'inmobiliaria tandil',
		'propiedades tandil',
		'casas en venta tandil',
		'departamentos tandil',
		'alquiler tandil',
		'flora cordeiro',
		'bienes raíces tandil'
	],

	authors: [{ name: 'Flora Cordeiro' }],
	creator: 'Flora Cordeiro Inmobiliaria',
	publisher: 'Flora Cordeiro',

	openGraph: {
		type: 'website',
		locale: 'es_AR',
		url: BASE_URL,
		siteName: 'Flora Cordeiro Inmobiliaria',
		title: 'Flora Cordeiro - Tu Inmobiliaria de Confianza en Tandil',
		description: 'Encontrá tu próxima propiedad en Tandil. Casas, departamentos, terrenos y más. Atención personalizada.',
		images: [
			{
				url: '/og-image.jpg', // TODO: Subir imagen
				width: 1200,
				height: 630,
				alt: 'Flora Cordeiro Inmobiliaria - Tandil',
			}
		],
	},

	// Verificación de plataformas
	verification: {
		google: '5XxYTljI-V7ytErFMbV1yrAL6QzawUMcHoEZhvU7iHg',
	},

	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},

	icons: {
		icon: [
			{ url: '/favicon.ico' },
			{ url: '/icon.png', type: 'image/png', sizes: '32x32' }
		],
		apple: '/apple-icon.png',
	},
}

export default function RootLayout({
	                                   children,
                                   }: Readonly<{
	children: React.ReactNode;
}>) {

	// JSON-LD optimizado
	const structuredData = {
		"@context": "https://schema.org",
		"@type": "RealEstateAgent",
		"name": "Flora Cordeiro Inmobiliaria",
		"image": `${BASE_URL}/logos/footerLogo.png`,
		"@id": BASE_URL,
		"url": BASE_URL,
		"telephone": "+54 9 2494 208037",
		"address": {
			"@type": "PostalAddress",
			"streetAddress": "14 de Julio 796",
			"addressLocality": "Tandil",
			"addressRegion": "Buenos Aires",
			"postalCode": "7000",
			"addressCountry": "AR"
		},
		"openingHoursSpecification": [
			{
				"@type": "OpeningHoursSpecification",
				"dayOfWeek": [
					"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
				],
				"opens": "09:00",
				"closes": "18:00"
			}
		],
		"sameAs": [
			"https://facebook.com/inmob.flora.cordeiro",
			"https://instagram.com/floracordeiro_inmobiliaria"
		]
	};

	return (
		<html lang="es">
		<body className={`${cactus.className}`}>
		{/* Script JSON-LD inyectado correctamente en el body */}
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
		/>

		<NavBar />
		{children}
		<WhatsAppRedirection />
		<Footer />
		</body>
		</html>
	);
}