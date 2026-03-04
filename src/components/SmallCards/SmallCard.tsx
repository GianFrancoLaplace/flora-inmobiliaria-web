import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, Car, Maximize2, Building2 } from "lucide-react";
import styles from "./SmallCard.module.css";
import type { PropertyWithImages } from "@/types/prisma";
import { TYPE_LABELS, OPERATION_LABELS, getVisibleSpecs } from "@/utils/propertyUtils";

type Props = {
	property: PropertyWithImages;
};

const money = (value: number) =>
	new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(value);

export default function SmallCard({ property }: Props) {
	const imageSrc =
		property.images?.[0]?.url?.trim() ||
		"/backgrounds/homeBackground.jpg";

	const badge = property.type ? TYPE_LABELS[property.type] : "Propiedad";
	const pill = property.category ? OPERATION_LABELS[property.category] : "Inmueble";

	const city = property.city ? `, ${property.city}` : "";
	const title = `${property.address || "Propiedad"}${city}`;

	const visibleSpecs = property.type
		? getVisibleSpecs(property.type, {
			bedrooms: property.bedrooms,
			bathrooms: property.bathrooms,
			garage: property.garage,
			surface: property.surface,
			constructedArea: property.constructedArea,
		})
		: {};

	const hasSpecs = Object.keys(visibleSpecs).length > 0;

	return (
		<Link href={`/propiedades/${property.slug}`} className={styles.card}>
			<div className={styles.media}>
				<Image
					src={imageSrc}
					alt={`Imagen de ${title}`}
					fill
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					className={styles.image}
					priority={false}
				/>

				<div className={styles.badge}>{badge}</div>

				<div className={styles.gradient} />
			</div>

			<div className={styles.body}>
				<div className={styles.topRow}>
					<p className={styles.price}>
						{property.price ? `${property.currency ?? "USD"} ${money(property.price)}` : "Consultar precio"}
					</p>
					<span className={styles.pill}>{pill}</span>
				</div>

				<h3 className={styles.title}>{title}</h3>

				{hasSpecs && (
					<div className={styles.specs}>
						{visibleSpecs.bedrooms != null && (
							<span className={styles.spec}>
								<BedDouble size={14} />
								{visibleSpecs.bedrooms} dorm.
							</span>
						)}
						{visibleSpecs.bathrooms != null && (
							<span className={styles.spec}>
								<Bath size={14} />
								{visibleSpecs.bathrooms} baños
							</span>
						)}
						{visibleSpecs.garage != null && (
							<span className={styles.spec}>
								<Car size={14} />
								{visibleSpecs.garage} garage
							</span>
						)}
						{visibleSpecs.surface != null && (
							<span className={styles.spec}>
								<Maximize2 size={14} />
								{visibleSpecs.surface} m²
							</span>
						)}
						{visibleSpecs.constructedArea != null && (
							<span className={styles.spec}>
								<Building2 size={14} />
								{visibleSpecs.constructedArea} m² cub.
							</span>
						)}
					</div>
				)}

				<div className={styles.ctaRow}>
					<span className={styles.cta}>Ver detalle</span>
					<span className={styles.arrow}>→</span>
				</div>
			</div>
		</Link>
	);
}
