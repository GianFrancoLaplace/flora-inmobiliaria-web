"use client"

import styles from "./AdminCard.module.css";
import { cactus } from "@/app/(views)/ui/fonts";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PropertyWithImages } from "@/types/prisma";
import { TYPE_LABELS, OPERATION_LABELS, buildSpecsLine } from "@/utils/propertyUtils";

type Props = {
	property: PropertyWithImages;
	onDelete: (property: PropertyWithImages) => void;
};

export default function AdminCard({ property, onDelete }: Props) {
	const router = useRouter();

	const formatPrice = (price: number) =>
		`USD ${price.toLocaleString('es-AR')}`;

	const typeLabel = TYPE_LABELS[property.type];
	const operationLabel = OPERATION_LABELS[property.category];

	const specsLine = buildSpecsLine(property.type, {
		bedrooms: property.bedrooms,
		bathrooms: property.bathrooms,
		garage: property.garage,
		surface: property.surface,
		constructedArea: property.constructedArea,
	});

	const addressLine = property.city
		? `${property.address}, ${property.city}`
		: property.address;

	return (
		<Link
			href={`/propiedades/${property.slug}`}
			className={`${styles.cardProperties} ${cactus.className}`}
		>
			<div className={styles.imageContainer}>
				<Image
					src={property.images[0]?.url?.trim() || "/backgrounds/notImage.jpg"}
					alt={`Propiedad en ${property.address}`}
					width={285}
					height={220}
					className={styles.imageProperties}
				/>
			</div>

			<div className={`${styles.infoProperties} ${cactus.className}`}>
				<div className={styles.headerRow}>
					<div className={styles.priceProperties}>
						<h2>{formatPrice(property.price)}</h2>
					</div>

					<div className={styles.buttonsProperties}>
						<button
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								router.push(`/administracion/${property.slug}/editar`);
							}}
							type="button"
							aria-label="Editar propiedad"
							className={styles.editButton}
						>
							<Image
								src="/icons/iconoEdit.png"
								alt=""
								width={20}
								height={20}
							/>
						</button>
						<button
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onDelete(property);
							}}
							type="button"
							aria-label="Eliminar propiedad"
							className={styles.deleteButton}
						>
							<Image
								src="/icons/deleteIcon.png"
								alt=""
								width={20}
								height={20}
							/>
						</button>
					</div>
				</div>

				<div className={styles.restInfoProperties}>
					<h4>{addressLine}</h4>
					<h4>{typeLabel} · {operationLabel}</h4>
					{specsLine && <h4>{specsLine}</h4>}
				</div>
			</div>
		</Link>
	);
}