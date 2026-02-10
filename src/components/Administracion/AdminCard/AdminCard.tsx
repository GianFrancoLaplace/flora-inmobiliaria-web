"use client"

import styles from "./AdminCard.module.css";
import { cactus } from "@/app/(views)/ui/fonts";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PropertyWithImages } from "@/types/prisma";

type Props = {
	property: PropertyWithImages;
	onDelete: (property: PropertyWithImages) => void;
};

export default function AdminCard({ property, onDelete }: Props) {
	const router = useRouter();

	const formatPrice = (price: number) =>
		`USD ${price.toLocaleString('es-AR')}`;

	return (
		<div className={`${styles.cardProperties} ${cactus.className}`}>
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

				<Link href={`/propiedades/${property.slug}`} className={styles.linkProperties}>
					<div className={styles.restInfoProperties}>
						<h4>{property.address}, {property.city}</h4>
						<h4>{property.bedrooms} ambientes | {property.bedrooms} dormitorios | {property.bathrooms} baños</h4>
					</div>
				</Link>
			</div>
		</div>
	);
}