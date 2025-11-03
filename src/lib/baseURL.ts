/**
 * Obtiene la base URL de la aplicación según el entorno
 *
 * FUNDAMENTO: Necesitamos URLs absolutas para:
 * - Open Graph metadata (Facebook, WhatsApp)
 * - Canonical URLs (SEO)
 * - Sitemap generation
 * - API calls desde el cliente
 *
 * Usa URLs relativas cuando sea posible para performance,
 * pero absolutas cuando el contexto lo requiera (metadata, emails, etc.)
 */
export function getBaseUrl(): string {
	// 1. Si estamos en el cliente, usar NEXT_PUBLIC_BASE_URL
	if (typeof window !== 'undefined') {
		return process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
	}

	// 2. Si estamos en Vercel (deployment), usar VERCEL_URL
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`
	}

	// 3. Si hay NEXT_PUBLIC_BASE_URL explícito (producción custom)
	if (process.env.NEXT_PUBLIC_BASE_URL) {
		return process.env.NEXT_PUBLIC_BASE_URL
	}

	// 4. Fallback a localhost (desarrollo)
	return 'http://localhost:3000'
}

/**
 * Construye una URL absoluta a partir de un path
 * @param path - Path relativo (ejemplo: '/propiedades/ficha/123')
 * @returns URL absoluta completa
 */
export function getAbsoluteUrl(path: string): string {
	const baseUrl = getBaseUrl()
	const cleanPath = path.startsWith('/') ? path : `/${path}`
	return `${baseUrl}${cleanPath}`
}

/**
 * Obtiene el dominio limpio (sin protocolo)
 * Útil para display en UI
 */
export function getDomain(): string {
	return process.env.NEXT_PUBLIC_DOMAIN || 'localhost:3000'
}

/**
 * Verifica si estamos en producción
 */
export function isProduction(): boolean {
	return process.env.NODE_ENV === 'production'
}

/**
 * Información de contacto (centralizada)
 */
export const CONTACT_INFO = {
	phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+54 XXX XXX XXXX', // COMPLETAR
	email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contacto@floracordeiro.com', // COMPLETAR
	whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '54XXXXXXXXXX', // COMPLETAR

	// Dirección de negocio
	address: {
		street: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || 'Dirección por definir', // COMPLETAR
		city: process.env.NEXT_PUBLIC_BUSINESS_CITY || 'Tandil',
		state: process.env.NEXT_PUBLIC_BUSINESS_STATE || 'Buenos Aires',
		postalCode: process.env.NEXT_PUBLIC_BUSINESS_POSTAL_CODE || '7000', // COMPLETAR
		country: process.env.NEXT_PUBLIC_BUSINESS_COUNTRY || 'AR',
	},

	// Helper para WhatsApp link
	getWhatsAppLink: (message?: string) => {
		const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '54XXXXXXXXXX'
		const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : ''
		return `https://wa.me/${number}${encodedMessage}`
	}
} as const