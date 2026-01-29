import styles from './PropertyForm.module.css';
import BasicInfoSection from "@/components/PropertyForm/BasicInfoSection/BasicInfoSection";
import MediaSection from "@/components/PropertyForm/MediaSection/MediaSection";
import LocationSection from "@/components/PropertyForm/LocationSection/LocationSection";
import DescriptionSection from "@/components/PropertyForm/DescriptionSection/DescriptionSection";


interface PropertyFormProps {
	mode: 'create' | 'edit';
	propertyTitle?: string;
	propertyId?: string;
}

export default function PropertyForm({ mode, propertyTitle, propertyId }: PropertyFormProps) {
	const hasErrors = false; // Para mostrar el diseño del error
	const isSubmitting = false;

	return (
		<div className={styles.formContainer}>
			{/* Header con indicador de modo */}
			<div className={mode === 'edit' ? styles.headerEdit : styles.headerCreate}>
				{mode === 'edit' ? (
					<div className={styles.headerContent}>
						<p className={styles.modeTitle}>Editando propiedad</p>
						{propertyTitle && (
							<p className={styles.propertyTitle}>{propertyTitle}</p>
						)}
						{propertyId && (
							<span className={styles.idBadge}>ID: {propertyId}</span>
						)}
					</div>
				) : (
					<div className={styles.headerContent}>
						<p className={styles.modeTitle}>Nueva propiedad</p>
					</div>
				)}
			</div>

			<form className={styles.form}>

				{/* Resumen de errores */}
				{hasErrors && (
					<div className={styles.errorSummary}>
						<p className={styles.errorTitle}>
							Hay 3 errores que corregir:
						</p>
						<ul className={styles.errorList}>
							<li>El título es obligatorio</li>
							<li>El precio debe ser mayor a 0</li>
							<li>Debes seleccionar al menos una imagen</li>
						</ul>
					</div>
				)}

				<BasicInfoSection />
				<MediaSection mode={mode} />
				<LocationSection />
				<DescriptionSection />

				{/* Botones de acción */}
				<div className={styles.actions}>
					<button
						type="button"
						className={styles.btnSecondary}
					>
						Cancelar
					</button>

					<button
						type="submit"
						className={styles.btnPrimary}
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<>
								<span className={styles.spinner}></span>
								{mode === 'edit' ? 'Guardando...' : 'Creando...'}
							</>
						) : (
							mode === 'edit' ? 'Guardar cambios' : 'Crear propiedad'
						)}
					</button>
				</div>

				{/* Indicador de autoguardado */}
				{mode === 'edit' && (
					<p className={styles.draftIndicator}>Borrador guardado automáticamente</p>
				)}
			</form>
		</div>
	);
}