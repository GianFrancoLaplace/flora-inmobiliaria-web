"use client"

import styles from "./Administration.module.css";
import { cactus } from "@/app/(views)/ui/fonts";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { DeleteProperty } from "@/hooks/DeleteProperty";
import { useRouter } from "next/navigation";
import { PropertyWithImages } from "@/types/prisma";

type Props = {
	properties: PropertyWithImages[];
};

export default function Administration({ properties }: Props) {
	const router = useRouter();
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [propertyToDelete, setPropertyToDelete] = useState<PropertyWithImages | null>(null);

	const {
		deleteProperty,
		isDeleting,
		deleteError
	} = DeleteProperty();

	const handleDeleteClick = (property: PropertyWithImages) => {
		setPropertyToDelete(property);
		setShowConfirmModal(true);
	};

	const handleCancelDelete = () => {
		setShowConfirmModal(false);
		setPropertyToDelete(null);
	};

	const handleConfirmDelete = async () => {
		if (!propertyToDelete) return;
		try {
			const response = await deleteProperty(propertyToDelete.idProperty);
			if (response) {
				router.refresh();
				setShowConfirmModal(false);
				setPropertyToDelete(null);
			}
		} catch (e) {
			console.error(e);
		}
	};

	const formatPrice = (price: number) =>
		`USD ${price.toLocaleString('es-AR')}`;

	return (
		<div>
			<div className={`${styles.headerSection} ${cactus.className}`}>
				<h1 className={styles.publicationsTitle}>Publicaciones activas</h1>

				<div className={styles.sectionProperties}>
					<Link href="/administracion/crear" className={styles.linkProperties}>
						<button className={`${styles.buttonNewPublication} ${cactus.className}`}>
							Crear publicación
						</button>
					</Link>
				</div>
			</div>

			{deleteError && (
				<div className={styles.statusContainer}>
					<p>Error al eliminar: {deleteError}</p>
				</div>
			)}

			{properties.length === 0 ? (
				<div className={`${styles.statusContainer} ${styles.statusContainerEmpty}`}>
					<h4>No se encontraron propiedades con los filtros aplicados.</h4>
				</div>
			) : (
				<div className={styles.cardsProperties}>
					{properties.map((prop) => (
						<div key={prop.idProperty} className={`${styles.cardProperties} ${cactus.className}`}>
							<div className={styles.imageContainer}>
								<Image
									src={prop.images[0]?.url?.trim() || "/backgrounds/notImage.jpg"}
									alt={`Propiedad en ${prop.address}`}
									width={285}
									height={220}
									className={styles.imageProperties}
								/>
							</div>

							<Link href={`/propiedades/ficha/${prop.slug}`} className={styles.linkProperties}>
								<div className={`${styles.infoProperties} ${cactus.className}`}>
									<div className={styles.priceProperties}>
										<h2>{formatPrice(prop.price)}</h2>
									</div>
									<div className={styles.restInfoProperties}>
										<h4>{prop.address}, {prop.city}</h4>
										<h4>{prop.bedrooms} ambientes | {prop.bedrooms} dormitorios | {prop.bathrooms} baños</h4>
									</div>
								</div>
							</Link>

							<div className={styles.buttonsProperties}>
								<button
									onClick={(e) => {
										e.preventDefault();
										router.push(`/administracion/${prop.slug}/edit`);
									}}
									type="button"
									aria-label="Editar propiedad"
								>
									<Image
										src="/icons/iconoEdit.png"
										alt=""
										width={25}
										height={25}
									/>
								</button>
								<button
									onClick={(e) => {
										e.preventDefault();
										handleDeleteClick(prop);
									}}
									type="button"
									aria-label="Eliminar propiedad"
								>
									<Image
										src="/icons/deleteIcon.png"
										alt=""
										width={25}
										height={25}
									/>
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{showConfirmModal && propertyToDelete && (
				<div className={styles.modalOverlay}>
					<div className={`${styles.modalContent} ${cactus.className}`}>
						<h3>¿Desea eliminar la publicación?</h3>
						<span>Esta acción no se puede deshacer.</span>
						<div className={styles.modalButtons}>
							<button
								onClick={handleConfirmDelete}
								className={`${styles.deleteButton} ${cactus.className}`}
								disabled={isDeleting}
								type="button"
							>
								Sí, deseo eliminarla
							</button>
							<button
								onClick={handleCancelDelete}
								className={`${styles.cancelButton} ${cactus.className}`}
								type="button"
							>
								No, gracias
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}