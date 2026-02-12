"use client"

import styles from "./Administration.module.css";
import { cactus } from "@/app/(views)/ui/fonts";
import Link from "next/link";
import { useState } from "react";
import { DeleteProperty } from "@/hooks/DeleteProperty";
import { useRouter } from "next/navigation";
import { PropertyWithImages } from "@/types/prisma";
import AdminCard from "@/components/Administracion/AdminCard/AdminCard";

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
						<AdminCard
							key={prop.idProperty}
							property={prop}
							onDelete={handleDeleteClick}
						/>
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