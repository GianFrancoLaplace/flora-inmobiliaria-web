import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl
	const title = searchParams.get('title') || 'Flora Cordeiro Inmobiliaria'
	const price = searchParams.get('price')
	const address = searchParams.get('address')

	return new ImageResponse(
		(
			<div
				style={{
					background: 'linear-gradient(135deg, #fada4d 0%, #ffdc2b 100%)',
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					fontFamily: 'system-ui',
					padding: '60px',
				}}
			>
				{/* AGREGAR LOGO aquí si tenés */}
				<div style={{
					fontSize: 60,
					fontWeight: 'bold',
					color: '#202020',
					marginBottom: 20,
					textAlign: 'center',
				}}>
					{title}
				</div>

				{address && (
					<div style={{
						fontSize: 36,
						color: '#353535',
						marginBottom: 10,
					}}>
						📍 {address}
					</div>
				)}

				{price && (
					<div style={{
						fontSize: 48,
						fontWeight: 'bold',
						color: '#202020',
						marginTop: 20,
					}}>
						${parseInt(price).toLocaleString('es-AR')}
					</div>
				)}

				<div style={{
					fontSize: 28,
					color: '#626262',
					marginTop: 'auto',
				}}>
					Flora Cordeiro Inmobiliaria • Tandil
				</div>
			</div>
		),
		{
			width: 1200,
			height: 630,
		}
	)
}