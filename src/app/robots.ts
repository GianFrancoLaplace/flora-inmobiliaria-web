import { MetadataRoute } from 'next'
import { getBaseUrl } from '@/lib/baseURL'

export default function robots(): MetadataRoute.Robots {
	const baseUrl = getBaseUrl()

	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: [
					'/administracion/', // NO indexar panel admin
					'/login/',
					'/api/',
					'/form/' // página vacía que vi
				],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	}
}