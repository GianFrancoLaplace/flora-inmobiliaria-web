import type { Metadata } from "next";
import './(views)/ui/globals.css';
import { cactus } from "@/app/(views)/ui/fonts";
import NavBar from "@/components/NavBar/NavBar";
import Footer from "@/components/Footer/Footer";
import WhatsAppRedirection from "@/components/WhatsAppRedirection/WhatsAppRedirection";

// export const metadata: Metadata = {
//   title: "Flora Cordeiro Inmobiliaria",
//   description: "Created by Magno",
//   icons: {
//     icon: '/logos/footerLogo.png',
//   },
// };

export const metadata: Metadata = {
	metadataBase: new URL('https://flora-cordeiro-inmobiliaria.vercel.app/'),

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

	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},

	// Open Graph (Facebook, WhatsApp, LinkedIn)
	openGraph: {
		type: 'website',
		locale: 'es_AR',
		url: 'https://flora-cordeiro-inmobiliaria.vercel.app/',
		siteName: 'Flora Cordeiro Inmobiliaria',
		title: 'Flora Cordeiro - Tu Inmobiliaria de Confianza en Tandil',
		description: 'Encontrá tu próxima propiedad en Tandil. Casas, departamentos, terrenos y más. Atención personalizada.',
		images: [
			{
				url: '/og-image.jpg', // Crear
				width: 1200,
				height: 630,
				alt: 'Flora Cordeiro Inmobiliaria - Tandil',
			}
		],
	},

	// Verificación de plataformas (si las usas)
	verification: {
		google: 'tu-codigo-google-search-console', // Agregar cuando tengas
		// facebook: 'tu-codigo-facebook',
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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Flora Cordeiro Inmobiliaria",
    "image": "https://flora-cordeiro-inmobiliaria.vercel.app/logos/footerLogo.png",
    "@id": "",
    "url": "https://flora-cordeiro-inmobiliaria.vercel.app/",
    "telephone": "+54 9 2494 208037",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "14 de Julio 796",
      "addressLocality": "Tandil",
      "addressRegion": "Buenos Aires",
      "postalCode": "7000",
      "addressCountry": "AR"
    },
    "openingHours": "Mo-Fr 09:00-18:00",
    "sameAs": [
      "https://facebook.com/inmob.flora.cordeiro",
      "https://instagram.com/floracordeiro_inmobiliaria"
    ]
  };

  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="Styles.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-site-verification" content="5XxYTljI-V7ytErFMbV1yrAL6QzawUMcHoEZhvU7iHg" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${cactus.className}`}>
        <NavBar />
        {children}
        <WhatsAppRedirection />
        <Footer />
      </body>
    </html>
  );
}
