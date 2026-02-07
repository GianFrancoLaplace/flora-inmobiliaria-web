import Link from 'next/link';
import styles from './PropertyView.module.css';
import { cactus } from "@/app/(views)/ui/fonts";
import ContactInformation from "@/components/features/ContactInformation/ContactInformation";
import PropertyCarousel from './Carrousel/PropertyCarrousel';
import PropertyItem from './PropertiesItem';
import type { PropertyWithImages } from '@/types/prisma';

type PropertyViewProps = {
	property: PropertyWithImages;
};

/**
 * FUNDAMENTO: Componente de presentación puro (presentational component)
 * Recibe data, renderiza UI, zero lógica de negocio
 * Es como Vision después de que Thanos le arranca la gema - solo forma sin poder, pero hermosa forma
 */
export default function PropertyView({ property }: PropertyViewProps) {
	// Mapeo de tipos de enum a labels legibles
	const operationLabels = {
		alquiler: 'Alquiler',
		venta: 'Venta',
	};

	const typeLabels = {
		casa: 'Casa',
		departamento: 'Departamento',
		campo: 'Campo',
		local_comercial: 'Local Comercial',
		lote: 'Lote',
	};

	const encodedAddress = encodeURIComponent(
		property.address || 'Tandil, Buenos Aires, Argentina'
	);

	return (
		<div className={styles.page}>
			<ContactInformation />

			{/* Header con dirección */}
			<div className={styles.mainAdressProperties}>
				<h1>{property.address}</h1>
			</div>

			{/* Carrusel de imágenes - Client Component porque tiene interactividad */}
			<div className={styles.mediaCarouselProperties}>
				<PropertyCarousel images={property.images} />
			</div>

			{/* Info principal */}
			<div className={styles.main}>
				<div className={styles.mainInfo}>
					<h1>{property.address}</h1>
					<h1>
						| {operationLabels[property.category]} | {typeLabels[property.type]}
					</h1>
				</div>
				<div className={styles.buttonsProperties}>
					<Link href="https://wa.me/2494208037" className={styles.linkProperties}>
						<button type="button" className={`${styles.askBtn} ${cactus.className}`}>
							Consultar
						</button>
					</Link>
				</div>
			</div>

			{/* Precio */}
			<div className={styles.mainInfoPrice}>
				<h1>USD {property.price.toLocaleString('es-AR')}</h1>
			</div>

			{/* Descripción */}
			<div className={styles.descriptionsProperties}>
				<div className={styles.titleProperties}>
					<h2>Descripción</h2>
				</div>
				<h5>{property.description}</h5>
			</div>

			{/* Ficha técnica con características */}
			<div className={styles.descriptionsProperties}>
				<div className={styles.titleProperties}>
					<h2>Ficha Técnica</h2>
				</div>
				<div className={styles.dataGridProperties}>
					<div className={styles.sectionProperties}>
						{/* Características desde la DB directamente */}
						{property.surface && (
							<PropertyItem
								imgSrc="/icons/superficie.png"
								label="Superficie"
								value={`${property.surface} m²`}
							/>
						)}
						{property.bedrooms && (
							<PropertyItem
								imgSrc="/icons/dormitorios.png"
								label="Dormitorios"
								value={property.bedrooms}
							/>
						)}
						{property.bathrooms && (
							<PropertyItem
								imgSrc="/icons/banos.png"
								label="Baños"
								value={property.bathrooms}
							/>
						)}
						{property.garage && (
							<PropertyItem
								imgSrc="/icons/cochera.png"
								label="Cocheras"
								value={property.garage}
							/>
						)}
						{property.floors && (
							<PropertyItem
								imgSrc="/icons/plantas.png"
								label="Plantas"
								value={property.floors}
							/>
						)}
						{property.constructedArea && (
							<PropertyItem
								imgSrc="/icons/superficie_cubierta.png"
								label="Superficie Cubierta"
								value={`${property.constructedArea} m²`}
							/>
						)}
					</div>
				</div>
			</div>

			{/* Ubicación con mapa */}
			<div className={styles.descriptionsProperties}>
				<div className={styles.titleProperties}>
					<h2>Ubicación</h2>
				</div>
				{property.ubication && <h5>{property.ubication}</h5>}
				<div className={styles.mapaInteractivo}>
					<iframe
						src={`https://www.google.com/maps?q=${encodedAddress}&output=embed`}
						width="1300"
						height="400"
						loading="lazy"
						referrerPolicy="no-referrer-when-downgrade"
					></iframe>
				</div>
			</div>
		</div>
	);
}